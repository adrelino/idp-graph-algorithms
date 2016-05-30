var HeightfunctionDrawer = function(svgOrigin,algo){
    var leftMargin = 20;
    GraphDrawer.call(this,svgOrigin,{left:leftMargin});

    this.x.domain([0,10]);
    this.y.domain([0,10]);

    this.nodeLabel = function(d){
        return algo.nodeLabel(d);
    };

    this.nodeText = function(d){
        return algo.nodeText(Graph.instance.nodes.get(d.id));
    }

    this.edgeText = function(d){
//         return algo.edgeText(Graph.instance.edges.get(d.id));
    }

    this.onNodesEntered = function(d){
        return algo.onNodesEntered(d);
    }

    this.onNodesUpdated = function(selection){
       algo.onNodesUpdated(selection);

//         var h = 20;

//         selection.selectAll(".excessBar")
//         .transition()
//         .attr("y", function(d) {
//             return h - algo.flowWidth(Math.abs(Graph.instance.nodes.get(d.id).state.excess))
//         })
//         .attr("height", function(d) {
//             return algo.flowWidth(Math.abs(Graph.instance.nodes.get(d.id).state.excess))
//         })
//         .style("display",(s.id != STATUS_FINISHED) ? "block" : "none");

    }

    this.onEdgesEntered = function(selection) {

    }
    
    this.onEdgesUpdated = function(selection) {
      //does not update flow with and cap because we didnt call algo.onEdgesEntered 
      //in this.onEdgesEntered, so only the default onEdgesEntered with arrows from GraphDrawer is called on enter
      //TODO:: draw residual edges on active node, not all edges in right side
      algo.onEdgesUpdated(selection);
    }

    var that = this;

    this.init = function(){
      Graph.addChangeListener(function(){
          that.clear();
          that.update();
      });
    }

    var xAxisOptions = {
      "excess" : function(d){return +d.state.excess},
      "id" : function(d){return +d.id}
    }
    var xFunName=d3.select("#heightFunctionXAxis").property("value");

    d3.select("#heightFunctionXAxis").on('change',function(e){
      xFunName=this.value;
      xAxisText.text(xFunName);
      that.update();
    });


    //Axis
    var xAxis = d3.svg.axis().scale(this.x).orient("bottom").tickFormat(d3.format("d")).tickSubdivide(0);
    var yAxis = d3.svg.axis().scale(this.y).orient("left");

    var xAxisText = this.svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + this.height + ")")
          .call(xAxis)
        .append("text")
          .attr("class", "label")
          .attr("x", this.width)
          .attr("y", 15)
          .style("text-anchor", "end")
          .text(xFunName);//id

    this.svg.append("g")
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
          .text("height")

    /////////////////
    //PRIVILEDGED

    this.type="HeightfunctionDrawer";

    var that = this;

    this.nodeX = function(d){
        return xAxisOptions[xFunName](d);
    };

    this.nodeY = function(d){
        return d.state.height;
    }

    this.update = function(){

        var nodes = Graph.instance.getNodes();

        if(Graph.instance){
            this.squeeze();
        }

        xAxis.ticks(nodes.length);

//         this.x.domain([0,d3.max(nodes, function(d) { return xFun(d)})]);
        this.x.domain(d3.extent(nodes, function(d) { return xAxisOptions[xFunName](d)})); 
        this.y.domain([0,d3.max(nodes, function(d) { return d.state.height})]);

        var t = this.svg.transition().duration(250);
        t.select("g.y.axis").call(yAxis);
        t.select("g.x.axis").call(xAxis);

        HeightfunctionDrawer.prototype.update.call(this);
    }

} //end constructor GraphDrawer
HeightfunctionDrawer.prototype = Object.create(GraphDrawer.prototype);
HeightfunctionDrawer.prototype.constructor = HeightfunctionDrawer;
