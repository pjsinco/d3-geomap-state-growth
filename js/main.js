var margin = { 
  top: 20,
  bottom: 20,
  left: 20,
  right: 20
};

var margin2 = {
  top: 20,
  bottom: 20,
  left: 20,
  right: 20
};

var width = 655 - margin.left - margin.right;
var height = 437 - margin.top - margin.bottom;

var width2 = 655 - margin2.left - margin2.right;
var height2 = 200 - margin2.top - margin2.bottom;

var svg = d3.select('.vis').append('svg')
  //.attr('width', width + margin.left + margin.right)
  //.attr('height', width + margin.top + margin.bottom)
  .attr('viewBox', '0 0 ' + width + ' ' + height)
  .classed('context', true)

var g = svg.append('g')
  .classed('country', true)
  //.attr('transform', 'translate(' +
    //margin.left + ',' + margin.top + ')'
  //);

var focus = d3.select('.vis').append('svg')
  .attr('viewBox', '0 0 ' + width2 + ' ' + height2)
  .classed('context', true)

var projection = d3.geo.albersUsa()
  .translate([width / 2, height / 2])
  .scale([800])
  //.precision(0.1)
  //.translate([width, height])

var path = d3.geo.path()
  .projection(projection);

var buckets = [0.20, 0.30, 0.40, 0.50, 0.60];

var color = d3.scale.threshold()
  .domain(buckets)
  .range([
    'rgb(198,219,239)','rgb(158,202,225)', 'rgb(107,174,214)',
    'rgb(66,146,198)','rgb(33,113,181)', 'rgb(8,69,148)'
  ]);

/**
 * When mousing over a state, we need to move that <path> element to the 
 * front in order to properly expand the stroke width. Otherwise,
 * the stroke might be overlapped by other <path> elems.
 */
d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};


d3.csv('data/state-change.csv', function(csv) {
  csv = csv.map(function(d) {
    return {
      "2009": +d['2009'],
      "2010": +d['2010'],
      "2011": +d['2011'],
      "2012": +d['2012'],
      "2013": +d['2013'],
      "2014": +d['2014'],
      "state": d['state'],
      "pct_change": +d['pct_change']
    };
  });

  var minPctChange = d3.min(csv, function(d) {
    return d['pct_change'];
  });

  var maxPctChange = d3.max(csv, function(d) {
    return d['pct_change'];
  });

  console.log(minPctChange, maxPctChange);

  //color
    //.domain([minPctChange, maxPctChange]);

  d3.json('data/us-named.json', function(error, json) {
    var usMap = topojson.feature(json, json.objects.states);
    var csvLen = csv.length;

    // Merge the data from our CSV with our map
    for (var i = 0; i < csvLen; i++) {
      var csvState = csv[i].state;

      var featuresLen = usMap['features'].length;
      for (var j = 0; j < featuresLen; j++) {
        var jsonState = usMap['features'][j]['properties']['name'];
        if (csvState == jsonState) {
          usMap['features'][j]['properties']['pct_change'] = 
            csv[i].pct_change;
          usMap['features'][j]['properties']['count_2009'] = 
            csv[i]['2009'];
          usMap['features'][j]['properties']['count_2014'] = 
            csv[i]['2014'];
          break;
        }
      }
    }

  var legendGroup = g.append('g')
    .classed('legend-group', true);

    var legend = legendGroup.selectAll('.legend')
      .data(buckets)
      .enter()
      .append('g')
      .classed('legend', true)

    var legendW = 20, legendH = 20;

    legend
      .append('rect')
      .attr({
        x: 20,
        y: function(d, i) {
          return height - (i * legendH) - (2 * legendH);
        },
        width: legendW,
        height: legendH,
      })
      .style({
        fill: function(d, i) {
          return color(d);
        }
      })

    legend
      .append('text')
      .attr({
        x: 50,
        y: function(d, i) {
          return height - (i * legendH) - legendH - 4;
        },
      })
      .text(function(d, i) {
        return buckets[i];
      });
    
    var states = g.selectAll('.state')
      .data(usMap.features)
      .enter()
      .append('path')
      .attr('d', path)
      .style('fill', function(d) {
        return color(d['properties']['pct_change']);
      })
      .classed('state', true)

    states
      .on('mouseover', stateMouseover)
      .on('mouseout', function() {
        d3.select(this).style('stroke-width', 1);
      });
  });
}); // d3.csv

function stateMouseover(d) {

  var sel = d3.select(this);
  sel.moveToFront();
  sel
    .style('stroke-width', '3');

  focus
    .select('text')
    .remove();
  
  focus
    .append('text')
    .attr('x', 10)
    .attr('y', 20)
    .text(function() {
      return d.properties.name + ' ' + 
        d.properties.pct_change
    })
}
