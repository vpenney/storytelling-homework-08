import * as d3 from 'd3'

var margin = { top: 30, left: 30, right: 30, bottom: 30 }

var height = 450 - margin.top - margin.bottom

var width = 1080 - margin.left - margin.right

var svg = d3
  .select('#chart-5')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

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

let radius = 75

let radiusScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range([20, radius])

// Scale to split pie chart into months
var angleScale = d3
  .scaleBand()
  .domain(months)
  .range([0, Math.PI * 2])

// xPositionScale to space out the mini charts
var xPositionScale = d3
  .scaleBand()
  .range([0, width])
  .padding(0.3)

var arc = d3
  .radialArea()
  .innerRadius(d => radiusScale(d.low_temp))
  .outerRadius(d => radiusScale(d.high_temp))
  .angle(d => angleScale(d.month_name))
  .curve(d3.curveBasis)

d3.csv(require('./data/all-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {

  // Define band values
  let bands = [20, 40, 60, 80, 100]

  // Define labels for bands
  let bandLabels = [20, 60, 100]

  // Nest the data by month
  var nested = d3
    .nest()
    .key(d => d.city)
    .entries(datapoints)

  // Get a list of cities
  let city = nested.map(d => d.key)

  // Define domain for xPositionScale
  xPositionScale.domain(city)

  svg
    .selectAll('.city-temps')
    .data(nested)
    .enter()
    .append('g')
    .attr('transform', function(d) {
      return `translate(${xPositionScale(d.key) + 25}, ${height / 2})`
    })
    .each(function(d) {
      d.values.push(d.values[0])
      var container = d3.select(this)

      // Arc for NYC temperature
      container
        .append('path')
        .datum(d.values)
        .attr('d', d => arc(d))
        .attr('fill', '#fcc5c0')
        .attr('opacity', 0.8)

      // Band scales for temperature
      container
        .selectAll('.scale-band')
        .data(bands)
        .enter()
        .append('circle')
        .attr('r', d => radiusScale(d))
        .attr('fill', 'none')
        .attr('stroke', 'grey')
        .attr('cx', 0)
        .attr('cy', 0)

      // Labels for the bands
      container
        .selectAll('.scale-text')
        .data(bandLabels)
        .enter()
        .append('text')
        .text(d => d + '°')
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .attr('y', d => -radiusScale(d))
        .attr('dy', -3)
        .attr('font-size', 12)
        .attr('color', 'grey')

      container
        .datum(d.key)
        .append('text')
        .text(d => d)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
    })
}
