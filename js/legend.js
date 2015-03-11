console.log('hiya');

var margin = { 
  //top: 20,
  top: 0,
  bottom: 20,
  left: 0,
  right: 20
};

var width = 655 - margin.left - margin.right,
  height = 437 - margin.top - margin.bottom;

var svg = d3.select('.vis').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)

var data = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
var color = d3.scale.threshold()
  .domain(data)
  .range([
    'rgb(198,219,239)','rgb(158,202,225)', 'rgb(107,174,214)',
    'rgb(66,146,198)','rgb(33,113,181)', 'rgb(8,69,148)'
  ])

var yScale = d3.scale.linear()
  .domain(d3.range(data.length - 1))
  .range([0, 200])

var legendAxis = d3.svg.axis()
  .scale(yScale)
  .orient('right')
  .tickValues(d3.range(.2, .6, .1))
  .tickFormat(d3.format('%'))
  .innerTickSize(-25)
  .tickPadding(10)

svg
  .append('rect')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .attr('x', 0)
  .attr('y', 0)
  .attr('fill', 'aliceblue')

drawLegend();

function drawLegend() {

  var legendBoxWidth= 20, legendBoxHeight = 20;
  var legendGroup = svg.append('g')
    .classed('legend-group', true)
    .attr('width', 50)
    .attr('height', 100)
    .attr('x', 100)
    .attr('y', 100)

  var legendPctFormat = d3.format('%');
  var legendBuckets = [0.10, 0.20, 0.30, 0.40, 0.50, 0.60];

  var legend = legendGroup.selectAll('rect')
    .data(legendBuckets)
    .enter()
    .append('rect')
    .attr('x', 10)
    .attr('y', function(d) {
      return yScale(d);
    })
    .attr('width', legendBoxWidth)
    .attr('height', legendBoxWidth)
    .style('fill', function(d) {
      return color(d);
    })

  legendGroup
    .append('g')
    .classed('axis', true)
    .attr('transform', 'translate(35, 0)')
    .call(legendAxis)
  


}


