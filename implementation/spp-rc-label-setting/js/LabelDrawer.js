var LabelDrawer = function(svgOrigin,algo){

    /////////////////
    //PRIVATE

    var leftMargin = 10;


    var xRange = +svgOrigin.attr("width") || 400;
        yRange = +svgOrigin.attr("height") || 300;
    var wS = global_NodeLayout['borderWidth'];
    var margin = {top: global_KnotenRadius+wS, right: global_KnotenRadius+wS, bottom: global_KnotenRadius+wS, left: global_KnotenRadius+wS+leftMargin},
        width = xRange - margin.left - margin.right,
        height = yRange - margin.top - margin.bottom;

    this.margin = margin;

    var radius = global_KnotenRadius;//20;

    svgOrigin
        .attr({version: '1.1' , xmlns:"http://www.w3.org/2000/svg"})
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    var svg = svgOrigin.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var svg_timewindow=svg.append("rect").attr("class", "timewindow");
    var svg_labels=svg.append("g").attr("id", "labels");


    var x = d3.scale.linear()
        .range([margin.left, width-margin.right]);

    var y = d3.scale.linear()
        .range([height-margin.top, margin.bottom]);

        x.domain([0,10]);
        y.domain([0,10]);

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
//           .attr("transform", "rotate(-90)")
          //.attr("x",10)
          //.attr("y", -3)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("cost")

    var transform = function(d){
      return "translate(" + x(d.x) + "," + y(d.y) + ")"
    ;};

    var residentNodeFilter=d3.select("#filterLabelsByResidentNode").property("value");

    d3.select("#filterLabelsByResidentNode").on('change',function(e){
      that.setResidentNodeFilter(this.value,false,true);
    });

    var that = this;

    this.setResidentNodeFilter = function(name,noUpdate,userChoseFilter){
      residentNodeFilter=name;
      d3.select("#filterLabelsByResidentNode").property("value",residentNodeFilter); //does not trigger 'change' event
      if(!noUpdate) that.updateLabels(algo.getState(),userChoseFilter);
    }



    /////////////////
    //PRIVILEDGED

    this.reset = function(){
      var arr = Graph.instance.getNodes().map(function(n){
          return n.id;
      });

      arr.unshift("all");



      var selection = d3.select("#filterLabelsByResidentNode")
                        .selectAll('option').data(arr);

       selection.enter().append('option')
        .attr('value',function(d){return d})
        .text(function(d){return d});
    }

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

    var generatePathCoordinatesFromLabel = function(d,repeatParentAtEnd){
        var pathinfo = [];
        var current=d;
        var i=5;
        do{
            pathinfo.push(current.resources);
            if(current.wait){
                pathinfo.push([current.resources[0]-current.wait,current.resources[1]]);
            }
        }
        while((current=Graph.Label.get(current.parentId)) && i--);
        pathinfo.reverse();
        if(repeatParentAtEnd && pathinfo.length>=2){
          pathinfo[pathinfo.length-1]=pathinfo[pathinfo.length-2];
        }
        return pathinfo;//.reverse();
    }

    var lineFunction = d3.svg.line()
                         .x(function(d) { return x(d[0]); })
                         .y(function(d) { return y(d[1]); })
                         .interpolate("linear");//basis");

    this.updateLabels = function(s,userChoseFilter){

       if(!userChoseFilter){
        if(s.id==STATUS_PATH_EXTEND_FEASIBLE || s.id==STATUS_PATH_EXTEND_UNFEASIBLE){
          this.setResidentNodeFilter(Graph.Label.get(s.l_dashId).nodeId,true);
        }else{
          this.setResidentNodeFilter("all",true);
        }
       }


        //var labels = s.U.concat(s.P)
        //if(s.currentLabel) labels.push(s.currentLabel);
        //if(s.l_dash) labels.push(s.l_dash);
        
        var labels = [];//Graph.Label.labels.values();
          if(s.lId){
            labels.push(Graph.Label.get(s.lId));
          }
          if(s.l_dashId){
            labels.push(Graph.Label.get(s.l_dashId));
          }
          for(var i=0; i<s.U.length; i++){
            labels.push(Graph.Label.get(s.U[i]));
          }
          for(var i=0; i<s.P.length; i++){
            labels.push(Graph.Label.get(s.P[i]));
          }

        if(residentNodeFilter != "all"){

            labels = labels.filter(function(d){
              return d.nodeId == residentNodeFilter;
            })
        }


//         console.log(labels);
//         console.log(s.U,s.lId,s.P);

         x.domain([0,Math.max(d3.max(labels, function(d) { return d.resources[0];})||0,10)]);
         y.domain([0,Math.max(d3.max(labels, function(d) { return d.resources[1];})||0,10)]);

//         var xAxis = d3.svg.axis().scale(x).orient("bottom");
//         var yAxis = d3.svg.axis().scale(y).orient("left");
        var t = svg.transition();//.duration(750);
        t.select("g.y.axis").call(yAxis);
        t.select("g.x.axis").call(xAxis);


        this.updateTimeWindow(s);


        // DATA JOIN
        // Join new data with old elements, if any.
          var selection = svg_labels.selectAll(".label")
            .data(labels,function(d){return d.id});




        // ENTER
        // Create new elements as needed.
          var enterSelection = 
          selection.enter().append("g")
            .attr("class","label unselectable");


        enterSelection
            .attr("opacity","1e-6")
            .transition().duration(500)
            .attr("opacity","1");

         var enterSelectionLabelPath = enterSelection.append("path")
            .attr("class","labelpath") //is not transformed
            .attr("stroke", "gray")
            .attr("stroke-width", 2)
            .attr("fill", "none")
          
          var enterSelectionLabelEnd = enterSelection.append("g")
              .attr("class","labelend")
            //.style("opacity",1e-6)


           enterSelectionLabelEnd
                .append("rect")
                .attr({"rx":50, "ry":5, "height":20, "y":-10})
                .style({fill:"red", "stroke-width":2});// , "fill-opacity":1});

           enterSelectionLabelEnd
                .append("text")
                .style("text-anchor", "middle")
                .attr("dominant-baseline","middle")
                .text(function(d){return d.id});

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


       // selection.enter().selectAll(".labelend")




        // ENTER + UPDATE


        // Appending to the enter selection expands the update selection to include
        // entering elements; so, operations on the update selection after appending to
        // the enter selection will apply to both entering and updating nodes.

        selection.selectAll(".labelend")
            .attr("transform",function(d){
              return labelEndTransform(d.id == s.l_dashId ? Graph.Label.get(d.parentId) : d)
              })// start at parent position and transition to new position
            .transition().duration(1000)
            .attr("transform",labelEndTransform)

        selection.selectAll("path")
            .style("stroke-dasharray",function(d){
              return (d.id == algo.getState().l_dashId) ? "5,5" : "0";
            })
            .style("stroke",function(d){
              if(d.id == s.l_dashId) return "orange";
              else if(d.id == s.lId) return "red";
              return "gray"
            })
            .attr("d",function(d){
                var coords = generatePathCoordinatesFromLabel(d,d.id == s.l_dashId);
                return lineFunction(coords);
            })
            .transition().duration(1000)
            .attr("d",function(d){
                var coords = generatePathCoordinatesFromLabel(d,false);
                return lineFunction(coords);
            })




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
            .attr("width",10)//function(d){return d.id.length*7})
            .attr("x",-5)//function(d){return d.id.length*(-3.5)})
            .style("fill",function(d){
              //  if(s.id == algo.STATUS_DOMINANCE){
              //     return algo.dominanceStepNodeColors(d.nodeId);
              // }
                if(d.id == s.lId) return const_Colors.CurrentNodeColor;
                if(d.id == s.l_dashId) return "orange";
                if(s.U.some(function(a){return a==d.id})) return const_Colors.PQColor;
                if(s.P.some(function(a){return a==d.id})) return const_Colors.FinishedNodeColor;
            })
            .style("stroke",function(d){
              return "black";
               // if(s.currentLabel && d.id==s.currentLabel.id) return const_Colors.NodeBorderHighlight;
            })
            .style("stroke-width",0.5)



        // EXIT
        // Remove old elements as needed.
         selection.exit()
            .attr("opacity","1")
            .transition().duration(500)
            .attr("opacity","1e-6")
            .remove();
    
    } //end updateNodes()


    this.updateTimeWindow = function(s){
      if(residentNodeFilter == "all"){
        svg_timewindow
//             .attr("opacity","1")
//             .transition().duration(500)
            .attr("opacity",1e-6)
      }else{
        var residentNode = Graph.instance.nodes.get(residentNodeFilter);
        var yVals = y.range();
        var xStart = x(residentNode.resources[0]);
        var www = x(residentNode.resources[1])-xStart;
        if(www<=0){
          www=6;
          xStart-=3;
        }
        svg_timewindow.attr({
            x : xStart,
            width : www,
            y: yVals[1],
            height : yVals[0]+margin.top,
            opacity : 1
        })
      }
    }

} //end constructor GraphDrawer
