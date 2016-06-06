var CONSTRAINED_RESOURCE_INDEX = 0; //the other one is unconstrained but should be minimized. E.g.: min cost, constrained time

/**
 * A Label, built as a tree starting from the primitive label
 * @class
 */
Graph.Label = function(parent, arc) { //arc is an actual Graph.Edge or a fake trivial path {id:-1, end:source}
    this.parent = parent;
    //just save both ids (a little reduntant) for easy access and serialization 
    this.arcId = arc.id; //incoming arc
    this.nodeId = arc.end.id; //this label is resident (==ending) at node node
    this.id = (parent ? (parent.id + "->") : "" ) + this.nodeId; //that.nodeLabel(Graph.instance.nodes.get(this.nodeId));

    this.resources = [];
    if(parent==null){
        this.resources = [0,0]; //TODO allow adaptivity for > 2 resources;
        this.resources[CONSTRAINED_RESOURCE_INDEX] = arc.end.resources[0]; //[0] is lower, [1] is upper limit on constrained resource
    }else{
        for (var i = 0; i < parent.resources.length; i++) {
            var accumulated = arc.resources[i]+parent.resources[i]; //TODO changes to min(r(w),e+l_parent) later
            this.resources.push(accumulated);
        };
    }
}

//static method, not instance, so that we can serialize more easily
Graph.Label.prototype.toString = function() {
    return this.id + "("+ this.resources.map(function(d,i){
        return "<span style=color:" + ((i==CONSTRAINED_RESOURCE_INDEX) ? "red" : "green") + ">"+d+"</span>";
    }).join(",")+")";
}

/**
 * Checks weather a label fulfills all its resource constraints in its resident node
 * @param{Label} this
 */
Graph.Label.prototype.feasible = function() {
    // var residentVertex = this.edges.get(this.arcId).end;
    var residentVertex =  Graph.instance.nodes.get(this.nodeId);
    if(this.resources[CONSTRAINED_RESOURCE_INDEX]<=residentVertex.resources[1]){ // timewindow [resources[0],resources[1]]; cost is unconstrained
        if(this.resources[CONSTRAINED_RESOURCE_INDEX]>=residentVertex.resources[0]){ //nothing to do
//                console.log2("waiting time of "+diff+" at "+this.nodeId);
        }else{
           this.wait = residentVertex.resources[0] - this.resources[CONSTRAINED_RESOURCE_INDEX]; //saved so we can draw a nice path
           logger.log3("waiting time of "+residentVertex.resources[0]+"-"+this.resources[CONSTRAINED_RESOURCE_INDEX]+"="+l_dash.wait+" at "+l_dash.nodeId);
           this.resources[CONSTRAINED_RESOURCE_INDEX]=residentVertex.resources[0];
        }
        return true;
    }else{
        return false;
    }
}