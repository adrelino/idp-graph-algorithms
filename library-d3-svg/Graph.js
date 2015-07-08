var Graph = function(text){
  this.nodeIds=0;
  this.edgeIds=0;
  this.nodes=d3.map();
  this.edges=d3.map();
  this.parse(text);
}

Graph.Node = function(x,y,id){
  this.x=x;
  this.y=y;
  this.id=id;

  this.outEdges = d3.map();
  this.inEdges = d3.map();

  this.resources = [];
}

Graph.Edge = function(s,t,id){
  this.start=s;
  this.end=t;
  this.id=id;

  this.resources=[];
}

Graph.prototype.addNode = function(x,y){
  var node = new Graph.Node(+x,+y,this.nodeIds++);
  this.nodes.set(node.id,node);
  return node;
}

Graph.prototype.addEdge = function(startId,endId){
  var s = this.nodes.get(startId);
  var t = this.nodes.get(endId);
  var edge = new Graph.Edge(s,t,this.edgeIds++);
  edge.start.outEdges.set(edge.id,edge);
  edge.end.inEdges.set(edge.id,edge);
  this.edges.set(edge.id,edge);
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
  delete node;
}

Graph.prototype.removeEdge = function(id){
    this.edges.remove(id);
}

Graph.prototype.parse = function(text){
  var lines = text.split("\n");

  // Nach Zeilen aufteilen
  for (var line in lines) {
      var s = lines[line].split(" ");
      // Nach Parametern aufteilen
      if (s[0] == "%") { //comment
          continue;
      }
      var elem = null;
      //x y r1 r2 ...
      if (s[0] == "n") {
        elem = this.addNode(s[1],s[2]);
      }
      //s t r1 r2 ... 
      if (s[0] == "e") {
        elem = this.addEdge(s[1],s[2]);
      };

      //resource vector / constraint
      if(elem){
          for(var i=3; i<s.length; i++){
              elem.resources.push(+s[i]);
          }
      }
  }

  return this;
}

Graph.prototype.toString = function(){
  var lines = []; //text.split("\n");

  lines.push("% Graph saved at "+new Date());

  this.nodes.forEach(function(key,node){
//       lines.push("% node id "+node.id);
      lines.push("n " + node.x + " " + node.y + " " + node.resources.join(" "));
  });
  this.edges.forEach(function(key,edge){
//       lines.push("% edge id "+edge.id);
      lines.push("e " + edge.start.id + " " + edge.end.id + " " + edge.resources.join(" "));
  });

  return lines.join("\n");
}

// var graphNum=5;

// d3.text("graphs/graph"+graphNum+".txt", function(error,text){
//   var g = new Graph(text);
//   //g.parse(text);
//   var test = g.toString();
//   console.log(text)
//   console.log(test);
// });

Graph.prototype.getNodes = function(){
  return this.nodes.values();
}

Graph.prototype.getEdges = function(){
  return this.edges.values();
}