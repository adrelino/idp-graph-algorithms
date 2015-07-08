var GraphDrawer = function(graph,svgOrigin){

    this.graph = graph;
    this.svgOrigin = svgOrigin;

    var xRange = 400,
        yRange = 300;

    var margin = {top: 20, right: 20, bottom: 20, left: 30},
        width = xRange - margin.left - margin.right,
        height = yRange - margin.top - margin.bottom;

    var radius = 20;

    svgOrigin
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    //     .on("dblclick",doubleclick) //for adding new nodes
    //     .on("mousemove",mousemove)
    //     .on("mousedown",click)

    // d3.select("body").selectAll("svg")
    svgOrigin
        .append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("refX",9) /*must be smarter way to calculate shift*/
        .attr("refY",2)
        .attr("markerWidth", 12)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead

    var svg = svgOrigin.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var svg_links=svg.append("g").attr("id", "edges");
    var svg_nodes=svg.append("g").attr("id", "nodes");

    var x = d3.scale.linear()
        .range([margin.left, width-margin.right]);

    var y = d3.scale.linear()
        .range([height-margin.top, margin.bottom]);

        x.domain(d3.extent(graph.getNodes(), function(d) { return d.x; }));  //[0,xRange]);
     // x.domain([0,Math.max(width,d3.max(nodes, function(d){return d.x;}))]);
     // y1.domain([0,Math.max(height,d3.max(nodes, function(d){return d.y;}))]);
    //   y.domain([0,2*nodes.length]);
        y.domain(d3.extent(graph.getNodes(), function(d) { return d.y; }));//.nice();


    var transform = function(d){
      return "translate(" + x(d.x) + "," + y(d.y) + ")"
    ;};


function updateNodes(){

// DATA JOIN
// Join new data with old elements, if any.
  var selection = svg_nodes.selectAll(".node")
    .data(graph.getNodes(),function(d){return d.id});


// UPDATE
// Update old elements as needed.

// ENTER
// Create new elements as needed.
  var enterSelection = selection
    .enter().append("g")
    .attr("class","node")
//     .attr("transform",transform)
//     .on("mousedown", nodeDown)
//     .on("mouseup", nodeUp);

//     enterSelection.on("dblclick",function(d){
//         d3.event.preventDefault();
//         console.log("dbclick on node")
//     });

    enterSelection.append("circle")
        .attr("r", radius)

    enterSelection.append("text")
        .text(function(d){return d.id})
        .attr("dy", ".35em")           // set offset y position
        .attr("text-anchor", "middle")


// ENTER + UPDATE
// Appending to the enter selection expands the update selection to include
// entering elements; so, operations on the update selection after appending to
// the enter selection will apply to both entering and updating nodes.
    selection
        .transition()
        .attr("transform",transform);


// EXIT
// Remove old elements as needed.
      selection.exit().remove();
}



    var nodePos = function(d){
        return {x:x(d.x), y:y(d.y)};
    };

    function lineAttribs(d){
     d3.select(this)
      .attr({ x1:nodePos(d.start).x, y1:nodePos(d.start).y, x2:nodePos(d.end).x, y2:nodePos(d.end).y });
    };

    function textAttribs(d){
        d3.select(this)
          .attr({ x:(nodePos(d.start).x+nodePos(d.end).x)*0.5, y:(nodePos(d.start).y+nodePos(d.end).y)*.5});
     };
      var textfun = function(d) { return d.resources.join(" ")};


function updateEdges(){

    var selection = svg_links.selectAll(".edge")
        .data(graph.getEdges(),function(d){return d.id});

//ENTER
    var enterSelection = selection
        .enter().append("g")
        .attr("class","edge")

    var selectionLines = enterSelection.append("line")
        .attr("marker-end", "url(#arrowhead)")
        .style("stroke","black")
        .style("stroke-width","5px")
//         .on("dblclick",edgeClicked);

    var selectionText =  enterSelection.append("text");


//ENTER + UPDATE
    selectionLines.transition(1000).each(lineAttribs)
    selectionText
        .each(textAttribs)
        .text(textfun);

//EXIT
    selection.exit().remove();

}

    this.update = function(){
      updateNodes();
      updateEdges();
    }
} //end class GraphDrawer
