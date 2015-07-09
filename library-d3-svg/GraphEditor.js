// function SpaceShip(scene, x, y) {
//   Actor.call(this, scene, x, y);
//   this.points = 0;
// }
// Calling the Actor constructor first ensures that all the instance properties created by Actor are added to the new object. After that, SpaceShip can define its own instance properties such as the ship’s current points count.
// In order for SpaceShip to be a proper subclass of Actor, its prototype must inherit from Actor.prototype. The best way to do the extension is with ES5’s Object.create:
// SpaceShip.prototype = Object.create(Actor.prototype);

// Things to Remember
// - Call the superclass constructor explicitly from subclass construc- tors, passing this as the explicit receiver.
// - Use Object.create to construct the subclass prototype object to avoid calling the superclass constructor.

var GraphEditor = function(graph, svgOrigin){
  GraphDrawer.call(this,graph,svgOrigin);

  this.type="GraphEditor";

  this.svgOrigin
    .on("dblclick",dblclick) //for adding new nodes
    .on("mousemove",mousemove)
    .on("mousedown",mousedown)
    .on("contextmenu", function(d){d3.event.stopPropagation();d3.event.preventDefault()});

  this.onNodesEntered = function(selection) {
//     console.log("onNodesEntered in GraphEditor");
    
    selection
      .on("mousedown", mousedownNode)
      .on("mouseup", mouseupNode)
      .on("contextmenu", contextmenuNode)
//       .style("cursor","move") //crosshair pointer move

//     GraphDrawer.prototype.onNodesEntered.call(this,selection);
  }

  this.onNodesUpdated = function(selection){
      selection
       .style("cursor",function(d){
        return (dragging && d == selectedNode) ? "move" : "pointer"
      })
      .selectAll("circle")
       .style("stroke", function(d){
        if(d==selectedNode){
          return const_Colors.NodeBorderHighlight;
        }else{
          return global_NodeLayout['borderColor'];
        }
      })

  }

  this.onEdgesEntered = function(selection) {
//     console.log("onEdgesEntered in GraphEditor");
    
    selection
      .on("dblclick",dblclickEdge)
      .on("contextmenu", contextmenuEdge)
      .style("cursor","pointer") //crosshair pointer move

//     GraphDrawer.prototype.onEdgesEntered.call(this,selection);
  }

  this.onEdgesUpdated = function(selection) {
//     console.log("onEdgesEntered in GraphEditor");
    
    selection
      .style("cursor",function(d){
        return (d == unfinishedEdge) ? "crosshair" : "pointer";
      }) //crosshair pointer move

//     GraphDrawer.prototype.onEdgesEntered.call(this,selection);
  }

    var that=this;

    /**
     * Zeigt an, ob wir im Moment die Maus bei gedrücktem Mauszeiger verschieben
     * (Drag and Drop)
     * @type Boolean
     */
    var dragging = false;

    /**
     * Zeigt an, ob wir beim letzten Event noch verschoben haben
     * (dann wir der aktuell ausgewählte Knoten abgewählt)
     * @type Boolean
     */
    var hasDragged = false;

    /**
     * Der aktuell ausgewählte Knoten
     * @type d3 Selection with typeof datum() == Graph.Node
     */
    var selectedNode = null;

    /**
     * Die aktuell ausgewählte Kante
     * @type d3 Selection with typeof datum() == Graph.Edge
     */
//     var selectedEdge = null;

    /**
      * line that is beeing drawn
      */
    var unfinishedEdge = null;


    var deselectNode = function(){
      if(selectedNode != null){
//         selectedNode.style("stroke","black");
        selectedNode = null;
      }
      unfinishedEdge = null;
          that.svgOrigin.style("cursor","default");

blurResourceEditor();
      that.updateNodes();
    }

    var selectNode = function(selection){
      selectedNode = selection;
//       selectedNode.style("stroke","red");
    }

    /**
     * End of mouseclick on a node
     * @method
     */
    function mouseupNode(){
      dragging = false;
      if(hasDragged){
        deselectNode();
      }else if(selectedNode){
        var endNode = new Graph.Node(selectedNode.x, selectedNode.y, "invisible");
        unfinishedEdge = new Graph.Edge(selectedNode,endNode,"unfinished");
        that.graph.addEdgeDirectly(unfinishedEdge);
        svgOrigin.style("cursor","crosshair") //crosshair
      }
      hasDragged = false;
      d3.event.stopPropagation(); //we dont want svg to receive the event
      that.updateNodes();
    }

    /**
      * moving a mouse on the svgOrigin
      */
    function mousemove(){
      if(selectedNode != null){
          var pos = d3.mouse(this);
          var xy = that.screenPosToNodePos(pos);
          //moving a node
          if(dragging){
//             d3.select(this).style("cursor","move");
            selectedNode.x = xy.x; //.datum()
            selectedNode.y = xy.y;
            hasDragged = true;
            that.update();
          }
          //drawing an edge
          else{
            unfinishedEdge.end.x = xy.x;
            unfinishedEdge.end.y = xy.y;
            that.updateEdges();
          }

       }
     }

function dblclick(){
  d3.event.preventDefault();d3.event.stopPropagation();
  var pos = d3.mouse(this);
  addNode(pos);
  
}

//Es wird entweder die Auswahl aufgehoben, ein Knoten ausgewählt oder eine Kante zwischen vorhandenen Knoten erstellt.
function mousedownNode(d,id){
  if(selectedNode == d){// Falls wir wieder auf den selben Knoten geklickt haben, hebe Auswahl auf.
      if(unfinishedEdge) that.graph.removeEdge(unfinishedEdge.id);
      deselectNode();
  }else if(selectedNode == null) { // Falls wir nichts ausgewählt hatten, wähle den Knoten aus
      dragging = true;
      selectNode(d);
  }else {// Füge Kante hinzu
//       graph.addEdge(selectedNode.id,d.id);
      unfinishedEdge.end=d; //throw away temporary end node;
      deselectNode();
      that.updateEdges();
  }

  that.update();

  blurResourceEditor();

  d3.event.stopPropagation(); //we dont want svg to receive the event
}
 //oder ein neuer erstellt (wenn grade kante gezeichnet wird),
// Wir haben nicht auf einem Knoten gestoppt 
// -> Falls etwas ausgewählt war, erstelle Knoten und zeichne Kante
function mousedown(a,b,c){
  if(selectedNode){ //unfinishedEdge starts in selectedNode
    var pos = d3.mouse(this);
//     var end = addNode(pos);
//     this.graph.addEdge(selectedNode,end);
//     this.updateEdges();
    that.graph.addNodeDirectly(unfinishedEdge.end);
    that.updateNodes();
    deselectNode();
  }

  blurResourceEditor();
}

function blurResourceEditor(){
  if(!myDiv) return;
    myDiv
    .style("opacity",1e-6)
    .style("left", "0px")
    .style("top", "0px");
}

var edgeToModify = null;

var myDiv = d3.select("body").append("input")
    .attr("type","number")
    .attr("class", "tooltip")
    .style("opacity", 1e-6)
    .on("input", function() {
      edgeToModify.resources[0]=(+this.value);
      that.updateEdges();
    })
//     .attr("onblur",blurResourceEditor);

function dblclickEdge(d,i,all)
{
  d3.event.stopPropagation();d3.event.preventDefault();

//     <input type="number" min="0" max="360" step="5" value="0" id="nValue">

  edgeToModify = d;

  myDiv
    .text("hi")
    .style("opacity", 1);

  var text = d3.select(this).select("text");

  myDiv.attr("value",d.resources[0])
      .style("left", (d3.event.pageX - 30) + "px")
     .style("top", (d3.event.pageY - 10)+ "px");
}

function contextmenuNode(d){
  deselectNode();
  d3.event.stopPropagation();d3.event.preventDefault();
  that.graph.removeNode(d.id);
  that.update();
}

function contextmenuEdge(d){
  deselectNode();
  d3.event.stopPropagation();d3.event.preventDefault();
  that.graph.removeEdge(d.id);
  that.updateEdges();
}


function addNode(pos){
  var xy = that.screenPosToNodePos(pos);
  that.graph.addNode(xy.x, xy.y);
  that.update();
//   return point;
}


}
GraphEditor.prototype = Object.create(GraphDrawer.prototype);