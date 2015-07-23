var LabelDrawer = function(svgOrigin,algo,additionalMarginTop){

    /////////////////
    //PRIVATE

    var additionalMarginTop = additionalMarginTop || 0;

    var xRange = +svgOrigin.attr("width") || 400;
        yRange = +svgOrigin.attr("height") || 300;
    var wS = global_NodeLayout['borderWidth'];
    var margin = {top: global_KnotenRadius+wS+additionalMarginTop, right: global_KnotenRadius+wS, bottom: global_KnotenRadius+wS, left: global_KnotenRadius+wS},
        width = xRange - margin.left - margin.right,
        height = yRange - margin.top - margin.bottom;

    this.margin = margin;

    var radius = global_KnotenRadius;//20;

    svgOrigin
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

//     //d3.select("body").selectAll("svg")
//     svgOrigin
//         .append("defs").append("marker")
//         .attr("id", "arrowhead2")
//         .attr("refX",12) /*must be smarter way to calculate shift*/
//         .attr("refY",2)
//         .attr("markerWidth", 12)
//         .attr("markerHeight", 4)
//         .attr("orient", "auto")
//         .append("path")
//         .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead

    var svg = svgOrigin.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var svg_labels=svg.append("g").attr("id", "labels");

    var x = d3.scale.linear()
        .range([margin.left, width-margin.right]);

    var y = d3.scale.linear()
        .range([height-margin.top, margin.bottom]);

        x.domain([0,10]);//d3.extent(graph.getNodes(), function(d) { return d.x; }));  //[0,xRange]);
     // x.domain([0,Math.max(width,d3.max(nodes, function(d){return d.x;}))]);
     // y1.domain([0,Math.max(height,d3.max(nodes, function(d){return d.y;}))]);
    //   y.domain([0,2*nodes.length]);
        y.domain([0,10]);//d3.extent(graph.getNodes(), function(d) { return d.y; }));//.nice();

//Axis
  var xAxis = d3.svg.axis().scale(x).orient("bottom");
  var yAxis = d3.svg.axis().scale(y).orient("left");

       svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", 0)
          .style("text-anchor", "end")
          .text("time");

      svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(10,0)")
          .call(yAxis)
        .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          //.attr("x",10)
          //.attr("y", -3)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("cost")

    var transform = function(d){
      return "translate(" + x(d.x) + "," + y(d.y) + ")"
    ;};

    /////////////////
    //PRIVILEDGED

    this.clear = function(){
        svg_labels.selectAll("g").remove();
    };

    this.type="LabelDrawer";
    this.graph = Graph.instance;
    this.svgOrigin = svgOrigin;

    var that = this

    var labelEndTransform = function(d){
        var d = d || {resources:[0,0]};
        return "translate("+x(d.resources[0])+","+y(d.resources[1])+")";
    }

    var generatePathCoordinatesFromLabel = function(d){
        var pathinfo = [];
        var current=d;
        do{
            pathinfo.push(current.resources);
            if(current.wait){
                pathinfo.push([current.resources[0]-current.wait,current.resources[1]]);
            }
        }
        while(current=current.parent);
        return pathinfo.reverse();
    }

    var lineFunction = d3.svg.line()
                         .x(function(d) { return x(d[0]); })
                         .y(function(d) { return y(d[1]); })
                         .interpolate("linear");//basis");

    this.updateLabels = function(s){

        var labels = s.U.concat(s.P)
        if(s.currentLabel) labels.push(s.currentLabel);
        if(s.l_dash) labels.push(s.l_dash);

         x.domain([0,Math.max(d3.max(labels, function(d) { return d.resources[0];})||0,10)]);
         y.domain([0,Math.max(d3.max(labels, function(d) { return d.resources[1];})||0,10)]);

//         var xAxis = d3.svg.axis().scale(x).orient("bottom");
//         var yAxis = d3.svg.axis().scale(y).orient("left");
        var t = svg.transition().duration(750);
        t.select("g.y.axis").call(yAxis);
        t.select("g.x.axis").call(xAxis);


        // DATA JOIN
        // Join new data with old elements, if any.
          var selection = svg_labels.selectAll(".label")
            .data(labels,function(d){return d.id});

        // UPDATE
        // Update old elements as needed.

        // ENTER
        // Create new elements as needed.
          var enterSelection = selection
            .enter().append("g")
            .attr("class","label")

         var enterSelectionLabelPath = enterSelection.append("path")
            .attr("class","labelpath") //is not transformed
            .attr("stroke", "lightgray")
            .attr("stroke-width", 1)
            .attr("fill", "none");
          
          var enterSelectionLabelEnd = enterSelection.append("g")
            .attr("class","labelend")
            .attr("transform",function(d){return labelEndTransform(d.parent)})// start at parent position and transition to new position
            .style("opacity",1e-6)

          var enterSelectionTimeWindow = enterSelection.append("rect")
            .attr("class","timewindow")




//<rect x="50" y="20" rx="20" ry="20" width="150" height="150"
//  style="fill:red;stroke:black;stroke-width:5;opacity:0.5" />

//           enterSelection.append("path")
//               .attr("d", d3.svg.symbol().type("triangle-down"))
//               .style({fill:"red", "opacity":0.5});


           enterSelectionLabelEnd
                .append("rect")
                .attr({"rx":50, "ry":5, "height":20, "y":-10})
                .style({fill:"red", "stroke-width":2 , "fill-opacity":0.5});

           enterSelectionLabelEnd
                .append("text")
                .style("text-anchor", "middle")
                .attr("dominant-baseline","middle")

//             .append("path")
//                 .attr("d",shapeFun)
//                 .attr("fill",labelColor2)
            //.attr("r", 10)
        //     .on("mouseenter",function(d){
        //       var label = d;
        //       while(label && label.arc){
        //         label.arc.highlight=true;
        //         label=label.parent;
        //       }
        //       updateEdges()
        //       console.log(d);
        //     })
        //     .on("mouseleave",function(d){
        //       var label = d;
        //       while(label && label.arc){
        //         label.arc.highlight=false;
        //         label=label.parent;
        //       }
        //       updateEdges()
        //       console.log(d);
        //     })

                // ENTER + UPDATE
        // Appending to the enter selection expands the update selection to include
        // entering elements; so, operations on the update selection after appending to
        // the enter selection will apply to both entering and updating nodes.
        selection.selectAll(".labelend")
            .transition().duration(500)
            .style("opacity",1)
            .attr("transform",labelEndTransform)

        selection.selectAll("path")
            .transition().duration(500)
            .attr("d",function(d){
                var coords = generatePathCoordinatesFromLabel(d);
                return lineFunction(coords);
            })

        selection.selectAll("rect.timewindow")
//             .transition().duration(500)
            .each(function(d){
                var yVals = y.range();
                var residentNode = Graph.instance.nodes.get(d.nodeId);
                var xStart = x(residentNode.resources[0]);
                var www = x(residentNode.resources[1])-xStart;
                    
                    if(www<=0){
                      www=6;
                      xStart-=3;
                    }

                d3.select(this).attr({
                    x : xStart,
                    width : www,
                    y: yVals[1],
                    height : yVals[0]+margin.top
                })
            })
            .style("display",function(d){return ((s.l_dash && (d.id == s.l_dash.id)) ? "block" : "none")});


//             .transition()
//             .style("stroke",function(d){
//               if(d==algo.s.currentLabel){
//                 return "red";
//               }else{
//                 return "black"
//               } 
//             })
    //     .attr("opacity",function(d){
    //       return (d==algo.s.currentLabel || d.nodeId == currentNode || currentArc && currentArc.end==currentLabel.node) ? 1 : 0;
    //     })


        selection.selectAll(".labelend rect")
            .attr("width",function(d){return d.id.length*7})
            .attr("x",function(d){return d.id.length*(-3.5)})
            .style("fill",function(d){
                if(s.currentLabel && d.id==s.currentLabel.id) return "white";
                if(s.l_dash && d.id==s.l_dash.id) return "red";
                if(s.U.some(function(a){return a.id==d.id})) return "yellow";
                if(s.P.some(function(a){return a.id==d.id})) return "green";
            })
            .style("stroke",function(d){
                if(s.currentLabel && d.id==s.currentLabel.id) return const_Colors.NodeBorderHighlight;
            })

        selection.selectAll(".labelend text").text(function(d){return d.id});




        // EXIT
        // Remove old elements as needed.
         selection.exit().remove();
    
    } //end updateNodes()

} //end constructor GraphDrawer
