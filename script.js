let url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

let req = new XMLHttpRequest();

let values = [];
let baseTemp;

let svg = d3.select('svg');
let tooltip = d3.select('#tooltip');

let height = 600;
let width = 800;
let padding = 60;

let xScale;
let yScale;


let drawCanvas = () => {
  svg.attr('width', width);
  svg.attr('height', height);
};

let generateScales = () => {
  xScale = d3.scaleLinear().
  range([padding, width - padding]).
  domain([d3.min(values, item => {
    return item['year'];}),
  d3.max(values, item => {
    return item['year'];
  }) + 1]);
  yScale = d3.scaleTime().
  domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)]).
  range([height - padding, padding]);
};

let generateAxes = () => {

  let xAxis = d3.axisBottom(xScale).
  tickFormat(d3.format('d'));
  let yAxis = d3.axisLeft(yScale).
  tickFormat(d3.timeFormat('%B'));

  svg.append('g').
  call(xAxis).
  attr('id', 'x-axis').
  attr('transform', 'translate(0, ' + (height - padding) + ')');

  svg.append('g').
  call(yAxis).
  attr('id', 'y-axis').
  attr('transform', 'translate(' + padding + ', 0)');
};

let generateRect = () => {
  svg.selectAll('rect').
  data(values).
  enter().
  append('rect').
  attr('class', 'cell').
  attr('data-month', item => {
    return item['month'] - 1;
  }).
  attr('data-year', item => {
    return item['year'];
  }).
  attr('data-temp', item => {
    return item['variance'] + baseTemp;
  }).
  attr('height', item => {
    return (height - padding * 2) / 12;
  }).
  attr('y', item => {
    return yScale(new Date(0, item['month'], 0, 0, 0, 0, 0));
  }).
  attr('width', item => {
    let minYear = d3.min(values, item => {
      return item['year'];
    });

    let maxYear = d3.max(values, item => {
      return item['year'];
    });

    let yearCount = maxYear - minYear;

    return (width - 2 * padding) / yearCount;
  }).
  attr('x', item => {
    return xScale(item['year']);
  }).
  attr('fill', item => {
    let variance = item['variance'];
    if (variance <= -1) {
      return '#0d67f8';
    } else if (variance <= 0) {
      return '#0dc5f8';
    } else if (variance <= 1) {
      return '#f89e0d';
    } else {
      return '#f80d67';
    }
  }).
  on('mouseover', (event, item) => {
    tooltip.transition().duration(0).
    style('visibility', 'visible').
    style('left', event.pageX + 'px').
    style('top', event.pageY + 'px').
    attr('data-year', item['year']);
    let monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

    tooltip.html(monthNames[item['month'] - 1] +
    ' : ' + item['year'] + '<br />' +
    'Average Temperature: ' + baseTemp + '<br />' +
    'Temperature Variance: ' + item['variance']);
  }).
  on('mouseout', item => {
    tooltip.transition().
    style('visibility', 'hidden');
  });
};


req.open('GET', url, true);
req.onload = () => {
  let data = JSON.parse(req.responseText);
  values = data.monthlyVariance;
  baseTemp = data.baseTemperature;
  drawCanvas();
  generateScales();
  generateRect();
  generateAxes();
};
req.send();