var HeightfunctionDrawer = function(svgOrigin,algo){
    var leftMargin = 20;
    GraphDrawer.call(this,svgOrigin,{left:leftMargin});

    this.x.domain([0,10]);
    this.y.domain([0,10]);

    var s = algo.s;

    this.nodeLabel = function(d){
        return algo.nodeLabel(d);
    };

    this.nodeText = function(d){
        return algo.nodeText(Graph.instance.nodes.get(d.id));
    }

    this.edgeText = function(d){
        return algo.edgeText(Graph.instance.edges.get(d.id));
    }

    this.onNodesEntered = function(d){
        return algo.onNodesEntered(d);
    }

    this.onNodesUpdated = function(selection){
       algo.onNodesUpdated(selection);

        var h = 20;

        selection.selectAll(".exessBar")
        .transition()
        .attr("y", function(d) {
            return h - algo.flowWidth(Math.abs(Graph.instance.nodes.get(d.id).state.exess))
        })
        .attr("height", function(d) {
            return algo.flowWidth(Math.abs(Graph.instance.nodes.get(d.id).state.exess))
        })
//         .style("display",(s.id != STATUS_FINISHED) ? "block" : "none");

    }

    this.onEdgesEntered = function(selection) {
         selection.append("line")
            .attr("class", "cap")
            .style("stroke-width",function(d){return algo.flowWidth(d.resources[0])})

          selection.append("line")
            .attr("class", "flow")
    }
    
    this.onEdgesUpdated = function(selection) {
        selection.selectAll("line.flow")
            .style("stroke-width",function(d){return algo.flowWidth(Graph.instance.edges.get(d.id).state.flow)})

    }



    //Axis
    var xAxis = d3.svg.axis().scale(this.x).orient("bottom").tickFormat(d3.format("d")).tickSubdivide(0);
    var yAxis = d3.svg.axis().scale(this.y).orient("left");

    this.svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + this.height + ")")
          .call(xAxis)
        .append("text")
          .attr("class", "label")
          .attr("x", this.width)
          .attr("y", 15)
          .style("text-anchor", "end")
          .text("id");

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
        return +d.id;
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

        this.x.domain([0,d3.max(nodes, function(d) { return +d.id})]);
        this.y.domain([0,d3.max(nodes, function(d) { return d.state.height})]);

        var t = this.svg.transition().duration(250);
        t.select("g.y.axis").call(yAxis);
        t.select("g.x.axis").call(xAxis);

        HeightfunctionDrawer.prototype.update.call(this);
    }

} //end constructor GraphDrawer
HeightfunctionDrawer.prototype = Object.create(GraphDrawer.prototype);
HeightfunctionDrawer.prototype.constructor = HeightfunctionDrawer;
