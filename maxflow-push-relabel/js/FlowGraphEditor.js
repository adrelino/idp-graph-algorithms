/**
 * A graph editor for network flows.
 * @author Adrian Haarbach
 */
function FlowGraphEditor(svgSelection) {
    GraphEditor.call(this,svgSelection);

    var that = this;
    
    /**
     * Initialisiert das Zeichenfeld
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
     * When Tab comes into view
     * speichert das Ergebnis im .data() Feld von body
     * @method
     */
    this.activate = function() {
       if(Graph.instance) this.update();
    };
    
    /**
     * tab disappears from view
     * @method
     */
    this.deactivate = function() {

    };
    
    /**
     * Setzt den Graph auf einen der Beispielgraphen. Fügt auch die 
     * Hintergrundbilder per CSS hinzu.
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

// Vererbung realisieren
FlowGraphEditor.prototype = Object.create(GraphEditor.prototype);
FlowGraphEditor.prototype.constructor = FlowGraphEditor;