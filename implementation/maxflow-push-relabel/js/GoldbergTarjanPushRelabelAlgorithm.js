
var STATUS_SELECTSOURCE = 0;
var STATUS_SELECTTARGET = 1;
var STATUS_START = 2;
var STATUS_INITPREFLOW = 3;
var STATUS_INITDISTANCEFUNCTION = 4;
var STATUS_MAINLOOP = 5;
var STATUS_ADMISSIBLEPUSH = 6;
var STATUS_PUSH = 7;
var STATUS_ADMISSIBLERELABEL = 8;
var STATUS_RELABEL = 9;
var STATUS_FINISHED = 10;

/**
 * Goldberg Tarjan's Push-Relabel Algorithmus
 * @author Adrian Haarbach
 * @augments GraphDrawer
 * @class
 */
function GoldbergTarjanPushRelabelAlgorithm(svgSelection,svgSelection2) {
    GoldbergTarjanPushRelabelAlgorithmInstance=this;
    (isDebug() ? GraphEditor : GraphDrawer).call(this,svgSelection);

    /**
     * closure variables for this class
     * @type GoldbergTarjanPushRelabelAlgorithm
     */
    var that = this;
    var algo = that;
    
    /** 
     * debug states for replay steps to console
     */
    var debugConsole = false;
    
    /**
     * the logger instance
     * @type Logger
     */
    var logger = new Logger(d3.select("#logger"),d3.select("#loggerLastEntry"));

    /**
     * The canvas to draw the residual graph with height and excess axes
     */
    var residualGraphDrawer = new ResidualGraphDrawer(svgSelection2,this);

    /**
     * status variables
     * @type Object
     */
    var s = null;

    /**
     * getter for status variable
     */
    this.getState = function(){
      return s;
    }

    var colors = {
      s : const_Colors.StartNodeColor, //green,  
      t : const_Colors.StartNodeColor, //also green
      v : const_Colors.CurrentNodeColor, //red
      Q : const_Colors.PQColor, //yellow
      cap : "#ccc",
      flow : "lightblue", //in graph-style.css
      e_dash : "orange",
      e_star : "mediumpurple"//blueviolet"
    };

    //Variable status
    d3.select("#ta_td_v").style("background-color",colors.v);
    d3.select("#ta_td_queue").style("background-color",colors.Q);
    d3.select("#ta_td_e_dash").style("background-color",colors.e_dash);
    d3.select("#ta_td_e_star").style("background-color",colors.e_star);

    function colorizeHtml(variable,text){
      return "<span style='background-color:"+colors[variable]+"'>"+text+"</span>";
    }

    /**
     * thickness of edges depending on flow going through
     */
    function flowWidth(val,s) {
        var s=s || 25;
        var maxCap = d3.max(Graph.instance.getEdges(), function(d) {
            return d.resources[0]
        });
        return s * (val / maxCap);
    }
    this.flowWidth = flowWidth;
    
    /**
     * The text to appear inside the nodes 
     * @override
     */
    this.nodeLabel = function(d) {
        if (d.id == s.sourceId)
            return "s";
        else if (d.id == s.targetId)
            return "t";
        else
            return d.id;
    }

    /**
     * The text to appear on top of the nodes 
     * @override
     */
//     this.nodeText = function(d){
//       return "[" + d.state.height +","+d.state.excess+"]";
//     }
    
    /**
     * The text to appear halfway along the edge
     * display current flow along edge together with the maximum capacity of the edge
     * @override
     */
    this.edgeText = function(d) {
        return d.state.flow + "/" + d.resources[0];
    }
    
    /**
     * called for each newly added node
     * attach onClick listeners so we can select start/target node
     * @override
     */
    if(!isDebug){
    this.onNodesEntered = function(selection) {
        //select source and target nodes
        selection
          .on("click", function(d) {
              if (s.id == STATUS_SELECTSOURCE || s.id == STATUS_SELECTTARGET && d.id != s.sourceId) {
                  that.nextStepChoice(d);
              }
          })
    }
    }
    
    /**
     * called after each call to update()
     * fill start/target, current and active nodes in green, red and yellow
     * @override
     */
    this.onNodesUpdated = function(selection) {
      selection
        .selectAll("circle")
        .style("fill", function(d) {
            if (d.id == s.currentNodeId){
              return colors.v;
            }else if (d.id == s.sourceId){
              return colors.s;
            }else if (d.id == s.targetId){
              return colors.t;
            }else if (s.activeNodeIds.indexOf(d.id) >= 0){
              return colors.Q;
            }else{
              return global_NodeLayout['fillStyle'];
            }
        //        return colormap[Math.min(10,d.height)];
        })
    }
    
    /**
     * called for each newly added edge
     * Add gray capacity and blue flow lines behind the line with arrow from GraphDrawer
     * @override
     */
    if(!isDebug()){
    this.onEdgesEntered = function(selection) {
         selection.append("line")
            .attr("class", "cap")
            .style("stroke-width",function(d){return algo.flowWidth(d.resources[0])})

          selection.append("line")
            .attr("class", "flow")
    }
    }
    
    /**
     * called after each call to update()
     * Update the current flow width of an edge. 
     * Highlight edges e in G along which we push / use for relabeling a node
     * @override
     */
    this.onEdgesUpdated = function(selection) {
        selection.selectAll("line.flow")
            .style("stroke-width",function(d){
              return algo.flowWidth(Graph.instance.edges.get(d.id).state.flow)
              })
        

        selection.selectAll("line.arrow")
            .each(function(d){
              var attr = {"stroke":"black","stroke-width":global_Edgelayout['lineWidth'],"marker-end":"url(#arrowhead2)"};
              if(s.e_dash && d.id == s.e_dash.id){// && (s.idPrev==STATUS_PUSH || s.idPrev==STATUS_ADMISSIBLEPUSH || s.idPrev==STATUS_RELABEL)){
                attr["stroke-width"]=4;
                attr["stroke"]=colors.e_dash;
                //attr["marker-end"]="url(#arrowhead2-red)";
              }else if(s.e_star && d.id == s.e_star.id){
                attr["stroke-width"]=4;
                attr["stroke"]=colors.e_star;
                //attr["marker-end"]="url(#arrowhead2-green)";
              }
              d3.select(this).style(attr);
            })
    }


    /**
     * Replay stack, saves all states of the algorithm for rewinding.
     * @type {Array}
     */
    var replayHistory = new Array();

    var fastforwardOptions = {label: $("#ta_button_text_fastforward").text(), icons: {primary: "ui-icon-seek-next"}};

    /**
     * Init the graph network visualization as well as the secondary visualizaiton layer
     * @method
     */
    this.init = function() {

        Graph.addChangeListener(function(){
            that.clear();
            that.reset();
            that.squeeze();
            that.update();
        });

        this.reset();
        this.update();

        residualGraphDrawer.init();
    };

    /**
     * Clear all states
     * @method
     */
    this.reset = function(){
        s = {
            id: 0, //status id
            idPrev:0,
            currentNodeId: -1,
            activeNodeIds: [],
            sourceId: -1,
            targetId: -1,
            mainLoopIt: 0,
            e_dash:null,
            e_star:null,
            e_dashes_forward_star_map:null //maps each edge id to outgoing residual edge from currentNodeId used in ResidualGraphDrawer.js
        };

        setStatus(STATUS_SELECTSOURCE)

        this.replayHistory = [];

        if(Graph.instance){
            logger.reset();
            //prepare graph for this algorithm: add special properties to nodes and edges
            Graph.instance.nodes.forEach(function(key, node) {
                node.state.height = 0;
                node.state.excess = 0;
                node.state.visited=false;
            })

            Graph.instance.edges.forEach(function(key, edge) {
                edge.state.flow = 0;
            })

          //debug: no need to click on source and target initially
          this.nextStepChoice(Graph.instance.nodes.get(0),true);
          this.nextStepChoice(Graph.instance.nodes.get(Graph.instance.nodeIds-1),true);
        }
    }

    /**
     * make the view consistent with the state
     * @method
     */
    this.update = function(){

        this.updateDescriptionAndPseudocode();
        logger.update();


        if(Graph.instance){
             residualGraphDrawer.update(s);
             GoldbergTarjanPushRelabelAlgorithm.prototype.update.call(this); //updates the graph
        }
    }

    /**
     * tab comes into view
     * @method
     */
    this.activate = function() {
        this.reset();
        this.squeeze();
        this.update();
    };

    /**
     * tab disappears from view
     * @method
     */
    this.deactivate = function() {
        this.stopFastForward();
        this.replayHistory = [];
    };
    
    
    this.setDisabledBackward = function(disabled) {
        $("#ta_button_Zurueck").button("option", "disabled", disabled);
    };
    
    this.setDisabledForward = function(disabled, disabledSpulen) {
        var disabledSpulen = (disabledSpulen!==undefined) ? disabledSpulen : disabled;
        $("#ta_button_1Schritt").button("option", "disabled", disabled);
        $("#ta_button_vorspulen").button("option", "disabled", disabledSpulen);
    };

    /**
     * add a step to the replay stack, serialize stateful data
     * @method
     */
    this.addReplayStep = function() {
        
        replayHistory.push({
            "graphState": Graph.instance.getState(),
            "s": JSON.stringify(s),
            "loggerState": logger.getState()
        });
        
        if (debugConsole) console.log("Current History Step: ", replayHistory[replayHistory.length - 1]);
    };

    /**
     * playback the last step from stack, deserialize stateful data
     * @method
     */
    this.previousStepChoice = function() {
        
        var oldState = replayHistory.pop();
        if (debugConsole) console.log("Replay Step", oldState);
        
        Graph.instance.setState(oldState["graphState"]);
        s = JSON.parse(oldState["s"]);
        logger.setState(oldState["loggerState"]);
        
        this.update();
    };

    /**
     * updates status description and pseudocode highlight based on current s.id
     * @method
     */
    this.updateDescriptionAndPseudocode = function() {
        var sel = d3.select("#ta_div_statusPseudocode").selectAll("div").selectAll("p")
        sel.classed("marked", function(a, pInDivCounter, divCounter) {
            return divCounter == s.idPrev;
        });
        
        var sel = d3.select("#ta_div_statusErklaerung").selectAll("div");
        sel.style("display", function(a, divCounter) {
            return (divCounter == s.idPrev) ? "block" : "none";
        });

        var vText = "-";
        if(Graph.instance){
          var v = Graph.instance.nodes.get(s.currentNodeId);
          if(v){
            vText = v.id;// +", e(v)="+ v.state.excess;
          }
        }

        var v_style = d3.select("#ta_td_v").text(vText).style("background-color");
        d3.select("#ta_td_queue").text("{"+s.activeNodeIds.join(",")+"}");
        
        if(s.e_dash){
        var e_dash = new Graph.ResidualEdge(s.e_dash);
          d3.select("#ta_td_e_dash").text(e_dash.toString(that.nodeLabel));
        }else{
          d3.select("#ta_td_e_dash").text('-');
        }

        if(s.e_star){
        var e_star = new Graph.ResidualEdge(s.e_star);
          d3.select("#ta_td_e_star").text(e_star.toString(that.nodeLabel,true));
        }else{
          d3.select("#ta_td_e_star").text('-');
        }

        if(this.fastForwardIntervalID != null){
            this.setDisabledForward(true,false);
            this.setDisabledBackward(true);
        }else if (s.id == STATUS_SELECTSOURCE) {
            this.setDisabledBackward(true);
            this.setDisabledForward(true);
        } else if (s.id == STATUS_SELECTTARGET) {
            this.setDisabledForward(true);
        } else if (s.id == STATUS_FINISHED) {
            this.setDisabledForward(true);
            this.setDisabledBackward(false);
        }else{
            this.setDisabledForward(false);
            this.setDisabledBackward(false);
        }
//         $("#ta_button_1Schritt").button("option", "disabled", true);
//         $("#ta_button_Zurueck").button("option", "disabled", true);
//         $("#ta_button_rewind").button("option", "disabled", true);
    };

    function setStatus(newStatus,oldStatus){
      s.idPrev = (oldStatus != null) ? oldStatus : s.id;
      s.id = newStatus;
    }


    ///////////////////////
    ///Actual algorithm steps

    /**
     * Executes the next step in the algorithm
     * @method
     */
    this.nextStepChoice = function(d,noGuiUpdate) {
        
        if (debugConsole) console.log("Current State: " + s.id);

        // Speichere aktuellen Schritt im Stack
        this.addReplayStep();
        
        switch (s.id) {
            case STATUS_SELECTSOURCE:
                selectSource(d);
                break;
            case STATUS_SELECTTARGET:
                selectTarget(d);
                break;
            case STATUS_START: //TODO: is never called
                logger.log("Now the algorithm can start");
                setStatus(STATUS_INITPREFLOW); //nothing really to do
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
            case STATUS_FINISHED:
                this.stopFastForward();
                break;
            default:
                console.log("Fehlerhafter State");
                break;
        }

        //update view with status values
        if(!noGuiUpdate) this.update();
    };


    /**
     * select the source node
     */
    function selectSource(d) {
        s.sourceId = d.id;
        that.setDisabledBackward(false);
        setStatus(STATUS_SELECTTARGET,STATUS_SELECTTARGET); //so that idPrev == id so that we see "select target" after we clicked on source node
        logger.log("selected node " +d.id +" as source " + colorizeHtml("s","s"));
    };

    /**
     * select the target node
     */
    function selectTarget(d) {
        s.targetId = d.id;
        that.setDisabledForward(false);
        setStatus(STATUS_INITPREFLOW,STATUS_START); //so that after selecting the target, we jump from display before click (on nodes) to display after click (on next button)
        logger.log("selected node " +d.id +" as target " + colorizeHtml("t","t"));
    };


    /////////////
    //following is push relabel algo //corman page 741, ahuja page 227

    /**
     * initialize the preflow
     */
    function initPreflow() {
        var source = Graph.instance.nodes.get(s.sourceId);
        var forwardStar = source.getOutEdges();

        var preflowEdges = "";
        var activeNodes = "";

        for (var i = 0; i < forwardStar.length; i++) {
            var e = forwardStar[i];
            //init preflow from source node
            e.state.flow = e.resources[0];
            preflowEdges +="f("+e.start.id+","+e.end.id+")="+e.state.flow+" ";
            source.state.excess -= e.state.flow;
            e.end.state.excess = e.state.flow;

            //add node to active queue
            if (e.end.id != s.targetId) {
                activeNodes += e.end.id + " ";
                s.activeNodeIds.push(e.end.id);
            }
        }

        setStatus(STATUS_INITDISTANCEFUNCTION);
        
        logger.log("Init preflow: "+colorizeHtml("flow",preflowEdges) +", add nodes: "+ colorizeHtml("Q",activeNodes) +"to Q");//" source excess: " + source.state.excess);
    }

    /**
     * initialize the distance function
     */
    function initDistanceFunction() {
        var source = Graph.instance.nodes.get(s.sourceId);
        var target = Graph.instance.nodes.get(s.targetId);
        
        source.state.visited = true;
        target.state.visited = true;
        
        source.state.height = Graph.instance.getNodes().length;
        target.state.height = 0;
        
        var queue = [target];

        var text = "";

        //BFS traversal
        while (queue.length > 0) {
            var node = queue.shift();
            var inEdges = node.getInEdges();
            for (var i = 0; i < inEdges.length; i++) {
                var neighbourNode = inEdges[i].start;
                if (!neighbourNode.state.visited) {
                    queue.push(neighbourNode);
                    neighbourNode.state.visited = true;
                    neighbourNode.state.height = node.state.height + 1;
                    text +="h("+neighbourNode.id+")="+neighbourNode.state.height+", ";
                }
            }
        }
        
        setStatus(STATUS_MAINLOOP);
        logger.log("Init height: h(t)=0,"+text+"h(s)=" + source.state.height);
    }
    
    /**
     * playback the last step from stack, deserialize stateful data
     */
    function updateResidualEdgesForwardStar(id){
      s.e_dashes_forward_star_map={};
      if(id==null) return;
      var v = Graph.instance.nodes.get(id);
      e_dashes = v.getAllOutgoingResidualEdges(true);
      for(var i=0; i<e_dashes.length; i++){
        s.e_dashes_forward_star_map[e_dashes[i].id]=e_dashes[i];
      }
    }

    /**
     * main loop: pops the current node from the queue until empty
     */
    function mainLoop() {
        s.e_star = null;
        if (s.activeNodeIds.length == 0) {
            setStatus(STATUS_FINISHED,STATUS_FINISHED); //so that we display finished, not mainloop when done
            s.currentNodeId=-1;
            var finalflow = Graph.instance.nodes.get(s.targetId).state.excess;
            updateResidualEdgesForwardStar(null);
            that.stopFastForward();
            d3.select("#finalflow").text(finalflow);
            logger.log("Finished with a max flow of "+finalflow);
            return;
        }
        
        s.currentNodeId = s.activeNodeIds.shift();
        updateResidualEdgesForwardStar(s.currentNodeId);


        logger.log("Main loop #" + (s.mainLoopIt++) + ": pop node " + colorizeHtml("v","v="+s.currentNodeId) + " from "+colorizeHtml("Q","Q"));
        
        setStatus(STATUS_ADMISSIBLEPUSH);
    }

    /**
     * checks if we can apply a push operation. Together with push() mimics the inner WHILE loop
     */
    function admissiblePush() {
      s.e_dash=null;
        var v = Graph.instance.nodes.get(s.currentNodeId);
        if (v.state.excess > 0){
            s.e_dash = v.getLegalResidualEdge();
            if(s.e_dash){
              setStatus(STATUS_PUSH);
              logger.log2("admissible push on " + colorizeHtml("e_dash",s.e_dash.toString(that.nodeLabel)));
            }else{
              setStatus(STATUS_ADMISSIBLERELABEL);
              logger.log2("no admissible push, e("+colorizeHtml("v","v")+")=" + v.state.excess);
            }
        } else {
          setStatus(STATUS_MAINLOOP);
        }
    }

    /**
     * apply a push operation on the current node
     */
    function push() {
        var v = Graph.instance.nodes.get(s.currentNodeId);
        var e_dash = new Graph.ResidualEdge(s.e_dash); //e' G'
        //var edge = e_dash.edge(); //e in G
        var w = e_dash.end();
        
        var delta = Math.min(v.state.excess, e_dash.c_dash());
        
        e_dash.increaseFlow(delta);
        
        v.state.excess -= delta;
        w.state.excess += delta;
        
        if (w.id != s.sourceId && w.id != s.targetId && s.activeNodeIds.indexOf(w.id) == -1) {
            s.activeNodeIds.push(w.id);
        }
        
        var sat = e_dash.c_dash() == 0 ? " [saturating] " : " [nonsaturating] ";
        logger.log3(sat +" push of " + delta + " from " + colorizeHtml("v","v="+that.nodeLabel(v)) + "</span> to " + that.nodeLabel(w));
        setStatus(STATUS_ADMISSIBLEPUSH);
    }

    /**
     * checks if we can apply a relabel operation. This mimics and IF, since relabel() returns to outer while loop
     */
    function admissibleRelabel() {
        var v = Graph.instance.nodes.get(s.currentNodeId);
        if (v.state.excess > 0 && (s.e_dash = v.getLegalResidualEdge()) == null) { //todo: check if e_dash can ever be not null here, since we pushed till we saturated all edges beforehand anyways
            setStatus(STATUS_RELABEL);
            logger.log2("admissible relabel, e("+colorizeHtml("v","v")+")=" + v.state.excess);
        } else {
            setStatus(STATUS_MAINLOOP); //jump to loop head
            logger.log2("no admissible relabel");
        }
    }

    /**
     * apply a relabel operation on the current node
     */
    function relabel() {
        var node = Graph.instance.nodes.get(s.currentNodeId);
        
        var residualEdges = node.getAllOutgoingResidualEdges();

        //find neighbouring node in G' with lowest height
        s.e_star = residualEdges[0];
        for(var i=0; i<residualEdges.length; i++){
          if(residualEdges[i].end().state.height < s.e_star.end().state.height){
            s.e_star=residualEdges[i];
          }
        }
        
        //make ourself 1 higher than him
        var newheight = 1 + s.e_star.end().state.height;

        logger.log3("relabel "+colorizeHtml("v","v="+ node.id)+" from h=" + node.state.height + " to h=" + newheight+ " due to "+colorizeHtml("e_star",s.e_star.toString(that.nodeLabel,true))+", add v to "+colorizeHtml("Q","Q"));
        node.state.height = newheight;
        s.activeNodeIds.push(node.id);
        
        setStatus(STATUS_MAINLOOP);
    }
}

// Vererbung realisieren
GoldbergTarjanPushRelabelAlgorithm.prototype = Object.create((isDebug() ? GraphEditor : GraphDrawer).prototype);
GoldbergTarjanPushRelabelAlgorithm.prototype.constructor = GoldbergTarjanPushRelabelAlgorithm;

//Global variable zuweisen
GraphAlgorithm = GoldbergTarjanPushRelabelAlgorithm;