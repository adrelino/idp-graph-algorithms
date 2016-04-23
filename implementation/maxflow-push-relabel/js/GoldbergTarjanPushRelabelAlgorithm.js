/**
 * Goldberg Tarjan's Push-Relabel Algorithmus
 * @author Adrian Haarbach
 * @augments GraphDrawer
 * @class
 */
function GoldbergTarjanPushRelabelAlgorithm(svgSelection,svgSelection2) {
    GraphDrawer.call(this,svgSelection);

    /**
     * closure for this class
     * @type GoldbergTarjanPushRelabelAlgorithm
     */
    var that = this;
    var algo = that;
    
    var debugConsole = false;
    
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
     * the logger instance
     * @type Logger
     */
    var logger = new Logger(d3.select("#logger"));

    /**
     * The canvas to draw the heigh function
     */
    var heightfunctionDrawer = new HeightfunctionDrawer(svgSelection2,this);

    /**
     * status variables
     * @type Object
     */
    var s = null;
    
    var colormap = ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"].reverse();
    
    function flowWidth(val) {
        var maxCap = d3.max(Graph.instance.getEdges(), function(d) {
            return d.resources[0]
        });
        return 25 * (val / maxCap);
    }

    this.flowWidth = flowWidth;
    
    this.nodeLabel = function(d) {
        if (d.id == s.sourceId)
            return "s";
        else if (d.id == s.targetId)
            return "t";
        else
            return d.id;
    }
    
//     this.nodeText = function(d) {
//         if(s.id != STATUS_FINISHED) return d.state.excess + "," + d.state.height;
// //         return GoldbergTarjanPushRelabelAlgorithm.prototype.nodeText.call(this,d);

//     }
    
    this.edgeText = function(d) {
        return d.state.flow + "/" + d.resources[0];
    }
    
    this.onNodesEntered = function(selection) {
        //select source and target nodes
        selection
        .on("click", function(d) {
            if (s.id == STATUS_SELECTSOURCE || s.id == STATUS_SELECTTARGET && d.id != s.sourceId) {
                that.nextStepChoice(d);
            }
        })

        //       selection.append("text")
        //         .attr("class","height")
        //         .attr("dy", "-1.2em")           // set offset y position
        //         .attr("text-anchor", "left");

        //       selection.append("text")
        //         .attr("class","excess unselectable")
        //         .attr("dy", "2.0em")           // set offset y position
        //         .attr("text-anchor", "right");
        
        selection.append("rect")
        .attr("class", "excessBar unselectable")
        .attr("x", "20")
        .attr("width", 10);
    }
    
    this.onNodesUpdated = function(selection) {
        selection
        .selectAll("circle")
//         .style("stroke", function(d) {
//             if (d.id == s.currentNodeId) {
//                 return const_Colors.NodeBorderHighlight;
//             } else {
//                 return global_NodeLayout['borderColor'];
//             }
//         })
//         .style("stroke-width", function(d) {
//             if (s.activeNodeIds.indexOf(d.id) >= 0) {
//                 return "5px";
//             } else if (d.id == s.currentNodeId) {
//                 return "7px";
//             } else {
//                 return "2px";
//             }
//         })
        .style("fill", function(d) {
            if (d.id == s.currentNodeId){
              return const_Colors.CurrentNodeColor
            }else if (d.id == s.sourceId)
                return const_Colors.StartNodeColor; //green
            else if (d.id == s.targetId)
                return const_Colors.StartNodeColor;//NodeFillingQuestion; // NodeFillingLight
            else if (s.activeNodeIds.indexOf(d.id) >= 0)
                return const_Colors.PQColor;
            else
                return global_NodeLayout['fillStyle'];
        //        return colormap[Math.min(10,d.height)];
        })

        //     selection.selectAll(".excess")
        //         .transition()
        //         .text(function(d){return "e:"+d.excess})

        //     selection.selectAll(".height")
        //         .transition()
        //         .text(function(d){return "h:"+d.height});
        
        var h = 20;
        
//         selection.selectAll(".excessBar")
//         .transition()
//         .attr("y", function(d) {
//             return h - flowWidth(Math.abs(d.state.excess))
//         })
//         .attr("height", function(d) {
//             return flowWidth(Math.abs(d.state.excess))
//         })
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


    /**
     * Replay Stack, speichert alle Schritte des Ablaufs für Zurück Button
     * @type {Array}
     */
    var replayHistory = new Array();

    var fastforwardOptions = {label: $("#ta_button_text_fastforward").text(), icons: {primary: "ui-icon-seek-next"}};

    /**
     * Initialisiert das Zeichenfeld
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

        heightfunctionDrawer.init();
    };

    /**
     * clear all states
     */
    this.reset = function(){
        s = {
            id: 0, //status id
            currentNodeId: -1,
            activeNodeIds: [],
            sourceId: -1,
            targetId: -1
        };

        logger.data = [];
        this.replayHistory = [];

        if(Graph.instance){
            //prepare graph for this algorithm: add special properties to nodes and edges
            Graph.instance.nodes.forEach(function(key, node) {
                node.state.height = 0;
                node.state.excess = 0;
            })

            Graph.instance.edges.forEach(function(key, edge) {
                edge.state.flow = 0;
            })
        }
    }

    /**
     * Makes the view consistent with the state
     * @method
     */
    this.update = function(){

        this.updateDescriptionAndPseudocode();
        logger.update();


        if(Graph.instance){
             heightfunctionDrawer.update();
             GoldbergTarjanPushRelabelAlgorithm.prototype.update.call(this); //updates the graph
        }
    }

    /**
     * When Tab comes into view
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
    //         this.deregisterEventHandlers();
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
            //             "htmlSidebar": $("#ta_div_statusErklaerung").html(),
            "legende": $("#tab_ta").find(".LegendeText").html(),
            "loggerData": JSON.stringify(logger.data)
        });
        
        if (debugConsole)
            console.log("Current History Step: ", replayHistory[replayHistory.length - 1]);
    
    };

    /**
     * playback the last step from stack, deserialize stateful data
     * @method
     */
    this.previousStepChoice = function() {
        
        var oldState = replayHistory.pop();
        if (debugConsole)
            console.log("Replay Step", oldState);
        
        Graph.instance.setState(oldState.graphState);
        s = JSON.parse(oldState.s);
        logger.data = JSON.parse(oldState.loggerData);
        //         $("#ta_div_statusErklaerung").html(oldState.htmlSidebar);
        $("#tab_ta").find(".LegendeText").html(oldState.legende);
        
        this.update();
    };

    /**
     * updates status description and pseudocode highlight based on current s.id
     * @method
     */
    this.updateDescriptionAndPseudocode = function() {
        var sel = d3.select("#ta_div_statusPseudocode").selectAll("div").selectAll("p")
        sel.classed("marked", function(a, pInDivCounter, divCounter) {
            return divCounter == s.id;
        });
        
        var sel = d3.select("#ta_div_statusErklaerung").selectAll("div");
        sel.style("display", function(a, divCounter) {
            return (divCounter == s.id) ? "block" : "none";
        });

        d3.select("#ta_td_v").text(s.currentNodeId);
        d3.select("#ta_td_queue").text(s.activeNodeIds.join(","));
        d3.select("#ta_td_e_dash");
        d3.select("#ta_td_c_dash");

        if(this.fastForwardIntervalID != null){
            this.setDisabledForward(true,false);
            this.setDisabledBackward(true);
        }else if (s.id == STATUS_SELECTSOURCE) {
            this.setDisabledBackward(true);
            this.setDisabledForward(true);
        } else if (s.id == STATUS_SELECTTARGET) {
            this.setDisabledForward(true);
        } else if (s.id == id) {
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


    ///////////////////////
    ///Actual algorithm steps

    /**
     * Executes the next step in the algorithm
     * @method
     */
    this.nextStepChoice = function(d) {
        
        if (debugConsole)
            console.log("Current State: " + s.id);

        // Speichere aktuellen Schritt im Stack
        this.addReplayStep();
        
        switch (s.id) {
            case STATUS_SELECTSOURCE:
                this.selectSource(d);
                break;
            case STATUS_SELECTTARGET:
                this.selectTarget(d);
                break;
            case STATUS_START:
                logger.log("Now the algorithm can start");
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
            case STATUS_FINISHED:
                this.stopFastForward();
                break;
            default:
                console.log("Fehlerhafter State");
                break;
        }

        //update view with status values
        this.update();
    };


    /**
     * select the source node
     */
    this.selectSource = function(d) {
        s.sourceId = d.id;
        this.setDisabledBackward(false);
        s.id = STATUS_SELECTTARGET;
        logger.log("selected node " + d.id + " as s");
    };

    /**
     * select the target node
     */
    this.selectTarget = function(d) {
        s.targetId = d.id;
        this.setDisabledForward(false);
        s.id = STATUS_START;
        logger.log("selected node " + d.id + " as t");
    };


    /////////////
    //following is push relabel algo //corman page 741, ahuja page 227

    /**
 * initialize the preflow
 */
    function initPreflow() {
        var source = Graph.instance.nodes.get(s.sourceId);
        var forwardStar = source.getOutEdges();
        
        for (var i = 0; i < forwardStar.length; i++) {
            var e = forwardStar[i];
            //init preflow from source node
            e.state.flow = e.resources[0];
            source.state.excess -= e.state.flow;
            e.end.state.excess = e.state.flow;

            //add node to active queue
            if (e.end.id != s.targetId) {
                s.activeNodeIds.push(e.end.id);
            }
        }
        
        s.id = STATUS_INITDISTANCEFUNCTION;
        
        logger.log("Init preflow. source excess: " + source.state.excess);
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
                }
            }
        }
        
        s.id = STATUS_MAINLOOP;
        logger.log("Init distfun. source height: " + source.state.height);
    }
    
    var mainLoopIt = 0;
    /**
 * main loop: pops the current node from the queue until empty
 */
    function mainLoop() {
        if (s.activeNodeIds.length == 0) {
            s.id = STATUS_FINISHED;
            s.currentNodeId=-1;
            var finalflow = Graph.instance.nodes.get(s.targetId).state.excess;
            that.stopFastForward();
            d3.select("#finalflow").text(finalflow);
            logger.log("Finished with a max flow of "+finalflow);
            return;
        }
        
        s.currentNodeId = s.activeNodeIds.shift();
        logger.log("Main Loop Iteration " + (mainLoopIt++) + " popped node " + s.currentNodeId);
        
        s.id = STATUS_ADMISSIBLEPUSH;
    //   if(active.length>0){
    //    var currentNode = active.shift();
    //    logger2("selected node "+currentNode.id+":");
    //    var legalNeighbour;
    //    while((legalNeighbour=getLegalEdgeInResidualNetwork(currentNode)) && currentNode.excess >0){
    //      push(currentNode,legalNeighbour,source,target,active);
    //    }

    //    if(node.excess > 0 && legalNeighbour==null){
    //     relabel(currentNode,active);
    //    }
    //   }else{
    //     stepNum++
    //   }
    // }

    // function mainLoopStepped(){
    //   if(currentNode){
    //     var legalNeighbour=getLegalEdgeInResidualNetwork(currentNode);
    //     if(legalNeighbour && currentNode.excess >0){
    //       var nonsat = push(currentNode,legalNeighbour,source,target,active);
    //       if(currentNode.excess==0 || nonsat) currentNode=null;
    //     }else if(currentNode.excess >0){
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
    function admissiblePush() {
        var v = Graph.instance.nodes.get(s.currentNodeId);
        var e_dash;
        if (v.state.excess > 0 && (e_dash = getLegalResidualEdge(v))) {
            s.id = STATUS_PUSH;
            d3.select("#ta_td_e_dash").text(e_dash.toString());
            d3.select("#ta_td_c_dash").text(e_dash.c_dash);
            logger.log2("admissiblePush on residual edge " + e_dash.toString());
        } else {
            s.id = STATUS_ADMISSIBLERELABEL;
            logger.log2("no admissiblePush, excess=" + v.state.excess);
        
        }
    }

    /**
 * apply a push operation on the current node
 */
    function push() {
        var v = Graph.instance.nodes.get(s.currentNodeId);
        var e_dash = getLegalResidualEdge(v); //e' G'
        var edge = e_dash.correspondingEdge; //e in G
        var w = e_dash.isForwardEdge ? edge.end : edge.start;

        d3.select("#ta_td_e_dash").text(e_dash.toString());
        d3.select("#ta_td_c_dash").text(e_dash.c_dash);
        
        var delta = Math.min(v.state.excess, e_dash.c_dash);
        
        if (e_dash.isForwardEdge) {
            edge.state.flow += delta;
        } else {
            edge.state.flow -= delta;
        }
        
        v.state.excess -= delta;
        w.state.excess += delta;
        
        if (w.id != s.sourceId && w.id != s.targetId && s.activeNodeIds.indexOf(w.id) == -1) {
            s.activeNodeIds.push(w.id);
        }
        
        var sat = e_dash.c_dash == 0 ? " [saturating] " : " [nonsaturating] ";
        logger.log3("push " + delta + " from " + v.id + " to " + w.id + sat);
        s.id = STATUS_ADMISSIBLEPUSH;
    }

    /**
 * checks if we can apply a relabel operation. This mimics and IF, since relabel() returns to outer while loop
 */
    function admissibleRelabel() {
        var v = Graph.instance.nodes.get(s.currentNodeId);
        var e_dash;
        if (v.state.excess > 0 && (e_dash = getLegalResidualEdge(v)) == null) { //todo: check if e_dash can ever be not null here, since we pushed till we saturated all edges beforehand anyways
            d3.select("#ta_td_e_dash").text(e_dash);
            d3.select("#ta_td_c_dash").text("-");
            s.id = STATUS_RELABEL;
            logger.log2("admissibleRelabel on edge " + e_dash + " excess" + v.state.excess);
        } else {
            s.id = STATUS_MAINLOOP; //jump to loop head
            logger.log2("no admissibleRelabel");
        }
    }

    /**
 * apply a relabel operation on the current node
 */
    function relabel() {
        var node = Graph.instance.nodes.get(s.currentNodeId);
        
        var residualEdges = node.getAllOutgoingResidualEdges();
        
        var newheight = 1 + d3.min(residualEdges, function(d) {
            //TODO
            return d.isForwardEdge ? d.correspondingEdge.end.state.height : d.correspondingEdge.start.state.height;
        });
        
        logger.log3("relabel " + node.id + " from " + node.state.height + " to " + newheight);
        node.state.height = newheight;
        s.activeNodeIds.push(node.id);
        
        s.id = STATUS_MAINLOOP;
    }
    
    function residualCap(edge, forward) { //if residualCap == 0, there is actually no edge in residual network
        if (forward) {
            return edge.resources[0] - edge.state.flow;
        } else {
            return edge.state.flow;
        }
    }
    
    function ResidualEdge(edge, isForwardEdge) {
        this.correspondingEdge = edge;
        this.isForwardEdge = isForwardEdge;
        this.c_dash = residualCap(edge, isForwardEdge);
    }
    
    ResidualEdge.prototype.toString = function() {
        if (this.isForwardEdge)
            return "forward " + this.correspondingEdge.start.id + "->" + this.correspondingEdge.end.id + " (" + this.c_dash + ")";
        else
            return "backward " + this.correspondingEdge.end.id + "->" + this.correspondingEdge.start.id + " (" + this.c_dash + ")";
    }

    //not necessarily legal, forward star of node in G'
    Graph.Node.prototype.getAllOutgoingResidualEdges = function() {
        var e_dashes = [];

        /*forward edges*/
        this.outEdges.forEach(function(key, edge) {
            e_dashes.push(new ResidualEdge(edge, true));
        });

        /*backward edges*/
        this.inEdges.forEach(function(key, edge) {
            e_dashes.push(new ResidualEdge(edge, false));
        });

        //If capacity == 0, we don't speak of an residual edge anymore
        var filteredEdges = e_dashes.filter(function(e_dash) {
            return e_dash.c_dash > 0;
        });
        
        return filteredEdges;
    }
    
    
    
    function getLegalResidualEdge(node) {
        var outEdges = node.getOutEdges();
        /*forward edges*/
        for (var i = 0; i < outEdges.length; i++) {
            var edge = outEdges[i];
            if (node.state.height == edge.end.state.height + 1 && (c_dash = residualCap(edge, true)) > 0) {
                return new ResidualEdge(edge, true);
            }
        }
        
        var inEdges = node.getInEdges();
        /*backward edges*/
        for (var i = 0; i < inEdges.length; i++) {
            var edge = inEdges[i];
            if (node.state.height == edge.start.state.height + 1 && (c_dash = residualCap(edge, false)) > 0) {
                return new ResidualEdge(edge, false);
            }
        }
        
        return null;
    }
}

// Vererbung realisieren
GoldbergTarjanPushRelabelAlgorithm.prototype = Object.create(GraphDrawer.prototype);
GoldbergTarjanPushRelabelAlgorithm.prototype.constructor = GoldbergTarjanPushRelabelAlgorithm;
