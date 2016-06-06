var CONSTRAINED_RESOURCE_INDEX = 0; //the other one is unconstrained but should be minimized. E.g.: min cost, constrained time


//http://stackoverflow.com/questions/3145030/convert-integer-into-its-character-equivalent-in-javascript
function idOf(i) {
    return (i >= 26 ? idOf((i / 26 >> 0) - 1) : '') +
        'abcdefghijklmnopqrstuvwxyz'[i % 26 >> 0];
}

/**
 * A Label, built as a tree starting from the primitive label
 * @class
 */
Graph.Label = function() {
  this.arcIds = [];

  //just save both ids (a little reduntant) for easy access and serialization 
//  this.arcId = arc.id; //incoming arc
  this.nodeId = null; //= arc.end.id; //this label is resident (==ending) at node node
//  this.id = (parent ? (parent.id + "->") : "" ) + this.nodeId; //that.nodeLabel(Graph.instance.nodes.get(this.nodeId));

  this.resources = [0,0];
  this.wait = null;

  this.id = idOf(Graph.Label.labelIds++);

  Graph.Label.labels.set(this.id,this);
}

Graph.Label.reset = function(){
  Graph.Label.labelIds = 0; //assign unique ids to labels
  Graph.Label.labels = d3.map(); //assign unique ids to labels
}

Graph.Label.reset();

Graph.Label.getState = function(){
  var state = { labelIds : Graph.Label.labelIds, keys : Graph.Label.labels.keys() };
  return state;
}
//https://github.com/d3/d3/wiki/Arrays#d3_map
Graph.Label.setState = function(state){
  
  Graph.Label.labelIds = state.labelIds;
  
  var keysCurrent = Graph.Label.labels.keys();
  for(var i=0; i<keysCurrent.length; i++){
    var k = keysCurrent[i];
    if(state.keys.indexOf(k)<0){
      Graph.Label.labels.remove(k); //label did not yet exist, remove it
    }
  }
}

Graph.Label.get = function(labelId){
  return Graph.Label.labels.get(labelId);
}

Graph.Label.prototype.edgeIdChain = function(){
  return this.arcIds.join("->")
}

Graph.Label.prototype.nodeIdChain = function(){
  return this.arcIds.map(function(arcId){
    return Graph.instance.edges.get(arcId).end.id;
  }).join("->");
}

//static method, not instance, so that we can serialize more easily
Graph.Label.toString = function(label) {
    return label.id +" edges:" +label.edgeIdChain() + " nodes:" +label.nodeIdChain() + " resources:("+ label.resources.map(function(d,i){
        return "<span style=color:" + ((i==CONSTRAINED_RESOURCE_INDEX) ? "red" : "green") + ">"+d+"</span>";
    }).join(",")+")";
}

/**
 * Checks weather a label fulfills all its resource constraints in its resident node
 * @param{Label} label
 */
Graph.Label.feasible = function(label) {
    // var residentVertex = label.edges.get(label.arcId).end;
    var residentVertex =  Graph.instance.nodes.get(label.nodeId);
    if(label.resources[CONSTRAINED_RESOURCE_INDEX]<=residentVertex.resources[1]){ // timewindow [resources[0],resources[1]]; cost is unconstrained
        if(label.resources[CONSTRAINED_RESOURCE_INDEX]>=residentVertex.resources[0]){ //nothing to do
//                console.log2("waiting time of "+diff+" at "+label.nodeId);
        }else{
           label.wait = residentVertex.resources[0] - label.resources[CONSTRAINED_RESOURCE_INDEX]; //saved so we can draw a nice path
           logger.log3("waiting time of "+residentVertex.resources[0]+"-"+label.resources[CONSTRAINED_RESOURCE_INDEX]+"="+l_dash.wait+" at "+l_dash.nodeId);
           label.resources[CONSTRAINED_RESOURCE_INDEX]=residentVertex.resources[0];
        }
        return true;
    }else{
        return false;
    }
}

/**
 * Static factory function
 * extends a label along the arc and returns a new label
 *
 * @param{Label} label
 * @return Label
 */
Graph.Label.extend = function(parent, arc) { //arc is an actual Graph.Edge or a fake trivial path {id:-1, end:source}
  var label = new Graph.Label();

  label.arcIds = parent.arcIds.concat([arc.id]);

  label.nodeId = arc.end.id;
  
  //accumulate resources
  for (var i = 0; i < parent.resources.length; i++) {
    label.resources[i] = arc.resources[i]+parent.resources[i]; //TODO changes to min(r(w),e+l_parent) later
  };

  return label;
}

Graph.Label.trivial = function(sourceId){
  var source = Graph.instance.nodes.get(sourceId);

  var label = new Graph.Label();
  label.resources[CONSTRAINED_RESOURCE_INDEX] = source.resources[0]; //[0] is lower, [1] is upper limit on constrained resource
  label.nodeId = sourceId;

  return label;
}