import * as d3 from 'd3'

var margin = { top: 30, left: 30, right: 30, bottom: 30 }
var height = 400 - margin.top - margin.bottom
var width = 780 - margin.left - margin.right

var svg = d3
  .select('#chart-3')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let radius = 200

let radiusScale = d3
  .scaleLinear()
  .range([0, radius])
  .domain([0, 100])

let months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec'
]

// Scale to split pie chart into months
var angleScale = d3
  .scaleBand()
  .domain(months)
  .range([0, Math.PI * 2])

// Color scale
var colorScale = d3
  .scaleLinear()
  .range(['#c6dbef', '#fcc5c0'])

// Pie generator
// var pie = d3.pie().value(1 / 12)

var arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(d => radiusScale(d.high_temp))
  .startAngle(d => angleScale(d.month_name))
  .endAngle(d => angleScale(d.month_name) + angleScale.bandwidth())

d3.csv(require('./data/ny-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  datapoints.push(datapoints[0])

  // Set domain for radiusScale based on observed high temp
  let hightemp = datapoints.map(d => +d.high_temp)
  // Highest high temperature
  let tempHigh = d3.max(hightemp)
  // Lowest high temperature
  let tempLow = d3.min(hightemp)

  colorScale.domain([tempLow, tempHigh])

  var holder = svg
    .append('g')
    // .attr('transform', 'translate(200,200)')
    .attr('transform', `translate(${width / 2},${height / 2})`)

  holder
    .selectAll('.temp-bar')
    .data(datapoints)
    .enter()
    .append('path')
    .attr('d', d => arc(d))
    .attr('fill', d => colorScale(d.high_temp))

  holder
    .append('text')
    .text('NYC high temperatures, by month')
    .attr('text-anchor', 'middle')
    .attr('font-size', 24)
    .attr('font-weight', 'bold')
    .attr('dy', -130)
}
