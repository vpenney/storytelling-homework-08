import * as d3 from 'd3'

let margin = { top: 20, left: 0, right: 0, bottom: 0 }
let height = 400 - margin.top - margin.bottom
let width = 400 - margin.left - margin.right

let svg = d3
  .select('#chart-6')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var radius = 160

// radiusScale based on score
var radiusScale = d3
  .scaleLinear()
  .domain([0, 5])
  .range([0, radius])

// angleScale based on category
var angleScale = d3.scaleBand().range([0, Math.PI * 2])

// Area chart generator
var line = d3
  .radialLine()
  .radius(d => radiusScale(d.score))
  .angle(d => angleScale(d.category))

d3.csv(require('./data/ratings.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  datapoints.push(datapoints[0])
  var holder = svg.append('g').attr('transform', function(d) {
    return `translate(${width / 2}, ${height / 2})`
  })

  // Mapping categories to define angleSclae domain
  // by category
  let categories = datapoints.map(d => d.category)
  angleScale.domain(categories)

  let bands = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

  // Funky abstract rating shape
  holder
    .append('path')
    .datum(datapoints)
    .attr('d', line)
    .attr('fill', 'red')
    .attr('opacity', 0.3)
    .attr('stroke', 'black')

  // Scale bands/ circles (what are these called?)
  holder
    .selectAll('.scale-band')
    .data(bands)
    .enter()
    .append('circle')
    .attr('r', d => radiusScale(d))
    .attr('stroke', 'lightgrey')
    .attr('fill', 'none')
    .attr('cx', 0)
    .attr('cy', 0)
    .lower()

  holder
    .selectAll('.guide-lines')
    .data(categories)
    .enter()
    .append('line')
    .attr('d', d => d.key)
    .attr('x', 0)
    .attr('y1', 0)
    .attr('y2', -radiusScale(5.25))
    .attr('transform', d => {
      let degrees = (angleScale(d) / Math.PI) * 180
      return `rotate(${degrees})`
    })
    .attr('stroke', 'grey')
    .style('stroke-dasharray', (3, 2))

  holder
    .selectAll('.category-label')
    .data(angleScale.domain())
    .enter()
    .append('text')
    .text(d => d)
    .attr('text-anchor', 'middle')
    .attr('x', 0)
    .attr('y', -radiusScale(5.5))
    .attr('transform', d => {
      let degrees = (angleScale(d) / Math.PI) * 180
      return `rotate(${degrees})`
    })
}
