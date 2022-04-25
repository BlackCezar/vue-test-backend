var express = require('express');
var router = express.Router();
var _ = require('lodash');
var path = require('path');

router.get('/companies', (req, res) => {
  const companies = require('./../storage/companies.json')

  res.json(companies)
})

router.get('/companies/:id/image', (req, res) => {
  const companies = require('./../storage/companies.json')
  const company = companies.find(comp => comp.id === req.params.id)

  if (company) {
    let imgPath = __dirname + './../public/images/' + company.logo
    res.sendFile(path.resolve(imgPath) )
  } else res.sendStatus(400)
})


router.get('/tickets', (req, res) => {
  let tickets = require('./../storage/tickets.json')

  if (tickets && tickets.length) {
    const segments = require('./../storage/segments.json')
    
    tickets = tickets.map(ticket => {
      if (ticket.segments && ticket.segments.length) {
        ticket.segments = ticket.segments.map(segment => {
          return segments.find(item => item.id === segment) || segment
        })
        ticket.stops = ticket.segments.length
        ticket.duration = 0 
        for (let segment of ticket.segments) {
          ticket.duration += segment.duration
          ticket.stops += segment.stops.length
        }
        return ticket
      }
    })
  }

  if ('filters' in req.query) {
    const companies = require('./../storage/companies.json')
    let filters = JSON.parse(req.query.filters)

    if (filters.company) {
      tickets = tickets.filter(ticket => {
        let company = companies.find(c => c.id === ticket.companyId)
        return company.name === filters.company ? company : false
      })
    }
    if (filters.transferCounts && filters.transferCounts.length) {
      console.dir(filters.transferCounts)
      tickets = tickets.filter(ticket => {
        let stops = ticket.stops - ticket.segments.length 
        return filters.transferCounts.indexOf(stops.toString()) !== -1 ? ticket : false
      })
    }
  }

  if ('sort' in req.query) {
    switch (req.query.sort) {
      case 'Cheapest': tickets = _.sortBy(tickets, 'price'); break;
      case 'Fastest': tickets = _.sortBy(tickets, 'duration', 'price'); break; 
      case 'Optimal': tickets = _.sortBy(tickets, ['stops', 'price', 'duration']); break; 
    }
  }
  if ('limit' in req.query) {
    let skip = parseInt(req.query.skip || 0)
    tickets = tickets.slice(skip, skip + parseInt(req.query.limit))
  }


  res.json(tickets)
})

router.get('/segments', (req, res) => {
  let segments = require('./../storage/segments.json')

  res.json(segments)
})



module.exports = router;
