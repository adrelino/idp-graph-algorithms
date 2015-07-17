/**
 * A graph editor for network flows.
 * @author Adrian Haarbach
 * @augments GraphEditor
 * @class
 */
function FlowGraphEditor(svgSelection) {
    GraphEditor.call(this,svgSelection);

    var that = this;
    
    /**
     * Wires up the events on button clicks or selection changes and listens to a Graph change event
     * @method
     */
    this.init = function() {
        $("#tg_button_gotoAlgorithmTab").click(function() {
            $("#tabs").tabs("option","active",2);
        });
        $("#tg_select_GraphSelector").on("change.GraphDrawer",this.setGraphHandler);     // Beispielgraph auswählen
        
        Graph.addChangeListener(function(){
//             that.reset();
            that.clear();
            that.update();
        });
//         this.setGraphHandler(); //triggers loading of first graph
    };
    
    /**
     * When Tab comes into view we update the view
     * @method
     */
    this.activate = function() {
       if(Graph.instance) this.update();
    };
    
    /**
     * Tab disappears from view
     * @method
     */
    this.deactivate = function() {

    };
    
    /**
     * A different example graph was selected. Triggers the loader
     * @method
     */
    this.setGraphHandler = function() {
        var selection = $("#tg_select_GraphSelector>option:selected").val();
        var filename = selection + ".txt";
        console.log(filename);

        Graph.loadInstance("graphs-new/"+filename); //calls registered event listeners when loaded;

//         Graph.load("graphs-new/"+filename, function(graphLoaded){
//             that.setGraph(graphLoaded);
//         });
    };
}

//Prototypal inheritance
FlowGraphEditor.prototype = Object.create(GraphEditor.prototype);
FlowGraphEditor.prototype.constructor = FlowGraphEditor;