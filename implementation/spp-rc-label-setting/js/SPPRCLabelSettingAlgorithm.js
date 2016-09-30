var STATUS_SELECTSOURCE = 0;
var STATUS_START = 1;
var STATUS_INIT = 2;
var STATUS_MAINLOOP = 3;
var STATUS_PATH_EXTEND = 4;
var STATUS_PATH_EXTEND_FEASIBLE = 5;
var STATUS_PATH_EXTEND_UNFEASIBLE = 6;
var STATUS_LABEL_PROCESSED = 7;
var STATUS_DOMINANCE = 8;
var STATUS_DOMINANCE_NODE = 9;
var STATUS_FINISHED = 10;

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
    
    /**
     * the logger instance
     * @type Logger
     */
    var logger = new Logger(d3.select("#logger"),d3.select("#loggerLastEntry"));


    /**
     * status variables
     * @type Object
     */
    var s = null;

    this.getState = function(){
      return s;
    }

    var labelDrawer = new LabelDrawer(svgSelection2,this);

    
    var colormap = ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"].reverse();

    this.dominanceStepNodeColors = d3.scale.category10();
    
    this.nodeLabel = function(d) {
        if (d.id == s.sourceId)
            return "s";
        else if(d.id == s.targetId)
            return "t";
        else
            return d.id;
    }


    ///////////
    //SELECTBOXES

    var highlightPathForLabelSelectBox = d3.select("#highlightPathForLabel");
    highlightPathForLabelSelectBox.on('change',function(e){
      that.setHighlightPathForLabel(this.value,false,true);
    });
    this.setHighlightPathForLabel = function(name,noUpdate,userChoseFilter){
      s.highlightPathForLabelId = name;
      highlightPathForLabelSelectBox.property("value",name); //does not trigger 'change' event
      if(!noUpdate) that.update(userChoseFilter);
    }

    var residentNodeFilterSelectBox=d3.select("#filterLabelsByResidentNode");
    residentNodeFilterSelectBox.on('change',function(e){
      that.setResidentNodeFilter(this.value,false,true);
    });
    this.setResidentNodeFilter = function(name,noUpdate,userChoseFilter){
      s.residentNodeFilterId = name;
      residentNodeFilterSelectBox.property("value",name); //does not trigger 'change' event
      if(!noUpdate) that.update(userChoseFilter);
    }

    ///////////


    
    this.onNodesEntered = function(selection) {
        //select source and target nodes
        selection
        .style("cursor","pointer")
        .on("click", function(d) {
            if (s.id == STATUS_SELECTSOURCE) {
                that.nextStepChoice(d);
            }else{
              that.setResidentNodeFilter(d.id,false,true);
              console.log(d);
              if(s.id == STATUS_FINISHED){
                console.log("filter");
                that.filter(d);
              }
              //highlight all labels which have this node as residentVertex
            }
        })
    }
    
    this.onNodesUpdated = function(selection) {
        selection
        .selectAll("circle")
        .style("fill", function(d) {
            if (s.lId && (d.id == Graph.Label.get(s.lId).nodeId)) {
                return const_Colors.NodeBorderHighlight;
            } else if (d.id == s.sourceId || d.id == s.targetId){
                return const_Colors.StartNodeColor;
            }else{
              return global_NodeLayout['fillStyle'];
            }
        })
        //.style("stroke",function(d){return d.id==s.residentNodeFilterId ? "black" : global_NodeLayout['borderColor']})
        .style("stroke-width",function(d){return d.id==s.residentNodeFilterId ? "4" : global_NodeLayout['borderWidth']});
    }
    
    this.onEdgesEntered = function(selection) {
    
    }
    
    this.onEdgesUpdated = function(selection) {
        //fat edges on complete path
        var labelToHighlightPath = Graph.Label.get(s.highlightPathForLabelId);

        //green edges on complete path
        var minCostPath = Graph.Label.get(s.minCostLabelId);



        selection.selectAll("line").each(function(d){
            var attr = {"stroke":"black","stroke-width":global_Edgelayout['lineWidth'],"marker-end":"url(#arrowhead2)"};
            if(s.lId && (d.id == s.currentArcId)){
//                 if(s.idPrev==STATUS_PUSH || s.idPrev==STATUS_ADMISSIBLEPUSH){
                attr["stroke"]="orange";//const_Colors.CurrentNodeColor;
                attr["marker-end"]="url(#arrowhead2-red)";
//                 }else{
//                   attr["stroke"]="green";
//                   attr["marker-end"]="url(#arrowhead2-green)";
//                 }
            }

            if(labelToHighlightPath && labelToHighlightPath.arcIds.indexOf(d.id) >= 0){
                attr["stroke-width"]=4;
            }

            if(minCostPath && minCostPath.arcIds.indexOf(d.id) >= 0){
                attr["stroke"]='green';
            }

            d3.select(this).style(attr);
           });
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
            U: [], //unprocessed
            P: [], //processed
            lId: null, //current label
            l_dashId: null, //current extended label. does not need to go into U or P afterwards
            sourceId: -1,
            mainLoopIt : 1,
            currentResidentNodeEdgeIndex: -1, //for iteration outgoing edges in label extension step
            currentArcId: null,
            currentNodeIndexDominance: 0, //for iterating nodes in dominance step
            currentNodeIdDominance: null, //for iterating nodes in dominance step
            targetId : null, //only in filtering step for solution
            minCostLabelId : null //only in filtering step for solution
        };

        setStatus(STATUS_SELECTSOURCE);

        logger.reset();

        s.highlightPathForLabelId=highlightPathForLabelSelectBox.property("value");
        s.residentNodeFilterId=residentNodeFilterSelectBox.property("value");


        if(Graph.instance){
          labelDrawer.reset();

          var arr = Graph.instance.getNodes().map(function(n){
              return n.id;
          });
          arr.unshift("all");
          var selection = residentNodeFilterSelectBox.selectAll('option').data(arr);
          selection.enter().append('option');
          selection
            .attr('value',function(d){return d})
            .text(function(d){return d});
          selection.exit().remove();

          this.nextStepChoice(Graph.instance.nodes.get(0),true);
        }

        Graph.Label.reset();


        this.s=s;

        this.replayHistory = [];
    }

    /**
     * Makes the view consistent with the state
     * @method
     */
    this.update = function(userChoseFilter){

        var labelIds = [];//Graph.Label.labels.values();
        if(s.lId){
          labelIds.push(s.lId);
        }
        if(s.l_dashId){
          labelIds.push(s.l_dashId);
        }
        for(var i=0; i<s.U.length; i++){
          labelIds.push(s.U[i]);
        }
        for(var i=0; i<s.P.length; i++){
          labelIds.push(s.P[i]);
        }

        this.updateDescriptionAndPseudocode(labelIds);
        logger.update();

        labelDrawer.updateLabels(s,userChoseFilter);

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
            "labelState": Graph.Label.getState(),
            "s": JSON.stringify(s),
            "loggerState": logger.getState()
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
        
        Graph.instance.setState(oldState["graphState"]);
        Graph.Label.setState(oldState["labelState"]);
        s = JSON.parse(oldState["s"]);
        logger.setState(oldState["loggerState"]);
        
        this.update();
    };

    /**
     * updates status description and pseudocode highlight based on current s.id
     * @method
     */
    this.updateDescriptionAndPseudocode = function(labelIds) {
        var sel = d3.select("#ta_div_statusPseudocode").selectAll("div").selectAll("p")
        sel.classed("marked", function(a, pInDivCounter, divCounter) {
            return divCounter == s.idPrev;
        });
        
        var sel = d3.select("#ta_div_statusErklaerung").selectAll("div");
        sel.style("display", function(a, divCounter) {
            return (divCounter == s.idPrev) ? "block" : "none";
        });

        d3.select("#ta_td_U").text("{"+s.U.join(",")+"}");
        d3.select("#ta_td_l").text(s.lId ? s.lId : "-");
        d3.select("#ta_td_P").text("{"+s.P.join(",")+"}");
        d3.select("#ta_td_l_dash").text(s.l_dashId ? s.l_dashId : "-");

        var selection = highlightPathForLabelSelectBox.selectAll('option').data(labelIds);
           selection.enter().append('option');
           selection
            .attr('value',function(d){return d})
            .text(function(d){return d});
            selection.exit().remove();
            
//         if(Graph.instance){
//           var nodes =Graph.instance.getNodes();
//         console.log(nodes);
//        // d3.select("#algoInformationen2").text(Graph.instance.getNodes().map(function(n){return n.id;}).join(","));
//         var foo = d3.select("#algoInfo2H").data(nodes);
//         foo.enter().append("th").text(function(d){return d.id});
//         foo.selectAll("td").text("st");
//         //foo.enter().append("td").text("st");
//         //foo.selectAll("td").text(function(d){return d.state.endingPaths ? d.state.endingPaths.join(",") : ""});

//         }


        if(this.fastForwardIntervalID != null){
            this.setDisabledForward(true,false);
            this.setDisabledBackward(true);
        }else if (s.id == STATUS_SELECTSOURCE) {
            this.setDisabledBackward(true);
            this.setDisabledForward(true);
        } else if (s.idPrev == STATUS_FINISHED) {
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
            case STATUS_PATH_EXTEND_UNFEASIBLE:
                pathExtendFeasible();
                break;
            case STATUS_LABEL_PROCESSED:
                labelProcessed();
                break;
            case STATUS_DOMINANCE:
                dominance();
                break;
            case STATUS_DOMINANCE_NODE:
                dominanceNode();
                break;
            case STATUS_FINISHED:
                this.filter();
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
        logger.log("Picked node '" + d.id + "' as start node 's'");
    };


    /////////////
    //following is generic label setting algorithm for SPPRC/ SPPTW
     /**
     * init the label queue / sets with the 
     */
    function initLabels() {

        var label = Graph.Label.trivial(s.sourceId);
        
        s.U.push(label.id);
        setStatus(STATUS_MAINLOOP);
        
        logger.log("Init labels. Add trivial label "+Graph.Label.toString(label)+" to U");
    }
        
    /**
    * main loop: pops the current node from the queue until empty
    */
    function mainLoop() {
        if (s.U.length == 0) {
            setStatus(STATUS_FINISHED);
            s.lId = null;
            // that.stopFastForward();
            logger.log("Finished");
            that.nextStepChoice();
            return;
        }
        
        s.lId = s.U.shift();
        s.currentResidentNodeEdgeIndex = 0;
        logger.log("Main loop iteration " + (s.mainLoopIt++) + ": picked label " + Graph.Label.toString(Graph.Label.get(s.lId))+ " from U");
        
        setStatus(STATUS_PATH_EXTEND);
    }

    /**
     * try to extend currentLabel along currentArc
     */
    function pathExtend() {
        var l = Graph.Label.get(s.lId);
        var v = Graph.instance.nodes.get(l.nodeId);
        
        var outEdges = v.getOutEdges();
        if(s.currentResidentNodeEdgeIndex >= outEdges.length){
            setStatus(STATUS_LABEL_PROCESSED);
            logger.log2("iterated all neighbours of "+v.id);
        }else{
            var arc = outEdges[s.currentResidentNodeEdgeIndex++];
            s.currentArcId=arc.id;
            var l_dash = Graph.Label.extend(l,arc); //TODO do we need the extended label already here?
            logger.log2("checking arc "+arc.toString(true,edgeResourceStyle)+" from "+v.toString(true,nodeResourceStyle));
            s.l_dashId = l_dash.id;
            if(Graph.Label.feasible(l_dash)){
              setStatus(STATUS_PATH_EXTEND_FEASIBLE);
            }else{
              setStatus(STATUS_PATH_EXTEND_UNFEASIBLE);
            }
        }
    }

    /**
     * Check if the previous label extension was feasible.
     * if yes, put it in U, else discard it
     */
    function pathExtendFeasible() {
        var l_dash = Graph.Label.get(s.l_dashId);
        var w = Graph.instance.nodes.get(l_dash.nodeId);
        s.currentArcId = null;

        if(Graph.Label.feasible(l_dash)){
            s.U.push(s.l_dashId);
            if(!w.state.endingPaths) w.state.endingPaths = [];
            w.state.endingPaths.push(s.l_dashId);
            logger.log3(Graph.Label.toString(l_dash) + " feasible in " + w.toString(true,nodeResourceStyle) + ", add to U");
        }else{
            logger.log3(Graph.Label.toString(l_dash) + " infeasible in " + w.toString(true,nodeResourceStyle))
        }
        s.l_dashId = null;
        setStatus(STATUS_PATH_EXTEND); // go back to inner FORALL loop head
    }

    /**
     * put processed label in P
     */
    function labelProcessed() {
        s.P.push(s.lId);
        logger.log2("processed label " + Graph.Label.toString(Graph.Label.get(s.lId)) + ", added to P");
        s.lId = null;
        setStatus(STATUS_DOMINANCE);
    }

    /**
     * discard strictly dominated labels in both P and U
     */
    function dominance() {
        logger.log2("dominance step");

        var nodes = Graph.instance.getNodes();

        var nooneDominated = true;

        if(s.currentNodeIndexDominance >= nodes.length){
            s.currentNodeIndexDominance=0;
            s.currentNodeIdDominance=null;
            logger.log2("iterated all nodes");
            if (s.U.length == 0) {
              setStatus(STATUS_FINISHED);
              s.lId = null;
              // that.stopFastForward();
              logger.log("Finished");
              return;
            }else{
              setStatus(STATUS_MAINLOOP);
            }
        }else{
          var node = nodes[s.currentNodeIndexDominance++];
          s.currentNodeIdDominance = node.id;
          //labelDrawer.setResidentNodeFilter(s.currentNodeIdDominance,true,true);
          setStatus(STATUS_DOMINANCE_NODE);
          logger.log2("node "+node.id+ " checked for dominance");
        }
    }

    function dominanceNode(){
        var node = Graph.instance.nodes.get(s.currentNodeIdDominance);
        if(!node.state.endingPaths || node.state.endingPaths.length<=1){
            logger.log2("not more than 1 path ending in resident node "+node.id);
        }else{
            logger.log2("dominance step for resident node "+node.id);
            for(var j = 0; j < node.state.endingPaths.length; j++){
                //remove all other paths in upper right cone of this
                var path = Graph.Label.get(node.state.endingPaths[j]);

                for(var k = 0; k < node.state.endingPaths.length; k++){
                    if(j==k) continue;

                    var otherpath = Graph.Label.get(node.state.endingPaths[k]);

                    if(!path || !otherpath || path == otherpath) continue;
                    if( path.resources.every(function(r,l){
                        return r <= otherpath.resources[l]
                        })){
                        var removed = node.state.endingPaths.splice(k,1)[0];
                        if(removed != otherpath.id){
                            console.log("error");
                        }

                        //Graph.Label.remove(removed);
                        logger.log3(Graph.Label.toString(otherpath) +" dominated by " + Graph.Label.toString(path));
                        k--;

                        var indexInU = s.U.indexOf(removed);
                        if(indexInU>=0) s.U.splice(indexInU,1);

                        var indexInP = s.P.indexOf(removed);
                        if(indexInP>=0) s.P.splice(indexInP,1);

                    }
                }
            }
        }

        setStatus(STATUS_DOMINANCE);
    }

    /**
     * discard strictly dominated labels in both P and U
     */
    this.filter = function(targetNode) {
        if(!targetNode){
          //pick node with highest label as t per default
          targetNode = Graph.instance.nodes.get(Graph.instance.nodeIds-1);
        }
        logger.log("filter solution step");
        var labelIds = targetNode.state.endingPaths;
        var labels = labelIds.map(function(id){
          return Graph.Label.get(id);
        });

        var minCostLabel = labels[0];

        if(labels.length>1){
          for(var i=1; i< labels.length; i++){
            if(labels[i].isCheaper(minCostLabel)){
              minCostLabel=labels[i];
            }
          }
        }

        s.targetId = targetNode.id;
        s.minCostLabelId = minCostLabel.id;

        logger.log("label with minimal cost ending in "+ targetNode.id + " is "+ minCostLabel.id + " with cost of "+minCostLabel.cost());
        //this.setHighlightPathForLabel(minCostLabel.id,true,true);
        this.setResidentNodeFilter(targetNode.id,false,true);
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
