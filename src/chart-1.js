import * as d3 from 'd3'

var margin = { top: 30, left: 30, right: 30, bottom: 30 }
var height = 400 - margin.top - margin.bottom
var width = 780 - margin.left - margin.right

// At the very least you'll need scales, and
// you'll need to read in the file. And you'll need
// an svg, too, probably.

// Here's an svg
var svg = d3
  .select('#chart-1')
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
  .outerRadius(150)

// A larger circle, for labels
var labelArc = d3
  .arc()
  .innerRadius(160)
  .outerRadius(160)

// Color scale
var colorScale = d3.scaleOrdinal().range(['#f5f5f5', '#5ab4ac', '#d8b365'])

// Angle scale
var angleScale = d3
  .scaleBand()
  .range([0, Math.PI * 2])

// Read in the time-breakdown data
d3.csv(require('./data/time-breakdown.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  console.log(datapoints)
  // Move the holder to the center(ish) of the svg
  var holder = svg.append('g').attr('transform', 'translate(200,200)')

  let minutes = datapoints.map(d => +d.minutes)
  angleScale.domain(d3.extent(minutes))

  // Append the pie chart
  holder
    .selectAll('path')
    .data(pie(datapoints))
    .enter()
    .append('path')
    .attr('d', d => arc(d))
    .attr('fill', d => colorScale(d.data.task))

  holder
    .selectAll('.label-text')
    .data(datapoints)
    .enter()
    .append('text')
    .text(d => d.task)
    .attr('d', d => labelArc(pie))
    .attr('text-anchor', 'middle')
    .attr('transform', function(d) {
      return 'translate(' + labelArc.centroid(d) + ',' + 0 + ')'
    })
    .attr('text-anchor', function(d) {
      if (d.startAngle > Math.PI) {
        return 'end'
      } else {
        return 'start'
      }
    })
}
