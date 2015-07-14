/**
 * A graph editor for network flows.
 * @author Adrian Haarbach
 */
function FlowGraphEditor(p_graph,p_canvas) {
    GraphEditor.call(this,p_graph,p_canvas);

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

    };
    
    /**
     * Setzt den Graph auf einen der Beispielgraphen. Fügt auch die 
     * Hintergrundbilder per CSS hinzu.
     */
    this.setGraphHandler = function() {
        var selection = $("#tg_select_GraphSelector>option:selected").val();
        var filename = selection + ".txt";
        console.log(filename);

        Graph.load("graphs-new/"+filename, function(graphLoaded){
            that.clear();
            that.graph.replace(graphLoaded);
            that.update();
        });
    };
}

// Vererbung realisieren
FlowGraphEditor.prototype = Object.create(GraphEditor.prototype);
FlowGraphEditor.prototype.constructor = FlowGraphEditor;