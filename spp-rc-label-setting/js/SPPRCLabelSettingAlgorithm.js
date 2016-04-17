/**
 * SPPRC Label Setting Algorithm
 * @author Adrian Haarbach
 * @augments GraphDrawer
 * @class
 */
function SPPRCLabelSettingAlgorithm(svgSelection,svgSelection2) {
    GraphDrawer.call(this,svgSelection);

    /**
     * closure for this class
     * @type SPPRCLabelSettingAlgorithm
     */
    var that = this;
    
    var debugConsole = false;
    
    var id = 0;
    var STATUS_SELECTSOURCE = id++;
    var STATUS_START = id++;
    var STATUS_INIT= id++;
    var STATUS_MAINLOOP = id++;
    var STATUS_PATH_EXTEND = id++;
    var STATUS_PATH_EXTEND_FEASIBLE = id++;
    var STATUS_LABEL_PROCESSED = id++;
    var STATUS_DOMINANCE = id++;
    var STATUS_FINISHED = id;

    this.STATUS_DOMINANCE = STATUS_DOMINANCE; //needed in LabelDrawer.js
    
    /**
     * the logger instance
     * @type Logger
     */
    var logger = new Logger(d3.select("#logger"));

    var labelDrawer = new LabelDrawer(svgSelection2,this);

    /**
     * status variables
     * @type Object
     */
    var s = null;
    
    var colormap = ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"].reverse();

    this.dominanceStepNodeColors = d3.scale.category10();
    
    this.nodeLabel = function(d) {
        if (d.id == s.sourceId)
            return "s";
        else
            return d.id;
    }
    
    this.onNodesEntered = function(selection) {
        //select source and target nodes
        selection
        .on("click", function(d) {
            if (s.id == STATUS_SELECTSOURCE) {
                that.nextStepChoice(d);
            }
        })
    }
    
    this.onNodesUpdated = function(selection) {
        selection
        .selectAll("circle")
        .style("stroke", function(d) {
            if (s.currentLabel && (d.id == s.currentLabel.nodeId)) {
                return const_Colors.NodeBorderHighlight;
            } else {
                return global_NodeLayout['borderColor'];
            }
        })
        .style("fill", function(d) {
            if(s.id == STATUS_DOMINANCE){
                return that.dominanceStepNodeColors(d.id);
            }
            if (d.id == s.sourceId)
                return const_Colors.NodeFillingHighlight;
            return global_NodeLayout['fillStyle'];
        })
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

        Graph.addChangeListener(function(){
            that.clear();
            that.reset();
            that.squeeze();
            that.update();

        });

        this.reset();
        this.update();
    };

    /**
     * clear all states
     */
    this.reset = function(){
        s = {
            id: 0, //status id
            currentLabel: null, //current label
            l_dash: null, //current extended label
            U: [],
            P: [],
            sourceId: -1,
            currentResidentNodeEdgeIndex: -1 //for iteration outgoing edges in label extension step
        };

        this.s=s;

        logger.data = [];
        this.replayHistory = [];
    }

    /**
     * Makes the view consistent with the state
     * @method
     */
    this.update = function(){

        this.updateDescriptionAndPseudocode();
        logger.update();

        labelDrawer.updateLabels(s);

        if(Graph.instance){
             SPPRCLabelSettingAlgorithm.prototype.update.call(this); //updates the graph
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
            // "legende": $("#tab_ta").find(".LegendeText").html(),
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
        // $("#tab_ta").find(".LegendeText").html(oldState.legende);
        
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

        d3.select("#ta_td_U").text("{"+s.U.map(function(d){return d.id}).join(",")+"}");
        d3.select("#ta_td_l").text(s.currentLabel ? s.currentLabel.id : "-");
        d3.select("#ta_td_P").text("{"+s.P.map(function(d){return d.id}).join(",")+"}");
        d3.select("#ta_td_l_dash").text(s.l_dash ? s.l_dash.id : "-");

        if(this.fastForwardIntervalID != null){
            this.setDisabledForward(true,false);
            this.setDisabledBackward(true);
        }else if (s.id == STATUS_SELECTSOURCE) {
            this.setDisabledBackward(true);
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
            case STATUS_START:
                logger.log("Now the algorithm can start");
                s.id++; //nothing really to do
                break;
            case STATUS_INIT:
                initLabels();
                break;
            case STATUS_MAINLOOP:
                mainLoop();
                break;
            case STATUS_PATH_EXTEND:
                pathExtend();
                break;
            case STATUS_PATH_EXTEND_FEASIBLE:
                pathExtendFeasible();
                break;
            case STATUS_LABEL_PROCESSED:
                labelProcessed();
                break;
            case STATUS_DOMINANCE:
                dominance();
                break;
            case STATUS_FINISHED:
//                 this.filter();
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
        s.id = STATUS_INIT;
        logger.log("selected node " + d.id + " as s");
    };


    /////////////
    //following is generic label setting algorithm for SPPRC/ SPPTW
     /**
     * init the label queue / sets with the 
     */
    function initLabels() {
        var source = Graph.instance.nodes.get(s.sourceId);

        //fake edge/arc
        var trivialPath = {id:-1,end:source};

        var label = new Label(null,trivialPath);
        
        s.U.push(label);
        s.id = STATUS_MAINLOOP;
        
        logger.log("Init labels. start label: "+Label.toString(label)+" added to U");
    }
    
    var mainLoopIt = 0;
    
    /**
    * main loop: pops the current node from the queue until empty
    */
    function mainLoop() {
        if (s.U.length == 0) {
            s.id = STATUS_FINISHED;
            s.currentLabel = null;
            // var finalflow = Graph.instance.nodes.get(s.targetId).state.exess;
            // that.stopFastForward();
            // d3.select("#finalflow").text(finalflow);
            logger.log("Finished");
            return;
        }
        
        s.currentLabel = s.U.shift();
        s.currentResidentNodeEdgeIndex = 0;
        logger.log("Main loop #" + (mainLoopIt++) + " picked label " + Label.toString(s.currentLabel)+ " from U");
        
        s.id = STATUS_PATH_EXTEND;
    }

    /**
     * try to extend currentLabel along currentArc
     */
    function pathExtend() {
        var v = Graph.instance.nodes.get(s.currentLabel.nodeId);
        var outEdges = v.getOutEdges();
        if(s.currentResidentNodeEdgeIndex >= outEdges.length){
            s.id = STATUS_LABEL_PROCESSED;
            logger.log2("iterated all neighbours of "+v.id);
        }else{
            var arc = outEdges[s.currentResidentNodeEdgeIndex++];
            var l_dash = new Label(s.currentLabel,arc); //TODO do we need the extended label already here?
            logger.log2("checking arc "+arc.toString(true,edgeResourceStyle)+" from "+v.toString(true,nodeResourceStyle));
            s.l_dash = l_dash;
            s.id = STATUS_PATH_EXTEND_FEASIBLE;
        }
    }

    /**
     * Check if the previous label extension was feasible.
     * if yes, put it in U, else discard it
     */
    function pathExtendFeasible() {
        var w = Graph.instance.nodes.get(s.l_dash.nodeId);
        if(Graph.instance.feasible(s.l_dash)){
            s.U.push(s.l_dash);
            if(!w.state.endingPaths) w.state.endingPaths = [];
            w.state.endingPaths.push(s.l_dash);
            logger.log3(Label.toString(s.l_dash) + " feasible in " + w.toString(true,nodeResourceStyle) + ", add to U");
        }else{
            logger.log3(Label.toString(s.l_dash) + " infeasible in " + w.toString(true,nodeResourceStyle))
        }
        s.l_dash = null;
        s.id = STATUS_PATH_EXTEND; // go back to inner FORALL loop head
    }

    /**
     * put processed label in P
     */
    function labelProcessed() {
        s.P.push(s.currentLabel);
        logger.log2("processed label " + Label.toString(s.currentLabel) + ", added to P");
        s.currentLabel = null;
        s.id = STATUS_DOMINANCE;
    }

    /**
     * discard strictly dominated labels in both P and U
     */
    function dominance() {
        //TODO
        logger.log2("dominance step")

        var nodes = Graph.instance.getNodes();

        var nooneDominated = true;

        for(var i=0; i<nodes.length; i++){
            var node = nodes[i];
            if(!node.state.endingPaths) continue;
            for(var j = 0; j < node.state.endingPaths.length; j++){
                //remove all other paths in upper right cone of this
                var path = node.state.endingPaths[j];
                
                for(var k = 0; k < node.state.endingPaths.length; k++){
                    if(j==k) continue;
                    var otherpath = node.state.endingPaths[k];
                    if(path == otherpath) continue;
                    if( path.resources.every(function(r,l){
                        return r <= otherpath.resources[l]
                        })){
                        var removed = node.state.endingPaths.splice(k,1)[0];
                        if(removed != otherpath){
                            console.log("error");
                        }

                        nooneDominated=false;

                        logger.log3(Label.toString(otherpath) +" dominated by " + Label.toString(path));
                        k--;

                        var indexInU = s.U.indexOf(removed);
                        if(indexInU>=0) s.U.splice(indexInU,1);
                        
                        var indexInP = s.P.indexOf(removed);
                        if(indexInP>=0) s.P.splice(indexInP,1);

                    }
                }
            }
        }

        if(nooneDominated)
            logger.log3("no label is dominated");

        s.id = STATUS_MAINLOOP;
    }

    /**
     * discard strictly dominated labels in both P and U
     */
    function filter() {
        //TODO
        logger.log("filter solution step")
        s.id = STATUS_FINISHED;
    }

    var constrainedEdgeResourceIndex = 0; //the other one is unconstrained but should be minimized. E.g.: min cost, constrained time
    
    /**
     * A Label, built as a tree starting from the primitive label
     * @class
     */
    function Label(parent, arc) { //arc is an actual Graph.Edge or a fake trivial path {id:-1, end:source}
        this.parent = parent;
        //just save both ids (a little reduntant) for easy access and serialization 
        this.arcId = arc.id; //incoming arc
        this.nodeId = arc.end.id; //this label is resident (==ending) at node node
        this.id = (parent ? (parent.id + "->") : "" ) + that.nodeLabel(Graph.instance.nodes.get(this.nodeId));

        this.resources = [];
        if(parent==null){
            this.resources = [0,0]; //TODO allow adaptivity for > 2 resources;
            this.resources[constrainedEdgeResourceIndex] = arc.end.resources[0]; //[0] is lower, [1] is upper limit on constrained resource
        }else{
            for (var i = 0; i < parent.resources.length; i++) {
                var accumulated = arc.resources[i]+parent.resources[i]; //TODO changes to min(r(w),e+l_parent) later
                this.resources.push(accumulated);
            };
        }
    }
    
    //static method, not instance, so that we can serialize more easily
    Label.toString = function(label) {
        return label.id + "("+ label.resources.map(function(d,i){
            return "<span style=color:" + ((i==constrainedEdgeResourceIndex) ? "red" : "green") + ">"+d+"</span>";
        }).join(",")+")";
    }

    function nodeResourceStyle(d,i){
        return "<span style=color:red>"+d+"</span>";
    }

    function edgeResourceStyle(d,i){
        return "<span style=color:" + ((i==constrainedEdgeResourceIndex) ? "red" : "green") + ">"+d+"</span>";
    }

    /**
     * Checks weather a label fulfills all its resource constraints in its resident node
     * @param{Label} lstar
     */
    Graph.prototype.feasible = function(lstar) {
        // var residentVertex = this.edges.get(lstar.arcId).end;
        var residentVertex = this.nodes.get(lstar.nodeId);
        if(lstar.resources[constrainedEdgeResourceIndex]<=residentVertex.resources[1]){ // timewindow [resources[0],resources[1]]; cost is unconstrained
            if(lstar.resources[constrainedEdgeResourceIndex]>=residentVertex.resources[0]){ //nothing to do
//                console.log2("waiting time of "+diff+" at "+lstar.nodeId);
            }else{
               lstar.wait = residentVertex.resources[0] - lstar.resources[constrainedEdgeResourceIndex]; //saved so we can draw a nice path
               logger.log3("waiting time of "+residentVertex.resources[0]+"-"+lstar.resources[constrainedEdgeResourceIndex]+"="+lstar.wait+" at "+lstar.nodeId);
               lstar.resources[constrainedEdgeResourceIndex]=residentVertex.resources[0];
            }
            return true;
        }else{
            return false;
        }
    }

}

// Vererbung realisieren
SPPRCLabelSettingAlgorithm.prototype = Object.create(GraphDrawer.prototype);
SPPRCLabelSettingAlgorithm.prototype.constructor = SPPRCLabelSettingAlgorithm;
