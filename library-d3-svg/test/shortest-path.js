
var Ulist = d3.select("#Ulist").append("div").text("UP:").append("ul");
//var Plist = d3.select("#Plist").append("div").text("P:").append("ul");

function updateLabelsSingle(domNode,data){
  var selection = domNode.selectAll("li").data(data);

  selection
    .enter()
    .append("li")
    .transition()
    .text(function(d){return d.id + " "+ resourceVecToString(d)})
    //.style("background",function(d){return d.isP ? "lightgreen" : "orange"})
    .style("color",labelColor2);

  selection
    .transition()
    .style("background",labelColor2)
    //.style("color",labelColor)

  selection
    .exit()
    .transition()
    .remove();
}

var iSym=0;

//var shapeFun = d3.svg.symbol().type(function(d){return d3.svg.symbolTypes[iSym]});
var shapeFun = d3.svg.symbol().type(function(d){return d.isP ? "triangle-up" : "triangle-down"});

//var shapeFun = d3.svg.symbol().type(function(d){return d.isP ? "cross" : "diamond"});
         //.size(200)
         
    //.attr("d","M 0.000 8.000 L 11.756 16.180 L 7.608 2.472 L 19.021 -6.180 L 4.702 -6.472 L 0.000 -20.000 L -4.702 -6.472 L -19.021 -6.180 L -7.608 2.472 L -11.756 16.180 L 0.000 8.000")
    


function updateLabels(){
  //updateLabelsSingle(Ulist,UP.);
  //updateLabelsSingle(Plist,P);

  var labels = UP.concat(P);
    updateLabelsSingle(Ulist,labels);


        y1.domain([0,12]);//d3.max(labels,function(d){return d.cost})]);
    //x1.domain([0,d3.max(nodes,function(d){return d.depart})]);
    //x1.domain([0,d3.max(target.labels,function(d){return d.time})]);

  //var xAxis = d3.svg.axis().scale(x1).orient("bottom");
  var yAxis = d3.svg.axis().scale(y1).orient("left");

        svg2.selectAll("g.y.axis").call(yAxis)
       // svg2.selectAll("g.x.axis").call(xAxis)

  var labelSelection = svg_nodes_right.selectAll(".label").data(labels);//, function(d) { return d.id;});
  foo=labelSelection;
  
  labelSelection
    .enter()
    .append("path")
        .attr("d",shapeFun)
        .attr("class","label")
    //.attr("r", 10)
    .on("mouseenter",function(d){
      var label = d;
      while(label && label.arc){
        label.arc.highlight=true;
        label=label.parent;
      }
      updateEdges()
      console.log(d);
    })
    .on("mouseleave",function(d){
      var label = d;
      while(label && label.arc){
        label.arc.highlight=false;
        label=label.parent;
      }
      updateEdges()
      console.log(d);
    })
    .attr("fill",labelColor2)

    labelSelection
    .transition()
    .attr("d",shapeFun)
    .attr("fill",labelColor2)
    .attr("transform",function(d){
      return "translate("+x1(d.time)+","+y1(d.cost)+")";//" scale(0.5)";
    })
//     .attr("cy",function(d){
//       return y1(d.cost)}
//     )
//     .attr("cx",function(d){
//       return x1(d.time)}
//     )
    .transition()
//     .attr("stroke-width",function(d){
//       return UP.indexOf(d)>=0 ? "5px":""
//       })
    .style("stroke",function(d){
      if(d==currentLabel){
        return "red";
      }else{
        return "black"
      } 
    })
    .attr("opacity",function(d){
      return (d==currentLabel || d.node==currentNode || currentArc && currentArc.end==currentLabel.node) ? 1 : 0;
    })

  labelSelection.exit().remove();
}

 x1.domain([0,50]); //time
 y1.domain([0,50]); //cost

var color = d3.scale.category10();
var color2 = d3.scale.category20();

var nodes = [],
    links = [];

var U = [];//unprocessed paths
var P = [];//useful paths: pareto-optimal or prefixes of pareto-optimal paths

var source = null;
var target = null;
var currentNode = null;
var currentLabel = null;

//reused acessor func
var resourceVecToString = function(d) { return "("+d.time + "," +d.cost+")"};
var labelColor = function(d){return color2(d.id)};
var labelColor2 = function(d){return (d==currentLabel) ? "red" : (d.isP ? "lightgreen" : "orange") };

var svg_links_left=svg.append("g").attr("id", "links");
var svg_nodes_left=svg.append("g").attr("id", "nodes");

var timewindow=svg2.append("rect").attr("class", "timewindow");
var testArc=svg2.append("path").attr("id", "testArc");
var svg_nodes_right=svg2.append("g").attr("id", "nodes");

//     .attr("x", function(d){return x1(d.arrive)})
//     .attr("width", function(d){return x1(d.depart - d.arrive)})
//     .attr("y", yVals[0])
//     .attr("height",yVals[1])

  var nodePos = function(d){return {x:x(d.x), y:y(d.y)}};


   function lineAttribs(d){
     d3.select(this)
      .attr({ x1:nodePos(d.start).x, y1:nodePos(d.start).y, x2:nodePos(d.end).x, y2:nodePos(d.end).y });
   };

   function textAttribs(d){
     d3.select(this)
      .attr({ x:(nodePos(d.start).x+nodePos(d.end).x)*0.5, y:(nodePos(d.start).y+nodePos(d.end).y)*.5});
   };

function updateEdges(){

  var svg_links = svg_links_left;


   var cap = svg_links.selectAll(".cap").data(links);//, function(d) { return d.source.id + "-" + d.target.id; });

   cap.enter().append("line")
    .attr("class", "cap")
    .each(lineAttribs)
    //.style("stroke-width",function(d){return flowWidth(d.cap)})

  cap.transition(1000).each(lineAttribs);



  var link = svg_links.selectAll(".link").data(links);//, function(d) { return d.source.id + "-" + d.target.id; });
  
  link.enter().append("line")
    .attr("class", "link")
    .each(lineAttribs)
    .attr("marker-end", "url(#arrowhead)")
    //.style("stroke-width",function(d){return d.cap+"px"})

  link.transition(1000).each(lineAttribs)

  link.style("stroke",function(d){return d==currentArc ? "red" : (d.highlight ? "yellow" : "")});
  //link.style("stroke-width",function(d){return d.highlight ? "red" : color2("("+d.time + "," +d.cost+")")});



  link.exit().remove();


   var flow = svg_links.selectAll(".flow").data(links);//, function(d) { return d.source.id + "-" + d.target.id; });
   
   flow.enter().insert("line",".link")
    .attr("class", "flow")
    .each(lineAttribs)

   flow
    .transition(1000)
    .each(lineAttribs)
    .style("stroke-width",function(d){return d.highlight ? "50px" : ""})

    //.style("stroke-width",function(d){return flowWidth(d.flow)})
    //.style("stroke",function(d){if(d.flow==d.cap) return "orange"})

  var linkText = svg_links.selectAll(".linkText").data(links);//, function(d) { return d.source.id + "-" + d.target.id; });
  
  linkText.enter().append("text")
    .attr("class", "linkText")
    .each(textAttribs)
    .text(resourceVecToString);

  linkText
    .each(textAttribs)
    .text(resourceVecToString);

  linkText.exit().remove();
}

function updateNodes() {
  updateNodesSingle(svg_nodes_left,function(d){return "translate(" + x(d.x) + "," + y(d.y) + ")";});
  //updateNodesSingle(svg_nodes_right,function(d){return "translate(" + x(d.x) + "," + y(d.height) + ")";});
}

function updateNodesSingle(svg_nodes,transform){

  //var mytext = active.map(function(node){return node.id}).join(",");
  //d3.select('#active').text(mytext);

  var node = svg_nodes.selectAll(".node").data(nodes);//, function(d) { return d.id;});
  
  var points = node
    .enter().append("g")
    .attr("class","node")
    .attr("transform",transform);

  node
    .transition()
    .attr("transform",transform);

  points.append("circle")
    .attr("r", radius)
    .on("click",function(d){
      currentNode=d;
      updateNodes();
      updateLabels();
    })


  node.select("circle")
    .transition()
    .style("stroke-width",function(d){
     if(d==currentNode){
        return "7px";
      }else{
        return "0px";
      } 
    })
//     .style("stroke",function(d){
//       if(d==currentNode){
//         return "red";
//       }else{
//         return "black"
//       } 
//     })
//     .style("fill",function(d){
//       //return colormap[Math.min(10,d.height)];
//       //if(d.source) return "green";
//       //if(d.sink) return "red";
//       return color(d.id);
//     })


  points.append("text")
    .text(function(d){return d.id})
    .attr("dy", ".35em")           // set offset y position
    .attr("text-anchor", "middle")

  points.append("text")
    .attr("class","timewindow")
    .attr("dy", "2.0em")           // set offset y position
    .attr("text-anchor", "middle")

  node.select(".timewindow")
    .transition()
    .text(function(d){return "["+d.arrive+" , "+d.depart+"]"});

  node.exit().remove();

  updateTimeWindow();
}

function update(){
  updateNodes();
  updateEdges();
}


function updateTimeWindow(){

  var nodeData = currentNode;
  if(!nodeData) return;

  var yVals = y1.range();

  var tw = nodeData.depart - nodeData.arrive;
  var www = x1(nodeData.depart) - x1(nodeData.arrive);

  console.log("timewindow of node "+nodeData.id+ ":" +tw + " (is "+ www + "px)");
  var xStart = x1(nodeData.arrive);
    if(www<=0){
      www=6;
      xStart-=3;
    }

  timewindow
    .transition()
    .attr("x",xStart)
    .attr("width",www)
    .attr("y", yVals[1])
    .attr("height",yVals[0]+margin.top)

}


var d3line2 = d3.svg.line();
//                         .x(function(d){return d.x;})
//                         .y(function(d){return d.y;})
//                         .interpolate("linear"); 
//                         // "linear" for piecewise linear segments

function updateTestArc(){
  var attr={};

  var pathinfo = [];

  if(currentArc){
    var d = currentArc;
    attr={ x1:x1(currentLabel.time), y1:y1(currentLabel.cost), x2:x1(currentLabel.time+d.time), y2:y1(currentLabel.cost+d.cost)}
    pathinfo.push([attr.x1,attr.y1]);
    pathinfo.push([attr.x2,attr.y2]);
    if(currentArc.end.arrive > currentLabel.time+d.time){
      var x3 = x1(currentArc.end.arrive);
      pathinfo.push([x3,attr.y2]);
    }
  }


  testArc
    //.attr(attr)
    .attr("d", d3line2(pathinfo))
    .transition()
    .attr("opacity",(currentArc==null) ? 0 : 1)
    //.classed("hidden",currentArc==null);
}


UPSet = function(){
  this.labels = [];
  this.length = 0; //length of U
}

UPSet.prototype.getU = function(){
  return this.labels.filter(function(d){return !d.isP});
}

UPSet.prototype.getP = function(){
  return this.labels.filter(function(d){return d.isP});
}

// UPSet.prototype.length = function(){
//   return this.labels.some(function(d){return !d.isP});
// }

UPSet.prototype.shift = function(){ //DOES NOT DELETE!!!
  for(var i=0; i<this.labels.length; i++){
    var label = this.labels[i];
    if(!label.isP) return label;
  }
}

UPSet.prototype.push = function(label){
  if(this.labels.indexOf(label)>=0){
    label.isP=true; //DOES NOT ADD!!!  (=^= add to P, was in U before)
    this.length--;
  }else{
    this.labels.push(label); //add to U
    this.length++;
  }
}

UPSet.prototype.concat = function(P){
  return this.labels;
}

UPSet.prototype.indexOf = function(d){
  return d.isP ? 1 : -1;
}

var UP = new UPSet();

var mode=0
var iNeighbours=0;
var currentArc=null;

function step(){
  iSym = (iSym + 3) % d3.svg.symbolTypes.length;
  console.log(mode);
  switch(mode){
    case 0: if(UP.length>0){
      currentLabel = UP.shift();
      currentNode=currentLabel.node;
      logger("picked label "+currentLabel.id+ " from U, resident node in "+currentLabel.node.id);
      iNeighbours = 0;
      mode = 1;
    }else{
      alert("finished");
      currentLabel=null;
      mode = 4;
    } break;
    case 1: if(iNeighbours<currentLabel.node.neighbours.length){
      currentArc = currentLabel.node.neighbours[iNeighbours];
      currentNode=currentArc.end;
      logger2("checking arc "+currentArc.start.id+ "->"+currentArc.end.id);
      iNeighbours++;
      mode = 2;
    }else{
      currentArc=null;
      currentLabel.node.labels.push(currentLabel);
      UP.push(currentLabel); //add to P
      logger2("moved label "+currentLabel.id+ " to P");
      /*Dominance step*/ //TODO
      mode = 0
    } break;
    case 2: if(currentLabel.time+currentArc.time<=currentArc.end.depart){ //feasible label extensions
        var newlabel = {
          time:Math.max(currentLabel.time+currentArc.time,currentArc.end.arrive),
          cost:currentLabel.cost+currentArc.cost,
          parent:currentLabel,
          node:currentArc.end,
          arc:currentArc,
          id:currentLabel.id + "->" + currentArc.end.id,
          };
        UP.push(newlabel);
        //updateLabels();
        logger3("feasible, added label "+newlabel.id+" to U");
        currentArc=null;
        //currentNode=null;
        mode = 1;
      }else{
        logger3("infeasible")
        mode = 1;
      } break;
  }

updateTestArc();
  updateNodes();
  updateLabels();
  updateEdges();
//   if(UP.length>0){
//     /*Path extensions step*/
//     var label = UP.shift(); //or just pop() == Q
//     currentLabel = label;
//     updateLabels();
//     //currentNode=node; //label ending in node, node is active
//     //updateNodes();
//     //logger("picked label "+label.id+ " from U, resident node in "+node.id);
//     for(var i=0; i<label.node.neighbours.length; i++){ //forward star
//       var arc = label.node.neighbours[i];
//       logger2("checking arc "+arc.start.id+ "->"+arc.end.id);
//       if(label.time+arc.time<=arc.end.depart){ //feasible label extensions
//         var newlabel = {
//           time:Math.max(label.time+arc.time,arc.end.arrive),
//           cost:label.cost+arc.cost,
//           parent:label,
//           node:arc.end,
//           arc:arc,
//           id:label.id + "->" + arc.end.id,
//           };
//         UP.push(newlabel);
//         updateLabels();
//         logger3("feasible, added label "+newlabel.id+" to U");

//       }else{
//         logger3("infeasible")
//       }
//     }
//     label.node.labels.push(label); // a node only contains labels in P!!!
//     UP.push(label); //was P
//     updateLabels();

//     logger2("moved label "+label.id+ " to P");

//     /*Dominance step*/

//   }else{
//     alert("finished");
//   }

  /*Filtering step*/
  //find path with minimal cost to targets


        //color.domain(P.map(function(d){return d.id}));

}

function initNeighbours(){
  for(var i=0; i<links.length; i++){
    var edge = links[i];
    edge.start.neighbours.push(edge);  //each node has an outgoing adjacency list
    //edge.end.neighbours.push({node:edge.start, edge:edge, isForwardEdge: false});
  }
}


Graph.addChangeListener(function(error,text){
  var svgOrigin = d3.select("body").append("svg");
  graphDrawer = new GraphDrawer(svgOrigin); //TODO replace by GraphEditor
  graphDrawer.update();

  var nodes = Graph.instance.getNodes();
  source=nodes[0];

  target=nodes[nodes.length-1];
  //currentNode=source;

  var trivialPath = {time:source.arrive, cost:0, parent:null, node:source, arc:null, id:""+source.id}; //parent: parent label
  //source.labels = [trivialPath]; //non-dominated labels
  
  UP.push(trivialPath);

  initNeighbours();

    y1.domain([0,d3.sum(links,function(d){return d.cost})]);
    x1.domain([0,d3.max(nodes,function(d){return d.depart})]);
    //x1.domain([0,d3.max(target.labels,function(d){return d.time})]);

  var xAxis = d3.svg.axis().scale(x1).orient("bottom");
  var yAxis = d3.svg.axis().scale(y1).orient("left");

        svg2.selectAll("g.y.axis").call(yAxis)
        svg2.selectAll("g.x.axis").call(xAxis)

  updateLabels();
  updateNodes();

  x.domain(d3.extent(nodes, function(d) { return d.x; }));  //[0,xRange]);
  y.domain(d3.extent(nodes, function(d) { return d.y; })); //[0,yRange]);

 // x.domain([0,Math.max(width,d3.max(nodes, function(d){return d.x;}))]);
 // y1.domain([0,Math.max(height,d3.max(nodes, function(d){return d.y;}))]);
 // y.domain([0,2*nodes.length]);//d3.extent(nodes, function(d) { return d.height; })).nice();

svg2.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -3)
      .style("text-anchor", "end")
      .text("time");

  svg2.append("g")
      .attr("class", "y axis")
      //.attr("transform", "translate(0,0)")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      //.attr("x",10)
      //.attr("y", -3)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("cost")

  // var legend = svg2.selectAll(".legend")
  // //     .data(color.domain())
  // //   .enter().append("g")
  // //     .attr("class", "legend")
  // //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // legend.append("rect")
  //     .attr("x", width - 18)
  //     .attr("width", 18)
  //     .attr("height", 18)
  //     .style("fill", color);

  // legend.append("text")
  //     .attr("x", width - 24)
  //     .attr("y", 9)
  //     .attr("dy", ".35em")
  //     .style("text-anchor", "end")
  //     .text(function(d) { return d; });

    update();
});

Graph.loadInstance("../../spp-rc-label-setting/graphs-new/graph"+1+".txt");
