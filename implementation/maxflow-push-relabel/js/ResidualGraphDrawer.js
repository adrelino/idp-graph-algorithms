/**
 * @classdesc
 * Secondary visualization layer to draw the residual graph
 * @constructor
 */
var ResidualGraphDrawer = function(svgOrigin,algo){
    var leftMargin = 10;
    GraphDrawer.call(this,svgOrigin,{left:leftMargin});

    GraphAlgos.remove(svgOrigin.attr("id"),this);


    this.x.domain([0,10]);
    this.y.domain([0,10]);

    this.nodeLabel = function(d){
        return algo.nodeLabel(d);
    };

    this.nodeText = function(d){
        return algo.nodeText(Graph.instance.nodes.get(d.id));
    }

    /**
     * Edge text is capacity c' of residual edges e' in G'
     */
    this.edgeText = function(d) {
      var e_dashes_forward_map = algo.getState().e_dashes_forward_star_map;

      if(e_dashes_forward_map){
        var e_dash = e_dashes_forward_map[d.id];
        if(!e_dash) return "";
        var resEdge = new Graph.ResidualEdge(e_dash);
        return resEdge.c_dash();// + " " + (resEdge.forward ? "f" : "b"); //d.id + " "
      }
      return "";
    }

    /**
     * Add Rectangle(excessBar) and Text (height,excess) to nodes.
     */
    this.onNodesEntered = function(selection){
        algo.onNodesEntered(selection);

        selection.append("rect")
          .attr("class", "excessBar unselectable")
          .attr("x", "20")
          .attr("width", 10);
      /*
        selection.append("text")
          .attr("class","height")
          .attr("dy", "-1.2em")           // set offset y position
          .attr("text-anchor", "left");

        selection.append("text")
          .attr("class","excess unselectable")
          .attr("dy", "2.0em")           // set offset y position
          .attr("text-anchor", "right");
          */
    }

    /**
     * Update Rectangle(excessBar) and Text (height,excess) at nodes. Display of these depends on current selected xFunName
     */
    this.onNodesUpdated = function(selection){
      algo.onNodesUpdated(selection);

     var h = 20;

     selection.selectAll(".excessBar")
       .transition(100)
       .attr("y", function(d) {
           return h - algo.flowWidth(Math.abs(Graph.instance.nodes.get(d.id).state.excess),50)
       })
       .attr("height", function(d) {
           return algo.flowWidth(Math.abs(Graph.instance.nodes.get(d.id).state.excess),50)
       })
       .style("display",(algo.getState().id == STATUS_FINISHED || xFunName==AXIS_EXCESS) ? "none" : "block");
      /*
     selection.selectAll(".height")
       .transition()
       .text(function(d){return "h:"+d.state.height});

     selection.selectAll(".excess")
       .transition()
       .text(function(d){return "e:"+d.state.excess})
       */
    }

    this.nodeText = function(d){
      if(xFunName==AXIS_EXCESS) return "";
      if(xFunName==AXIS_ID) return " / "+d.state.excess;
      return d.state.height + " / " + d.state.excess;
    }

    this.onEdgesEntered = function(selection) {

    }
    
    this.onEdgesUpdated = function(selection) {
      //does not update flow with and cap because we didnt call algo.onEdgesEntered 
      //in this.onEdgesEntered, so only the default onEdgesEntered with arrows from GraphDrawer is called on enter
      //TODO:: draw residual edges on active node, not all edges in right side
      algo.onEdgesUpdated(selection);

      var e_dashes_forward_map = algo.getState().e_dashes_forward_star_map;

      selection.selectAll("line.arrow")
        .each(function(d){
          var isResidualEdge = false;
      
          //var currentNodeId = algo.getState().currentNodeId;
          
          if(e_dashes_forward_map){//currentNodeId != null && currentNodeId>=0){
//             var currentNode = Graph.instance.nodes.get(currentNodeId);
//             var e_dashes = currentNode.getAllOutgoingResidualEdges(true);

//             var e_dash = null;
//             for(var i=0; i<e_dashes.length; i++){
//               if(d.id == e_dashes[i].id){
//                 e_dash=e_dashes[i];
//                 break;
//               }
//             }
            var e_dash = e_dashes_forward_map[d.id];
            var isResidualEdge = e_dash != null;
            //d3.select(this).style("visibility",isResidualEdge ? "visible" : "hidden");
            if(isResidualEdge){
              var resEdge = new Graph.ResidualEdge(e_dash);
              d3.select(this).style("stroke-dasharray","5,5");
              d3.select(this).style("marker-start",e_dash.forward ? "" : "url(#arrowhead3)");
              d3.select(this).style("marker-end",e_dash.forward ? "url(#arrowhead2)" : "");
              //d3.select(this).style("opacity",resEdge.notnull() ? 1 : 0.1);
            }
          }else{
             //d3.select(this).style("visibility","hidden");
          }
        });

      var transTime = (algo.getState().idPrev==STATUS_MAINLOOP) ? 0 : 500;

      //on g.edge
      selection.transition(transTime).style("opacity",function(d){ //selectAll("line.arrow").transition()
        var op = 0.0;
        if(e_dashes_forward_map){
          var e_dash = e_dashes_forward_map[d.id];
          if(e_dash){
            var resEdge = new Graph.ResidualEdge(e_dash);
            if(resEdge.notnull()){
              op = 0.5;
            }
            if(resEdge.notnull() && resEdge.legal()){
              op = 1.0;
            }
          }
        }
        return op;
      });
    }

    var that = this;

    this.init = function(){
      Graph.addChangeListener(function(){
          that.clear();
          that.update();
      });
    }

    var AXIS_EXCESS = "height/excess";//"excess";
    var AXIS_ID = "height/id";// "id"
    var AXIS_GRAPH = "y/x";//graph";


    var axisOptions = {};
    axisOptions[AXIS_EXCESS] = {
      "x" : function(d){return +d.state.excess},
      "y" : function(d){return +d.state.height}
    };
    axisOptions[AXIS_ID] = {
      "x" : function(d){return +d.id},
      "y" : function(d){return +d.state.height}
    };
    axisOptions[AXIS_GRAPH] = {
      "x" : function(d){return +d.x},
      "y" : function(d){return +d.y}
    }

    var selectBox = d3.select("#heightFunctionXAxis");
    var heightFunctionXAxisKeepFixed = d3.select("#heightFunctionXAxisKeepFixed");

    
    var xFunName=selectBox.property("value");

    selectBox.on('change',function(e){
      that.setXFunName(this.value);
    });

    this.setXFunName = function(name,noUpdate){
      xFunName=name;
      selectBox.property("value",xFunName); //does not trigger 'change' event
      var yx = xFunName.split("/");
      xAxisText.text(yx[1]);
      yAxisText.text(yx[0]);
      if(!noUpdate) that.update();
    }

    var axis = getUrlVars()["axis"];
    if(axis && axisOptions[axis]){
      xFunName=axis;
      selectBox.property("value",xFunName); //does not trigger 'change' event
      heightFunctionXAxisKeepFixed.property("checked",true);
    }


    function tickForm(e,b){
        if(Math.floor(e) != e)
        {
            return;
        }

        return e;
    };


    //Axis
    var xAxis = d3.svg.axis().scale(this.x).orient("bottom").tickFormat(tickForm);
    var yAxis = d3.svg.axis().scale(this.y).orient("left").tickFormat(tickForm);

    var yx = xFunName.split("/");

    var xAxisText = this.svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (this.height-10) + ")")
          .call(xAxis)
        .append("text")
          .attr("class", "label")
          .attr("x", this.width)
          .attr("y", 15)
          .style("text-anchor", "end")
          .text(yx[1]);//id

    var yAxisText = this.svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate("+leftMargin+",0)")
          .call(yAxis)
        .append("text")
          .attr("class", "label")
//           .attr("transform", "rotate(-90)")
//           .attr("x",0)
          //.attr("y", -3)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text(yx[0])
     
    /////////////////
    //PRIVILEDGED

    this.type="ResidualGraphDrawer";

    var that = this;

    this.nodeX = function(d){
        return axisOptions[xFunName]["x"](d);
    };

    this.nodeY = function(d){
        return axisOptions[xFunName]["y"](d);
    }

    this.update = function(s){

        if(s && !heightFunctionXAxisKeepFixed.property("checked")){
          if(s.idPrev <= STATUS_INITPREFLOW) this.setXFunName(AXIS_GRAPH,true);
          else if(s.idPrev == STATUS_INITDISTANCEFUNCTION /* || s.idPrev == STATUS_RELABEL || s.idPrev == STATUS_ADMISSIBLERELABEL*/) this.setXFunName(AXIS_ID,true);
          //else if(s.idPrev == STATUS_MAINLOOP) this.setXFunName(AXIS_GRAPH,true);
          else if(s.idPrev >= STATUS_FINISHED) this.setXFunName(AXIS_GRAPH,true);
          else if(s.idPrev >= STATUS_MAINLOOP) this.setXFunName(AXIS_EXCESS,true);
        }

        var nodes = Graph.instance.getNodes();

        if(Graph.instance){
            this.squeeze();
        }

        yAxis.ticks(d3.max(nodes, function(d){return d.state.height}));

        xAxis.ticks(nodes.length);

//         this.x.domain([0,d3.max(nodes, function(d) { return xFun(d)})]);
        this.x.domain(d3.extent(nodes, this.nodeX)); 
        this.y.domain(d3.extent(nodes, this.nodeY));

        var vis = (xFunName==AXIS_GRAPH ? "hidden" : "visible");

        var t = this.svg.transition().duration(250);
        t.select("g.y.axis").call(yAxis).style("visibility",vis);
        t.select("g.x.axis").call(xAxis).style("visibility",vis);

        ResidualGraphDrawer.prototype.update.call(this);
    }

} //end constructor GraphDrawer
ResidualGraphDrawer.prototype = Object.create(GraphDrawer.prototype);
ResidualGraphDrawer.prototype.constructor = ResidualGraphDrawer;