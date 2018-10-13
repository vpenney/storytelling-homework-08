import * as d3 from 'd3'

var margin = { top: 0, left: 0, right: 0, bottom: 0 }
var height = 600 - margin.top - margin.bottom
var width = 600 - margin.left - margin.right

var svg = d3
  .select('#chart-7')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var times = [
  '00:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00'
]

let bands = d3.range(0, 90000, 5000).reverse()

var radius = 400

var radiusScale = d3
  .scaleLinear()
  .domain([0, 90000])
  .range([0, radius])

var angleScale = d3.scaleLinear().range([0, Math.PI * 2])

var textScale = d3
  .scaleBand()
  .domain(times)
  .range([0, Math.PI * 2])

var colorScale = d3
  .scaleLinear()
  .range(['blue', 'red'])

var arc = d3
  .radialArea()
  .innerRadius(radiusScale(40000))
  .outerRadius(d => radiusScale(+d.total))
  .angle(d => {
    return angleScale(d.datetime)
  })

// A time parser o_0
let parseTime = d3.timeParse('%H:%M')

d3.csv(require('./data/time-binned.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  var holder = svg.append('g').attr('transform', function(d) {
    return `translate(${width / 2}, ${height / 2})`
  })

  // Convert hours and minutes to datetime
  datapoints.forEach(d => {
    d.datetime = parseTime(d.time)
  })

  // Mapping datetime to define angleSclae domain
  let timeRange = datapoints.map(d => d.datetime)
  angleScale.domain(d3.extent(timeRange))

  let babyCount = datapoints.map(d => d.total)
  let minBabies = d3.min(babyCount)
  let maxBabies = d3.max(babyCount)

  colorScale.domain([minBabies, maxBabies])

  // Add a path and mask
  holder
    .append('mask')
    .attr('id', 'births')
    .append('path')
    .datum(datapoints)
    .attr('d', arc)
    .attr('stroke', 'black')

  // Add some times
  holder
    .selectAll('.time-label')
    .data(times)
    .enter()
    .append('text')
    .text(d => {
      if (d === '00:00') {
        return 'Midnight'
      } else {
        return d.replace(':00', '')
      }
    })
    .attr('text-anchor', 'middle')
    .attr('x', 0)
    .attr('y', -radiusScale(55000))
    .attr('transform', d => {
      let degrees = (textScale(d) / Math.PI) * 180
      return `rotate(${degrees})`
    })
    .attr('font-size', 14)
    .style('fill', d => colorScale(d))

  holder
    .selectAll('.scale-band')
    .data(bands)
    .enter()
    .append('circle')
    .attr('r', d => radiusScale(d))
    .attr('fill', d => colorScale(d))
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('mask', 'url(#births)')
}
