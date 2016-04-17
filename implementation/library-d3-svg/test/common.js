var ol=d3.select("#algo").append("div").text("log:").append("ol");
var olChild=null;
var olChild2=null;

function logger(val){
  console.log(val);
  olChild=ol.append("li");
  olChild.text(val);
  olChild=olChild.append("ol");
}

function logger2(val){
  console.log(val);
  if(olChild){
    olChild2=olChild.append("li")
    olChild2.text(val);
    olChild2=olChild2.append("ul");
  }
}

function logger3(val){
  console.log(val);
  if(olChild2) olChild2.append("li").text(val);
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value.split("#")[0];
    });
    return vars;
}

var xRange = 400,
    yRange = 300;

var radius = 20;

var margin = {top: 20, right: 20, bottom: 20, left: 30},
    width = xRange - margin.left - margin.right,
    height = yRange - margin.top - margin.bottom;

d3.select("#step").on("click",function(){
      step();
});

var svg = d3.select("#right").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg2 = d3.select("#right").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scale.linear()
    .range([margin.left, width-margin.right]);

var y = d3.scale.linear()
    .range([height-margin.top, margin.bottom]);

var x1 = d3.scale.linear()
    .range([margin.left, width-margin.right]);

var y1 = d3.scale.linear()
    .range([height-margin.top, margin.bottom]);

var xAxis = d3.svg.axis()
    .scale(x1)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y1)
    .orient("left");

d3.select("body").selectAll("svg").append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("refX",radius) /*must be smarter way to calculate shift*/
    .attr("refY",2)
    .attr("markerWidth", 6)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead

var colormap=["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"].reverse();

// var graphNum = getUrlVars()["graph"] || 2;