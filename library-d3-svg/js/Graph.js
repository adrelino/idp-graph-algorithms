/**
 * @author Adrian Haarbach
 * This file contains just our basic graph represantation, together with methods to parse and sequentialize the graph.
 * @requires d3.map
 */

/**
 * Represents a graph
 * @constructor
 */
var Graph = function(){
  this.nodeIds=0;
  this.edgeIds=0;
  this.nodes=d3.map();
  this.edges=d3.map();
}

/**
 * Represents a graph node
 * @constructor
 */
Graph.Node = function(x,y,id){
  this.x=x;
  this.y=y;
  this.id=id;
  this.resources = [];
  
  this.outEdges = d3.map();
  this.inEdges = d3.map();

  this.state={};//changes during algorithm runtime
}

Graph.Node.prototype.getInEdges = function(){
  return this.inEdges.values();
}

Graph.Node.prototype.getOutEdges = function(){
  return this.outEdges.values();
}

function styleResources(resources,left,right,f){
  var f = f || function(d){return d};
  var str = resources.map(f).join(",");
  if(resources.length>1) str = left + str + right;
  return str;
}

Graph.Node.prototype.toString = function(full,f){
  var str="";
  if(full) str += this.id+" ";
  str +=styleResources(this.resources,"[","]",f);
  return str;
}

/**
 * Represents a graph edge
 * @constructor
 */
Graph.Edge = function(s,t,id){
  this.start=s;
  this.end=t;
  this.id=id;
  this.resources=[];

  this.state={}; //changes during algorithm runtime
}

Graph.Edge.prototype.toString = function(full,f){
  var str="";
  if(full) str += this.start.id+"->"+this.end.id+" ";
  str += styleResources(this.resources,"(",")",f);
  return str;
}

/////////////////
//MEMBERS

/**
 * add a node to the graph
 * @param {Number|String} x coordinate
 * @param {Number|String} y coordinate
 */
Graph.prototype.addNode = function(x,y,resources){
  var node = new Graph.Node(+x,+y,this.nodeIds++);
  node.resources=resources || [];
  for(var i = 0, toAdd = this.getNodeResourcesSize() - node.resources.length; i<toAdd; i++){
    node.resources.push(0);
  }
  this.nodes.set(node.id,node);
  return node;
}

Graph.prototype.addNodeDirectly = function(node){
  node.id = this.nodeIds++;
  for(var i = 0, toAdd = this.getNodeResourcesSize() - node.resources.length; i<toAdd; i++){
    node.resources.push(0);
  }
  this.nodes.set(node.id,node);
  return node;
}

/**
 * add an edge to the graph
 * @param {Number|String} id of start node
 * @param {Number|String} id of end node
 */
Graph.prototype.addEdge = function(startId,endId,resources){
  var s = this.nodes.get(startId);
  var t = this.nodes.get(endId);
  var edge = new Graph.Edge(s,t,this.edgeIds++);
  edge.resources=resources;
  edge.start.outEdges.set(edge.id,edge);
  edge.end.inEdges.set(edge.id,edge);
  this.edges.set(edge.id,edge);
  return edge;
}

Graph.prototype.addEdgeDirectly = function(edge){
  edge.id = this.edgeIds++;
  edge.start.outEdges.set(edge.id,edge);
  edge.end.inEdges.set(edge.id,edge);
  this.edges.set(edge.id,edge);
  var max = this.getEdgeResourcesSize();
  while(edge.resources.length<max) edge.resources.push(0);
  return edge;
}

Graph.prototype.removeNode = function(id){
  var that=this;
  var node = this.nodes.get(id);
  node.outEdges.forEach(function(key,value){
      that.removeEdge(key);
  });
  node.inEdges.forEach(function(key,value){
      that.removeEdge(key);
  });
  this.nodes.remove(id);
  return node;
}

Graph.prototype.removeEdge = function(id){
    return this.edges.remove(id);
}

Graph.prototype.getNodes = function(){
//   return this.__nodesArr || (this.__nodesArr = this.nodes.values());  //TODO just for testing update pattern
  return this.nodes.values();
}

Graph.prototype.getEdges = function(){
//   return this.__edgesArr || (this.__edgesArr = this.edges.values());
  return this.edges.values();
}

Graph.prototype.toString = function(){
  var lines = []; //text.split("\n");

  lines.push("% Graph saved at "+new Date());

  this.nodes.forEach(function(key,node){
      var line = "n " + node.x + " " + node.y;
      if(node.resources.length>0) line +=" "+node.resources.join(" ");
      lines.push(line);
  });
  this.edges.forEach(function(key,edge){
      var line = "e " + edge.start.id + " " + edge.end.id;
      if(edge.resources.length>0) line +=" "+edge.resources.join(" ");
      lines.push(line);
  });

  return lines.join("\n");
}

Graph.prototype.getNodeResourcesSize = function(){
  var max=0;
  this.nodes.forEach(function(key,node){
     max = Math.max(max,node.resources.length);
  });
  return max;
}

Graph.prototype.getEdgeResourcesSize = function(){
  var max=0;
  this.edges.forEach(function(key,edge){
     max = Math.max(max,edge.resources.length);
  });
  return max;
}

Graph.prototype.replace = function(oldGraph){
  this.nodeIds = oldGraph.nodeIds;
  this.edgeIds = oldGraph.edgeIds;
  this.nodes = oldGraph.nodes;
  this.edges = oldGraph.edges;
}

Graph.prototype.getState = function(){
  var savedState = { nodes : {}, edges : {} };
  this.nodes.forEach(function(key,node){
     savedState.nodes[key] = JSON.stringify(node.state);
  });
  this.edges.forEach(function(key,edge){
     savedState.edges[key] = JSON.stringify(edge.state);
  });
  return savedState;
}

Graph.prototype.setState = function(savedState){
  this.nodes.forEach(function(key,node){
     node.state = JSON.parse(savedState.nodes[key]);
  });
  this.edges.forEach(function(key,edge){
     edge.state = JSON.parse(savedState.edges[key]);
  });
}

/////////////////
//STATICS

/**
 * Graph Parser factory method
 * @static
 * @method
 * @param {String} text - sequentialized Graph
 * @return {Graph} - parsed Graph object
 */
Graph.parse = function(text){
  var lines = text.split("\n");

  var graph = new Graph();

  function parseResources(s){
      var resources = [];
      for(var i=3; i<s.length; i++){
          resources.push(+s[i]);
      }
      return resources;
  }

  // Nach Zeilen aufteilen
  for (var line in lines) {
      var s = lines[line].split(" ");
      // Nach Parametern aufteilen
      if (s[0] == "%") { //comment
          continue;
      }
      //x y r1 r2 ...
      if (s[0] == "n") {
        graph.addNode(s[1],s[2],parseResources(s));
      }
      //s t r1 r2 ... 
      if (s[0] == "e") {
        graph.addEdge(s[1],s[2],parseResources(s));
      };
  }

  if(graph.nodeIds==0 && graph.edgeIds==0){
    throw "parse error";
  }

  return graph;
}

Graph.load = function(filename, callbackFp){
  d3.text(filename, function(error,text){
    var graph = Graph.parse(text);
    callbackFp(graph);
  });
}

Graph.setInstance = function(error,text,filename,exceptionFp){
    if(error != null){
      exceptionFp(error,text,filename);
      return;
    };
    try{
      Graph.instance = Graph.parse(text);
      Graph.onLoadedCbFP.forEach(function(fp){fp()});
    }catch(ex){
      if(exceptionFp) exceptionFp(ex,text,filename);
      else console.log(ex,text,filename);
    }
}

Graph.loadInstance = function(filename,exceptionFp){
  d3.text(filename, function(error,text){
    Graph.setInstance(error,text,filename,exceptionFp)
  });
}

Graph.instance = null;

Graph.onLoadedCbFP = [];

Graph.addChangeListener = function(callbackFp){
  Graph.onLoadedCbFP.push(callbackFp);
}

Graph.handleFileSelect = function(evt,exceptionFp) {
    var files = evt.target.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

      // Only process image files.
      if (!f.type.match('text/plain')) {
        exceptionFp("wrong mimetype",f.type);
        continue;
      }

      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          var error = e.target.error;
          var text = e.target.result;
          var filename = theFile.name;
          Graph.setInstance(error,text,filename,exceptionFp)
        };
      })(f);

      // Read in the image file as a data URL.
      reader.readAsText (f);
    }
}