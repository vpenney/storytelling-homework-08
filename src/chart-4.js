import * as d3 from 'd3'

var margin = { top: 30, left: 30, right: 30, bottom: 30 }
var height = 400 - margin.top - margin.bottom
var width = 780 - margin.left - margin.right

var svg = d3
  .select('#chart-4')
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

let radius = 200

let radiusScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range([20, radius])

// Scale to split pie chart into months
var angleScale = d3
  .scaleBand()
  .domain(months)
  .range([0, Math.PI * 2])

var arc = d3
  .radialArea()
  .innerRadius(d => radiusScale(d.low_temp))
  .outerRadius(d => radiusScale(d.high_temp))
  .angle(d => angleScale(d.month_name))
  .curve(d3.curveBasis)

d3.csv(require('./data/ny-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  datapoints.push(datapoints[0])
  // console.log(datapoints)

  let bands = [20, 30, 40, 50, 60, 70, 80, 90]

  let bandLabels = [30, 50, 70, 90]

  var holder = svg
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`)

  // Arc for NYC temperature
  holder
    .append('path')
    .datum(datapoints)
    .attr('d', d => arc(d))
    .attr('fill', '#c6dbef')
    .attr('opacity', 0.8)

  // Band scales for temperature
  holder
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
  holder
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

  // NYC center label
  // needs to be centered at centroid,
  // not text baseline
  holder
    .append('text')
    .text('NYC')
    .attr('text-anchor', 'middle')
    .attr('font-weight', 'bold')
    .attr('font-size', 24)
}
