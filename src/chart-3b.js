import * as d3 from 'd3'

var margin = { top: 30, left: 30, right: 30, bottom: 30 }
var height = 400 - margin.top - margin.bottom
var width = 1080 - margin.left - margin.right

var svg = d3
  .select('#chart-3b')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let radius = 90

let radiusScale = d3
  .scaleLinear()
  .range([0, radius])
  .domain([0, 110])

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
var colorScale = d3.scaleLinear().range(['#c6dbef', '#fcc5c0'])

// xPositionScale to space out the mini charts
var xPositionScale = d3
  .scaleBand()
  .range([0, width])
  .padding(0.3)

var arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(d => radiusScale(d.high_temp))
  .startAngle(d => angleScale(d.month_name))
  .endAngle(d => angleScale(d.month_name) + angleScale.bandwidth())

d3.csv(require('./data/all-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  datapoints.push(datapoints[0])

  // Nest the data by month
  var nested = d3
    .nest()
    .key(d => d.city)
    .entries(datapoints)

  // Get a list of cities
  let city = nested.map(d => d.key)

  // Define domain for xPositionScale
  xPositionScale.domain(city)

  // Set domain for radiusScale based on observed high temp
  let hightemp = datapoints.map(d => +d.high_temp)
  // Highest high temperature
  let tempHigh = d3.max(hightemp)
  // Lowest high temperature
  let tempLow = d3.min(hightemp)

  // Set the domain for the colorScale
  colorScale.domain([tempLow, tempHigh])

  svg
    .selectAll('.city-temps')
    .data(nested)
    .enter()
    .append('g')
    .attr('transform', function(d) {
      return `translate(${xPositionScale(d.key) + 45}, ${height / 2})`
    })
    .each(function(d) {
      var container = d3.select(this)

      container
        .selectAll('.temp-bar')
        .data(d.values)
        .enter()
        .append('path')
        .attr('d', d => arc(d))
        .attr('fill', d => colorScale(d.high_temp))

      // This needs to be centered properly
      container
        .selectAll('label-text')
        .data(nested)
        .enter()
        .append('text')
        .attr('d', d => d.key)
        .text(d.key)
        .attr('dy', 120)
        .attr('text-anchor', 'middle')
    })
}
