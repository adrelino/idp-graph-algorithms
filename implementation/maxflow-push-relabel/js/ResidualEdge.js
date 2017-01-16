/**
 * @classdesc
 * Represents a residual edge in the residual Graph  G'
 * @constructor
 */
Graph.ResidualEdge = function(idOrObj, forward) {
  if(idOrObj && forward==null){ //from json.stringify
    this.id = idOrObj.id;
    this.forward = idOrObj.forward;
  }else{ //2 args constructor
    this.id = idOrObj;
    this.forward = forward;
  }
}

/**
 * The original edge of the graph G
 */
Graph.ResidualEdge.prototype.edge = function(){
  return Graph.instance.edges.get(this.id);
}

/**
 * The residual capacity
 */
Graph.ResidualEdge.prototype.c_dash = function(){
  var edge = this.edge();
  if (this.forward) {
      return edge.resources[0] - edge.state.flow;
  } else {
      return edge.state.flow;
  }
}

Graph.ResidualEdge.prototype.notnull = function(){
  var c = this.c_dash();
  return c > 0;
}

/**
 * The start vertex
 */
Graph.ResidualEdge.prototype.start = function(){
  var edge = this.edge();
  if(this.forward){
    return edge.start;
  }else{
    return edge.end;
  }
}

/**
 * The end vertex
 */
Graph.ResidualEdge.prototype.end = function(){
  var edge = this.edge();
  if(this.forward){
    return edge.end;
  }else{
    return edge.start;
  }
}

Graph.ResidualEdge.prototype.legal = function(){
  return this.start().state.height == this.end().state.height + 1 
}

Graph.ResidualEdge.prototype.increaseFlow = function(delta){
  var edge = this.edge();
  if (this.forward) {
      edge.state.flow += delta;
  } else {
      edge.state.flow -= delta;
  }
}

Graph.ResidualEdge.prototype.toString = function(nodeLabel,star) {
  var nodeLabel = nodeLabel || function(node){return node.id};
  var edgeText = "("+nodeLabel(this.start()) + "," + nodeLabel(this.end()) + ")" +(this.forward ? " --> " : " <-- ");
  if(!star){
    edgeText = "e'="+edgeText + "with c'=" + this.c_dash();
  }else{
    edgeText = "e*="+edgeText;
  }

  return edgeText;
}

//not necessarily legal, forward star of node in G'
Graph.Node.prototype.getAllOutgoingResidualEdges = function(unfiltered) {
  var e_dashes = [];

  /*forward edges*/
  this.outEdges.forEach(function(key, edge) {
      e_dashes.push(new Graph.ResidualEdge(key, true));
  });

  /*backward edges*/
  this.inEdges.forEach(function(key, edge) {
      e_dashes.push(new Graph.ResidualEdge(key, false));
  });

  if(unfiltered) return e_dashes;

  //If capacity == 0, we don't speak of an residual edge anymore
  var filteredEdges = e_dashes.filter(function(e_dash) {
      return e_dash.notnull();
  });

  return filteredEdges;
}

//function getLegalResidualEdge(node) {
Graph.Node.prototype.getLegalResidualEdge = function(node){

  var arrEdges = [this.outEdges.keys(),this.inEdges.keys()];
  var arrForward = [true,false];

  for(var i=0; i<2; i++){
    var ids = arrEdges[i];
    for(var j=0; j<ids.length; j++){
      var id = ids[j];
      var e_dash = new Graph.ResidualEdge(id, arrForward[i]);
      if(e_dash.notnull() && e_dash.legal()){
        return e_dash;
      }
    }
  }
  
  return null;
}