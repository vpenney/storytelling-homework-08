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
  .outerRadius(70)

// Position scales
var xPositionScale = d3.scaleBand().range([0, width])

// Color scale
var colorScale = d3.scaleOrdinal().range(['#fc8d59', '#ffffbf', '#91bfdb'])

d3.csv(require('./data/time-breakdown-all.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  var nested = d3
    .nest()
    .key(d => d.project)
    .entries(datapoints)

  // Get a list of projects
  let projects = nested.map(d => d.key)

  // Define domain for xPositionScale
  xPositionScale.domain(projects)

  container
    .selectAll('.mini-pies')
    .data(nested)
    .enter()
    .append('g')
    .attr('transform', function(d) {
      return `translate(${xPositionScale(d.key) + 45}, ${height / 2})`
    })
    .each(function(d) {
      var container = d3.select(this)

      container
        .selectAll('path')
        .data(pie(d.values))
        .enter()
        .append('path')
        .attr('d', d => arc(d))
        .attr('fill', function(d) {
          return colorScale(d.data.task)
        })

      // This needs to be centered properly
      container
        .selectAll('label-text')
        .data(nested)
        .enter()
        .append('text')
        .attr('d', d => d.key)
        .text(d.key)
        .attr('dy', 95)
        .attr('dx', -30)
        .attr('text-anchor', 'center')
    })
}
