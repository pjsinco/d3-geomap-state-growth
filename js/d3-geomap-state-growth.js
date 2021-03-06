var margin = { 
  //top: 20,
  top: 0,
  bottom: 20,
  left: 0,
  right: 20
};

var margin2 = {
  top: 400,
  bottom: 20,
  left: 0,
  right: 20
};

var width = 655 - margin.left - margin.right,
  height = 437 - margin.top - margin.bottom,
  width2 = 655 - margin2.left - margin2.right,
  height2 = 200 - margin2.top - margin2.bottom;

var svg = d3.select('.vis').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .call(responsivefy);

var context = svg.append('g')
  .classed('country', true)
  .attr('transform', 'translate(' +
    margin.left + ',' + margin.top + ')'
  );

var focus = svg.append('g')
  .classed('focus', true)
  .attr('width', width2 + margin2.left + margin2.right)
  .attr('height', height2 + margin2.top + margin2.bottom)
  .attr('transform', 'translate(' +
    margin2.left + ',' + margin2.top + ')'
  );

var defaultMapScale = 800;

var projection = d3.geo.albersUsa()
  .translate([width / 2, height / 2])
  .scale([defaultMapScale])

var path = d3.geo.path().projection(projection);

var buckets = [0.20, 0.30, 0.40, 0.50, 0.60];

var avgStateGrowth = 0.347;

var color = d3.scale.threshold()
  .domain(buckets)
  .range([
    'rgb(198,219,239)','rgb(158,202,225)', 'rgb(107,174,214)',
    'rgb(66,146,198)','rgb(33,113,181)', 'rgb(8,69,148)'
  ]);

var xScale = d3.scale.linear()
  .range([ margin2.left, (width2 - 50) ])

var rectHeight = 17;

var pctFormat = d3.format('.1%');


/**
 * Main
 *
 */
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

  xScale
    .domain([0, maxPctChange]);

  d3.json('data/us-named.json', function(error, json) {
    var usMap = topojson.feature(json, json.objects.states);
    var csvLen = csv.length;

    var kickoffState = json.objects.states.geometries[46];

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

    
    /**
     * Draw the map
     *
     */
    var states = context.selectAll('.state')
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
        d3.select(this)
          .style('stroke-width', 1)
          .style('stroke', '#fff');
      });

    // kickoff vis
    drawLegend();
    focusDrawBar(kickoffState);
    focusAddStateName(kickoffState);
    focusAddPercentage(kickoffState);
    drawAverageStateGrowth();
  });

}); // d3.csv


/**
 * Make the vis responsive
 *
 * http://www.brendansudol.com/posts/responsive-d3/
 *
 */
function responsivefy(svg) {
  /* get container + svg aspect ratio */
  var container = d3.select(svg.node().parentNode),
    width  = parseInt(svg.style('width')),
    height = parseInt(svg.style('height')),
    aspect = width / height;

  // add viewBox and preserveAspectRatio props,
  // and call resize so that svg resizes on initial page load
  svg
    .attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('preserveAspectRatio', 'xMinYMid')
    .call(resize)

  // to register multiple listeners for the same event type,
  // we need to namespace them, which we will using the id
  // of our svg's container
  d3.select(window)
    .on('resize.' + container.attr('id'), resize);

  function resize() {
    var targetWidth = parseInt(container.style('width'));
    svg
      .attr('width', targetWidth)
      .attr('height', Math.round(targetWidth / aspect));
  }
} // responsivefy

/**
 * Render focus info
 *
 */
function stateMouseover(d) {
  bringStateToTop(d);
  d3.select(this)
    .style('stroke-width', '2')
    .style('stroke', '#08306b');

  focus
    .select('rect')
    .remove();

  focus
    .selectAll('text')
    .remove();

  focusDrawBar(d);
  focusAddStateName(d);
  drawAverageStateGrowth();
  focusAddPercentage(d);
}

/**
 * IE9-compatible way to bring the state to the top
 * so we can properly outine it when moused-over
 *
 * see: http://stackoverflow.com/questions/14167863/
 *     how-can-i-bring-a-circle-to-the-front-with-d3
 */
function bringStateToTop(d) {
  d3.select('.country').selectAll('.state')
    .sort(function(a, b) {
      s = d.id; 
      return (a.id == s) - (b.id == s);
    });
}

/**
 * Indicate average state growth
 */
function drawAverageStateGrowth() {
  focus
    .select('.state-average-group')
    .remove();

  var avgGroup = focus
    .append('g')
    .classed('state-average-group', true)
    .attr('transform', 'translate(20,0)'
    );

  avgGroup
    .append('line')
    .classed('state-average', true)
    .attr('x1', function() {
      return xScale( avgStateGrowth );
    })
    .attr('x2', function() {
      return xScale( avgStateGrowth );
    })
    .attr('y1', 0)
    .attr('y2', 37)
    .style('fill', '#eaeaea')
    .style('stroke', '#eaeaea')
    .style('stroke-width', 1)

  avgGroup
    .append('text')
    .attr('x', function() {
      return xScale(avgStateGrowth) + 5;
    })
    .attr('y', 10)
    .text('State average: ' + pctFormat(avgStateGrowth))
    .attr('font-size', '12')
    .style('fill', '#b3b3b3')
}

/**
 * Draw the legend
 *
 */
function drawLegend() {
  var legendW = 20, legendH = 20;
  var legendGroup = context.append('g')
    .classed('legend-group', true)
    .attr('transform', 'translate(' + 
      (width - (legendW + 60)) + ',0)');

  var legendPctFormat = d3.format('%');
  var legendBuckets = [0.10, 0.20, 0.30, 0.40, 0.50, 0.60];
  var legend = legendGroup.selectAll('.legend')
    .data( legendBuckets )
    .enter()
    .append('g')
    .classed('legend', true)

  legend
    .append('rect')
    .attr({
      x: 0,
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

  var tickData = legendBuckets.filter(function(d, i){
      return i > 0;
  });

  var ticks = legendGroup.selectAll('.tick')
    .data(tickData)
    .enter()

  ticks
    .append('line')
    .classed('tick', true)
    .attr('x1', 0)
    .attr('x2', 25)
    .attr('y1', function(d, i) {
      return height - (i * legendH) - (2 * legendH);
    })
    .attr('y2', function(d, i) {
      return height - (i * legendH) - (2 * legendH);
    })
    .style('stroke', '#2a2a2a')
    //.style('stroke-width', '1')

  legend
    .append('text')
    .attr({
      x: 30,
      y: function(d, i) {
        return height - (i * legendH) - legendH + 5;
      },
    })
    .text(function(d, i) {
      if ( i == 0 ) return;
      return legendPctFormat(legendBuckets[i]);
    })
    .attr(
      'font-family', 
      "'proxima-nova', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    )
    .attr('font-size', '12')
}

/**
 * Draw the one bar in the focus area
 *
 */
function focusDrawBar(d) {
  focus
    .append('rect')
    .attr({
      x: 20,
      y: 20,
      width: function() {
        return xScale(d.properties.pct_change);
      },
      height: rectHeight
    })
    .style({
      fill: function() {
        return color(d.properties.pct_change);
      }
    });
}

/**
 * Add the state name to the focus area
 *
 */
function focusAddStateName(d) {
  // Print the state name
  focus
    .append('text')
    .attr('x', 20)
    .attr('y', 12)
    .text(function() {
      return d.properties.name
    })
    .attr(
      'font-family', 
      "'proxima-nova', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    );
}

/**
 * Add the percentage to the bar
 *
 */
function focusAddPercentage(d) {
  // Print the percentage
  focus
    .append('text')
    .attr('x', function() {
      return xScale(d.properties.pct_change) + 27;
    })
    .attr('y', 32)
    .text(function() {
      return pctFormat(d.properties.pct_change);
    })
    .attr(
      'font-family', 
      "'proxima-nova', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    )
    .attr('font-size', '12')
    .attr('text-anchor', 'start')
}

