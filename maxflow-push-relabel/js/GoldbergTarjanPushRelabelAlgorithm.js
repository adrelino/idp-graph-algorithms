/**
 * @author Adrian Haarbach
 * Tarjan Goldberg's Push-Relabel Algorithmus
 */

function GoldbergTarjanPushRelabelAlgorithm(graph,svg) {
    GraphDrawer.call(this,graph,svg);
    
    /**
     * ID des Intervals, der für das "Vorspulen" genutzt wurde.
     * @type Number
     */
    var fastForwardIntervalID = null;

    /**
     * Closure Variable für dieses Objekt
     * @type HAlgorithm
     */
    var that = this;
    var algo = that;

    var debugConsole = true;

    var id = 0;
    var STATUS_SELECTSOURCE = id++;
    var STATUS_SELECTTARGET = id++;
    var STATUS_START = id++;
    var STATUS_INITPREFLOW = id++;
    var STATUS_INITDISTANCEFUNCTION = id++;
    var STATUS_MAINLOOP = id++;
    var STATUS_ADMISSIBLEPUSH = id++;
    var STATUS_PUSH = id++;
    var STATUS_ADMISSIBLERELABEL = id++;
    var STATUS_RELABEL = id++;
    var STATUS_FINISHED = id;

    /**
     * status variables
     */
    s = {
        id : 0, //status id
        currentNodeId : -1,
        activeNodeIds : [],
        sourceId : -1,
        targetId : -1
//         currentPseudoCodeLine :[1] // Liste der aktuell markierten Zeilen im Pseudocode @type {Array}
    }

    var colormap=["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"].reverse();
  
    function flowWidth(val){
     var maxCap = d3.max(this.graph.getEdges(),function(d){return d.resources[0]});
     return 25*(val/maxCap);
    }

  this.nodeLabel = function(d){
      if(d.id==s.sourceId) return "s";
      else if (d.id==s.targetId) return "t";
      else return d.id;
  }

  this.nodeText = function(d){
      return d.state.exess + "," + d.state.height;
  }

  this.edgeText = function(d){
      return d.state.flow + "/" + d.resources[0];
  }

  this.onNodesEntered = function(selection) {
     //select source and target nodes
     selection
      .on("click", function(d){
          if(s.id == STATUS_SELECTSOURCE || s.id == STATUS_SELECTTARGET && d.id != s.sourceId){
              that.nextStepChoice(d);
          }
      })

//       selection.append("text")
//         .attr("class","height")
//         .attr("dy", "-1.2em")           // set offset y position
//         .attr("text-anchor", "left");

//       selection.append("text")
//         .attr("class","exess unselectable")
//         .attr("dy", "2.0em")           // set offset y position
//         .attr("text-anchor", "right");

      selection.append("rect")
        .attr("class","exessBar unselectable")
        .attr("x","20")
        .attr("width",10);
  }

  this.onNodesUpdated = function(selection){
      selection
      .selectAll("circle")
       .style("stroke", function(d){
        if(d.id==s.currentNodeId){
          return const_Colors.NodeBorderHighlight;
        }else{
          return global_NodeLayout['borderColor'];
        }
      })
     .style("stroke-width",function(d){
      if(s.activeNodeIds.indexOf(d.id)>=0){
        return "5px";
      }else if(d.id==s.currentNodeId){
        return "7px";
      }else{
        return "2px";
      } 
    })
    .style("fill",function(d){
       if(d.id==s.sourceId) return const_Colors.NodeFillingHighlight;
       if(d.id==s.targetId) return const_Colors.NodeFillingQuestion;// NodeFillingLight
       return global_NodeLayout['fillStyle'];
//        return colormap[Math.min(10,d.height)];
    })

//     selection.selectAll(".exess")
//         .transition()
//         .text(function(d){return "e:"+d.exess})

//     selection.selectAll(".height")
//         .transition()
//         .text(function(d){return "h:"+d.height});

  var h = 20;

    selection.selectAll(".exessBar")
    .transition()
    .attr("y",function(d){return h-flowWidth(Math.abs(d.state.exess))})
    .attr("height",function(d){return flowWidth(Math.abs(d.state.exess))});
  }

  this.onEdgesEntered = function(selection) {
    
  }

  this.onEdgesUpdated = function(selection) {

  }


    /**
     * Replay Stack, speichert alle Schritte des Ablaufs für Zurück Button
     * @type {Array}
     */
    var replayHistory = new Array();


    /**
     * Initialisiert das Zeichenfeld
     * @method
     */
    this.init = function() {
        // Die Buttons werden erst im Javascript erstellt, um Problemen bei der mehrfachen Initialisierung vorzubeugen.
        $("#ta_div_abspielbuttons").append("<button id=\"ta_button_Zurueck\">"+LNG.K('algorithm_btn_prev')+"</button>"
                        +"<button id=\"ta_button_1Schritt\">"+LNG.K('algorithm_btn_next')+"</button>"
                        +"<button id=\"ta_button_vorspulen\">"+LNG.K('algorithm_btn_frwd')+"</button>"
                        +"<button id=\"ta_button_stoppVorspulen\">"+LNG.K('algorithm_btn_paus')+"</button>");
        $("#ta_button_stoppVorspulen").hide();
        $("#ta_button_Zurueck").button({icons:{primary: "ui-icon-seek-start"}, disabled: true});
        $("#ta_button_1Schritt").button({icons:{primary: "ui-icon-seek-end"}, disabled: true});
        $("#ta_button_vorspulen").button({icons:{primary: "ui-icon-seek-next"}, disabled: true});
        $("#ta_button_stoppVorspulen").button({icons:{primary: "ui-icon-pause"}});
        $("#ta_div_statusTabs").tabs();
//         $(".marked").removeClass("marked");
//         $("#ta_p_l1").addClass("marked");
        $("#ta_tr_LegendeClickable").removeClass("greyedOutBackground");
        this.registerEventHandlers();

        //prepare graph for this algorithm: add special properties to nodes and edges
        this.graph.nodes.forEach(function(key,node){
            node.state.height=0;
            node.state.exess=0;
        })

        this.graph.edges.forEach(function(key,edge){
            edge.state.flow=0;
        })

        var sel = d3.select("#ta_div_statusPseudocode").selectAll("div").selectAll("p")
        sel.attr("class",function(a,pInDivCounter,divCounter){
            return "pseudocode";
        });

        this.updateDescriptionAndPseudocode();
    };
    
    /**
     * When Tab comes into view
     * speichert das Ergebnis im .data() Feld von body
     * @method
     */
    this.activate = function() {
        this.update();
    };
    
    /**
     * tab disappears from view
     * @method
     */
    this.deactivate = function() {
        this.stopFastForward();
//         this.deregisterEventHandlers();
    };

     /**
     * Registriere die Eventhandler an Buttons und canvas<br>
     * Nutzt den Event Namespace ".HAlgorithm"
     * @method
     */
    this.registerEventHandlers = function() {
        $("#ta_button_1Schritt").on("click.HAlgorithm", function() { algo.singleStepHandler(); });
        $("#ta_button_vorspulen").on("click.HAlgorithm", function() { algo.fastForwardAlgorithm(); });
        $("#ta_button_stoppVorspulen").on("click.HAlgorithm", function() { algo.stopFastForward(); });
        $("#ta_button_Zurueck").on("click.HAlgorithm", function() { algo.previousStepChoice(); });
    };
    
    /**
     * Entferne die Eventhandler von Buttons und canvas im Namespace ".HAlgorithm"
     * @method
     */
    this.deregisterEventHandlers = function() {
//         canvas.off(".HAlgorithm");
        $("#ta_button_1Schritt").off(".HAlgorithm");
        $("#ta_button_vorspulen").off(".HAlgorithm");
        $("#ta_button_stoppVorspulen").off(".HAlgorithm");
        $("#ta_tr_LegendeClickable").off(".HAlgorithm");
        $("#ta_button_Zurueck").off(".HAlgorithm");
    };
    
    /**
     * Zeigt and, in welchem Zustand sich der Algorithmus im Moment befindet.
     * @returns {Number} StatusID des Algorithmus
     */
    this.getStatusID = function() {
        return statusID;
    };
   
    
    /**
     * Wird aufgerufen, wenn der "1 Schritt" Button gedrückt wird.
     * @method
     */
    this.singleStepHandler = function() {
        this.nextStepChoice();
    };

    /**
     * "Spult vor", führt den Algorithmus mit hoher Geschwindigkeit aus.
     * @method
     */
    this.fastForwardAlgorithm = function() {
        $("#ta_button_vorspulen").hide();
        $("#ta_button_stoppVorspulen").show();
        $("#ta_button_1Schritt").button("option", "disabled", true);
        $("#ta_button_Zurueck").button("option", "disabled", true);
        var geschwindigkeit = 200;	// Geschwindigkeit, mit der der Algorithmus ausgeführt wird in Millisekunden

        fastForwardIntervalID = window.setInterval(function(){algo.nextStepChoice();},geschwindigkeit);
    };
    
    /**
     * Stoppt das automatische Abspielen des Algorithmus
     * @method
     */
    this.stopFastForward = function() {
        $("#ta_button_vorspulen").show();
        $("#ta_button_stoppVorspulen").hide();
        $("#ta_button_1Schritt").button("option", "disabled", false);
        $("#ta_button_Zurueck").button("option", "disabled", false);
        window.clearInterval(fastForwardIntervalID);
        fastForwardIntervalID = null;
    };
   

    this.setDisabledBackward = function(disabled){
        $("#ta_button_Zurueck").button("option", "disabled", disabled);
    };

    this.setDisabledForward = function(disabled,disabledSpulen){
        var disabledSpulen = disabledSpulen || disabled;
        $("#ta_button_1Schritt").button("option", "disabled", disabled);
        $("#ta_button_vorspulen").button("option", "disabled", disabledSpulen);
    };
    
    /**
     * playback the last step from stack
     * @method
     */
    this.previousStepChoice = function() {

        var oldState = replayHistory.pop();
        if(debugConsole) console.log("Replay Step", oldState);

        graph.setState(oldState.graphState);
        s = JSON.parse(oldState.s);
//         $("#ta_div_statusErklaerung").html(oldState.htmlSidebar);
        $("#tab_ta").find(".LegendeText").html(oldState.legende);

        this.updateDescriptionAndPseudocode();
        this.update();

        if(s.id == STATUS_SELECTSOURCE) {
            this.setDisabledBackward(true);
            this.setDisabledForward(true);
        }else if(s.id == STATUS_SELECTTARGET){
            this.setDisabledForward(true);
        }else if(s.id == id) {
            this.setDisabledForward(true);
        }
    };

    /**
     * updates status description and pseudocode highlight based on current s.id
     * @method
     */
    this.updateDescriptionAndPseudocode = function() {
        var sel = d3.select("#ta_div_statusPseudocode").selectAll("div").selectAll("p")
        sel.classed("marked",function(a,pInDivCounter,divCounter){
            return divCounter==s.id;
        });

        var sel = d3.select("#ta_div_statusErklaerung").selectAll("div");
        sel.style("display",function(a,divCounter){
            return (divCounter == s.id) ? "block" : "none";
        });
//         s.currentPseudoCodeLine = lineArray;
//         $(".marked").removeClass('marked');
//         for(var i = 0; i < lineArray.length; i++) {
//             $("#ta_p_l"+lineArray[i]).addClass('marked');
//         }
    };

    /**
     * add a step to the replay stack
     * @method
     */
    this.addReplayStep = function() {

        replayHistory.push({
            "graphState" : graph.getState(),
            "s": JSON.stringify(s),
//             "htmlSidebar": $("#ta_div_statusErklaerung").html(),
            "legende": $("#tab_ta").find(".LegendeText").html(),
        });

        if(debugConsole) console.log("Current History Step: ", replayHistory[replayHistory.length-1]);

    };


///////////////////////
///Actual algorithm steps

     /**
     * Führt den nächsten Algorithmenschritt aus
     * @method
     */
    this.nextStepChoice = function(d) {

        if(debugConsole) console.log("Current State: " + s.id);

        // Speichere aktuellen Schritt im Stack
        this.addReplayStep();

        switch(s.id) {
        case STATUS_SELECTSOURCE:
            this.selectSource(d);
            break;
        case STATUS_SELECTTARGET:
            this.selectTarget(d);
            break;
        case STATUS_START:
            s.id++; //nothing really to do
            break;
        case STATUS_INITPREFLOW:
            initPreflow();
            break;
        case STATUS_INITDISTANCEFUNCTION:
            initDistanceFunction();
            break;
        case STATUS_MAINLOOP:
            mainLoop();
            break;
        case STATUS_ADMISSIBLEPUSH:
            admissiblePush();
            break;
        case STATUS_PUSH:
            push();
            break;
        case STATUS_ADMISSIBLERELABEL:
            admissibleRelabel();
            break;
        case STATUS_RELABEL:
            relabel();
            break;
        default:
            console.log("Fehlerhafter State");
            break;
        }

        // Aktualisiere Markierungen im Pseudocode
        this.updateDescriptionAndPseudocode();
        //aktualisiere Graph;
        this.update();
    };


    /**
     * select the source node
     */
    this.selectSource = function(d) {
        s.sourceId=d.id;
        this.setDisabledBackward(false);
        s.id = STATUS_SELECTTARGET;
    };

    /**
     * select the target node
     */
    this.selectTarget = function(d) {
        s.targetId=d.id;        
        this.setDisabledForward(false);
        s.id = STATUS_START;
    };


/////////////
//following is push relabel algo //corman page 741, ahuja page 227

/**
 * initialize the preflow
 */
function initPreflow(){
  var source = this.graph.nodes.get(s.sourceId);
  var forwardStar = source.getOutEdges();
  
  for(var i=0; i<forwardStar.length; i++){
    var e = forwardStar[i];
    //init preflow from source node
    e.state.flow = e.resources[0];
    source.state.exess -= e.state.flow;
    //add node to active queue
    if(e.end.id != s.targetId){
      e.end.state.exess = e.state.flow;
      s.activeNodeIds.push(e.end.id);
    }
  }

  s.id = STATUS_INITDISTANCEFUNCTION;
}

/**
 * initialize the distance function
 */
function initDistanceFunction(){
  var source = this.graph.nodes.get(s.sourceId);
  var target = this.graph.nodes.get(s.targetId);

  source.state.visited = true;
  target.state.visited = true;

  source.state.height=this.graph.getNodes().length;
  target.state.height=0;

  var queue = [target];

//BFS traversal
  while(queue.length>0){
    var node = queue.shift();
      var inEdges = node.getInEdges();
      for(var i=0; i<inEdges.length; i++){
        var neighbourNode = inEdges[i].start;
        if(!neighbourNode.state.visited){
          queue.push(neighbourNode);
          neighbourNode.state.visited=true;
          neighbourNode.state.height=node.state.height + 1;
        }
      }
  }

  s.id++;
}

/**
 * main loop: pops the current node from the queue until empty
 */
function mainLoop(){
    if(s.activeNodeIds.length==0){
        s.id=STATUS_FINISHED;
        return;
    }

    s.currentNodeId = s.activeNodeIds.shift();

    s.id=STATUS_ADMISSIBLEPUSH;
//   if(active.length>0){
//    var currentNode = active.shift();
//    logger2("selected node "+currentNode.id+":");
//    var legalNeighbour;
//    while((legalNeighbour=getLegalEdgeInResidualNetwork(currentNode)) && currentNode.exess >0){
//      push(currentNode,legalNeighbour,source,target,active);
//    }

//    if(node.exess > 0 && legalNeighbour==null){
//     relabel(currentNode,active);
//    }
//   }else{
//     stepNum++
//   }
// }

// function mainLoopStepped(){
//   if(currentNode){
//     var legalNeighbour=getLegalEdgeInResidualNetwork(currentNode);
//     if(legalNeighbour && currentNode.exess >0){
//       var nonsat = push(currentNode,legalNeighbour,source,target,active);
//       if(currentNode.exess==0 || nonsat) currentNode=null;
//     }else if(currentNode.exess >0){
//       relabel(currentNode,active);
//       currentNode=null;
//     }else{
//       currentNode=null;
//     }
//   }else if(active.length>0){
//    currentNode = active.shift();
//    logger2("selected node "+currentNode.id+":");
//   }else{
//     stepNum++;
//   }
}

/**
 * checks if we can apply a push operation. Together with push() mimics the inner WHILE loop
 */
function admissiblePush(){
    var v = this.graph.nodes.get(s.currentNodeId);
    if(v.state.exess > 0 && getLegalResidualEdge(v)){
        s.id=STATUS_PUSH;
    }else{
        s.id=STATUS_ADMISSIBLERELABEL;
    }
}

/**
 * apply a push operation on the current node
 */
function push(){
  var v = this.graph.nodes.get(s.currentNodeId);
  var e_dash = getLegalResidualEdge(v); //e' G'
  var edge = e_dash.correspondingEdge; //e in G
  var w = e_dash.isForwardEdge ? edge.end : edge.start;

  var delta = Math.min(v.state.exess,e_dash.c_dash);

  if(e_dash.isForwardEdge){
    edge.state.flow += delta;
  }else{
    edge.state.flow -=delta;
  }

  v.state.exess -= delta;
  w.state.exess += delta;

  if(w.id != s.sourceId && w.id != s.targetId && s.activeNodeIds.indexOf(w.id)==-1){
    s.activeNodeIds.push(w.id);
  }

//   var sat = e_dash.c_dash == 0 ? " [saturating] " : " [nonsaturating] ";
//   logger3("push "+delta+" from "+v.id+" to "+w.id + sat);
  s.id=STATUS_ADMISSIBLEPUSH;
}

/**
 * checks if we can apply a relabel operation. This mimics and IF, since relabel() returns to outer while loop
 */
function admissibleRelabel(){
    var v = this.graph.nodes.get(s.currentNodeId);
    if(v.state.exess > 0 && getLegalResidualEdge(v)==null){ //todo: check if e_dash can ever be not null here, since we pushed till we saturated all edges beforehand anyways
        s.id=STATUS_RELABEL;
    }else{
        s.id=STATUS_MAINLOOP; //jump to loop head
    } 
}

/**
 * apply a relabel operation on the current node
 */
function relabel(){
  var node = this.graph.nodes.get(s.currentNodeId);
  
  var residualEdges = getAllOutgoingResidualEdges(node);

  var newheight = 1 + d3.min(residualEdges,function(d){
    //TODO
    return d.isForwardEdge ? d.correspondingEdge.end.state.height : d.correspondingEdge.start.state.height;
  });

//   logger3("relabel "+node.id+" from "+node.state.height+" to "+newheight);
  node.state.height = newheight;
  s.activeNodeIds.push(node.id);

  s.id=STATUS_MAINLOOP;
}

function residualCap(edge,forward){ //if residualCap == 0, there is actually no edge in residual network
  if(forward){
    return edge.resources[0] - edge.state.flow;
  }else{
    return edge.state.flow;
  }
}

function getLegalResidualEdge(node){
  var outEdges = node.getOutEdges();
  /*forward edges*/
  for(var i=0; i<outEdges.length; i++){
      var edge = outEdges[i];
      if(node.state.height==edge.end.state.height+1 && (c_dash=residualCap(edge,true))>0){
        return {correspondingEdge : edge, isForwardEdge: true, c_dash : c_dash };
      }
  }

  var inEdges = node.getInEdges();
  /*backward edges*/
  for(var i=0; i<inEdges.length; i++){
      var edge = inEdges[i];
      if(node.state.height==edge.start.state.height+1 && (c_dash=residualCap(edge,false))>0){
        return {correspondingEdge : edge, isForwardEdge: false, c_dash : c_dash };
      }
  }
  
  return null;
}

function getAllOutgoingResidualEdges(node){ //not necessarily legal, forward star of node in G'
  var e_dashes=[];

  var outEdges = node.getOutEdges();
  /*forward edges*/
  for(var i=0; i<outEdges.length; i++){
      var edge = outEdges[i];
      if((c_dash=residualCap(edge,true))>0){
        e_dashes.push({correspondingEdge : edge, isForwardEdge: true, c_dash : c_dash });
      }
  }

  var inEdges = node.getInEdges();
  /*backward edges*/
  for(var i=0; i<inEdges.length; i++){
      var edge = inEdges[i];
      if((c_dash=residualCap(edge,false))>0){
        e_dashes.push({correspondingEdge : edge, isForwardEdge: false, c_dash : c_dash });
      }
  }
  
  return e_dashes;
}


    
}

// Vererbung realisieren
GoldbergTarjanPushRelabelAlgorithm.prototype = Object.create(GraphDrawer.prototype);
GoldbergTarjanPushRelabelAlgorithm.prototype.constructor = GoldbergTarjanPushRelabelAlgorithm;