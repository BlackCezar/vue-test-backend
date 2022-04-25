var express = require('express');
var router = express.Router();
var _ = require('lodash');
/* GET home page. */

router.get('/companies', (req, res) => {
  const companies = require('./../storage/companies.json')

  res.json(companies)
})


router.get('/tickets', (req, res) => {
  let tickets = require('./../storage/tickets.json')
  console.log(req.query)

  if (tickets && tickets.length) {
    const segments = require('./../storage/segments.json')
    
    tickets = tickets.map(ticket => {
      if (ticket.segments && ticket.segments.length) {
        ticket.segments = ticket.segments.map(segment => {
          return segments.find(item => item.id === segment) || segment
        })
        return ticket
      }
    })
  }

  if ('sort' in req.query) {
    switch (req.query.sort) {
      case 'Cheapest': tickets = _.sortBy(tickets, 'price'); break;
      case 'Fastest': tickets = _.sortBy(tickets, ticket => {
        return ticket.segments.reduce((prevSeg, currSeg) => currSeg ? currSeg.duration + prevSeg.duration : 0)
      }); break; 
      case 'Optimal': tickets = tickets.sort((a, b) => {
        a.price < b.price ? 1 : -1
      }).sort((a, b) => {
        let aDuration = a.segments.reduce((prevSeg, currSeg) => currSeg + prevSeg)
        let bDuration = b.segments.reduce((prevSeg, currSeg) => currSeg + prevSeg)
        aDuration < bDuration ? 1 : -1
      }); break; 
    }
  }
  if ('limit' in req.query) {
    tickets = tickets.slice(0, parseInt(req.query.limit))
  }


  res.json(tickets)
})

router.get('/segments', (req, res) => {
  let segments = require('./../storage/segments.json')

  res.json(segments)
})



module.exports = router;
