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
            }else{
              console.log(d);
              //highlight all labels which have this node as residentVertex
            }
        })
    }
    
    this.onNodesUpdated = function(selection) {
        selection
        .selectAll("circle")
        .style("fill", function(d) {
            if (s.currentLabel && (d.id == s.currentLabel.nodeId)) {
                return const_Colors.NodeBorderHighlight;
            } else if (d.id == s.sourceId){
                return const_Colors.StartNodeColor;
            }else{
              return global_NodeLayout['fillStyle'];
            }
        })
    }
    
    this.onEdgesEntered = function(selection) {
    
    }
    
    this.onEdgesUpdated = function(selection) {
//         selection
//         .selectAll("line")
//         .style("stroke-width", function(d) {
//             if (s.currentLabel && (d.id == s.currentArcId )){//s.currentLabel.arcId)) {
//                 return 4;
//             }else{
//               return 2;
//             }
//         })

       selection.selectAll("line")
            .each(function(d){
              var attr = {"stroke":"black","stroke-width":global_Edgelayout['lineWidth'],"marker-end":"url(#arrowhead2)"};
              if(s.currentLabel && (d.id == s.currentArcId)){
                attr["stroke-width"]=4;
//                 if(s.idPrev==STATUS_PUSH || s.idPrev==STATUS_ADMISSIBLEPUSH){
                  attr["stroke"]=const_Colors.CurrentNodeColor;
                  attr["marker-end"]="url(#arrowhead2-red)";
//                 }else{
//                   attr["stroke"]="green";
//                   attr["marker-end"]="url(#arrowhead2-green)";
//                 }
              }
              d3.select(this).style(attr);
            })
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
            idPrev: 0,
            currentLabel: null, //current label
            l_dash: null, //current extended label
            U: [],
            P: [],
            sourceId: -1,
            currentResidentNodeEdgeIndex: -1 //for iteration outgoing edges in label extension step
        };

        setStatus(STATUS_SELECTSOURCE);

        if(Graph.instance){
          this.nextStepChoice(Graph.instance.nodes.get(0),true);
        }


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
            return divCounter == s.idPrev;
        });
        
        var sel = d3.select("#ta_div_statusErklaerung").selectAll("div");
        sel.style("display", function(a, divCounter) {
            return (divCounter == s.idPrev) ? "block" : "none";
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


    function setStatus(newStatus,oldStatus){
      s.idPrev = (oldStatus != null) ? oldStatus : s.id;
      s.id = newStatus;
    }

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
            case STATUS_START: //TODO: is never called
                logger.log("Now the algorithm can start");
                setStatus(STATUS_INIT);
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
        setStatus(STATUS_INIT,STATUS_START);
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

        var label = new Graph.Label(null,trivialPath);
        
        s.U.push(label);
        setStatus(STATUS_MAINLOOP);
        
        logger.log("Init labels. start label: "+label.toString()+" added to U");
    }
    
    var mainLoopIt = 0;
    
    /**
    * main loop: pops the current node from the queue until empty
    */
    function mainLoop() {
        if (s.U.length == 0) {
            setStatus(STATUS_FINISHED,STATUS_FINISHED);
            s.currentLabel = null;
            // that.stopFastForward();
            logger.log("Finished");
            return;
        }
        
        s.currentLabel = s.U.shift();
        s.currentResidentNodeEdgeIndex = 0;
        logger.log("Main loop #" + (mainLoopIt++) + " picked label " + s.currentLabel.toString()+ " from U");
        
        setStatus(STATUS_PATH_EXTEND);
    }

    /**
     * try to extend currentLabel along currentArc
     */
    function pathExtend() {
        var v = Graph.instance.nodes.get(s.currentLabel.nodeId);
        var outEdges = v.getOutEdges();
        if(s.currentResidentNodeEdgeIndex >= outEdges.length){
            setStatus(STATUS_LABEL_PROCESSED);
            logger.log2("iterated all neighbours of "+v.id);
        }else{
            var arc = outEdges[s.currentResidentNodeEdgeIndex++];
            s.currentArcId=arc.id;
            var l_dash = new Graph.Label(s.currentLabel,arc); //TODO do we need the extended label already here?
            logger.log2("checking arc "+arc.toString(true,edgeResourceStyle)+" from "+v.toString(true,nodeResourceStyle));
            s.l_dash = l_dash;
            setStatus(STATUS_PATH_EXTEND_FEASIBLE);
        }
    }

    /**
     * Check if the previous label extension was feasible.
     * if yes, put it in U, else discard it
     */
    function pathExtendFeasible() {
        var w = Graph.instance.nodes.get(s.l_dash.nodeId);
        if(s.l_dash.feasible()){
            s.U.push(s.l_dash);
            if(!w.state.endingPaths) w.state.endingPaths = [];
            w.state.endingPaths.push(s.l_dash);
            logger.log3(s.l_dash.toString() + " feasible in " + w.toString(true,nodeResourceStyle) + ", add to U");
        }else{
            logger.log3(s.l_dash.toString() + " infeasible in " + w.toString(true,nodeResourceStyle))
        }
        s.l_dash = null;
        setStatus(STATUS_PATH_EXTEND); // go back to inner FORALL loop head
    }

    /**
     * put processed label in P
     */
    function labelProcessed() {
        s.P.push(s.currentLabel);
        logger.log2("processed label " + s.currentLabel.toString() + ", added to P");
        s.currentLabel = null;
        setStatus(STATUS_DOMINANCE);
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

                        logger.log3(otherpath.toString() +" dominated by " + path.toString());
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

        setStatus(STATUS_MAINLOOP);
    }

    /**
     * discard strictly dominated labels in both P and U
     */
    function filter() {
        //TODO
        logger.log("filter solution step");
        setStatus(STATUS_FINISHED);
    }

    function nodeResourceStyle(d,i){
        return "<span style=color:red>"+d+"</span>";
    }

    function edgeResourceStyle(d,i){
        return "<span style=color:" + ((i==CONSTRAINED_RESOURCE_INDEX) ? "red" : "green") + ">"+d+"</span>";
    }
}

// Vererbung realisieren
SPPRCLabelSettingAlgorithm.prototype = Object.create(GraphDrawer.prototype);
SPPRCLabelSettingAlgorithm.prototype.constructor = SPPRCLabelSettingAlgorithm;
