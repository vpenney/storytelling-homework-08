import * as d3 from 'd3'

var margin = { top: 30, left: 30, right: 30, bottom: 30 }
var height = 400 - margin.top - margin.bottom
var width = 780 - margin.left - margin.right

// A mini svg for all these fun pie charts
var container = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Pie angles thing
var pie = d3.pie().value(function(d) {
  return d.minutes
})

// Making a circle
var arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(100)

// Position scales
var xPositionScale = d3
  .scaleLinear()
  .range([0, width])

// Color scale
var colorScale = d3.scaleOrdinal().range(['#b2df8a', '#1f78b4', '#a6cee3'])

d3.csv(require('./data/time-breakdown-all.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  // Get a list of projects
  let projects = datapoints.map(d => +d.project)

  // Define domain for xPositionScale
  xPositionScale.domain(d3.extent(projects))

  var nested = d3
    .nest()
    .key(d => d.project)
    .entries(datapoints)

  container
    .selectAll('.mini-pies')
    .data(nested)
    .enter()
    .append('g')
    .attr('transform', 'translate(' + (d => xPositionScale(projects)) + ',' + '30)')
    .each(function(d) {
      var container = d3.select(this)
      console.log(d.values)

      container
        .append('path')
        .data(pie(nested))
        .attr('d', d => arc(d.values.minutes))
        .attr('fill', d => colorScale(d.values.task))
    })
}
