/**
 * A graph editor in a Tab
 * @author Adrian Haarbach
 * @augments Tab
 * @class
 */
function GraphEditorTab(algo,p_tab) {
    Tab.call(this, algo, p_tab);

    var that = this;
    
    /**
     * Wires up the events on button clicks or selection changes and listens to a Graph change event
     * @method
     */
    this.init = function() {
        $("#tg_button_gotoAlgorithmTab").click(function() {
            $("#tabs").tabs("option","active",2);
        });
        $("#tg_select_GraphSelector").on("change.GraphDrawer",that.setGraphHandler);     // Beispielgraph auswählen
        
        //add function to be called after a new graph has been loaded.
        Graph.addChangeListener(function(){
            algo.clear();
            algo.update();
        });

        $('#fileDownloader').on('click',function(foo){
            var ahref = $(this);
            var text = Graph.stringify();
            text = "data:text/plain,"+encodeURIComponent(text);
            ahref.prop("href",text);
        });

        $('#ta_div_parseError').dialog({
            autoOpen: false,
            resizable: false,
    //      modal: true,
            buttons: {
                "Ok": function() {
                    $(this).dialog( "close" );
                } 
            }
        }); 

        $('#fileUploader').on('change',function(ev){
            Graph.handleFileSelect(ev,function(errCode,errDescription,filename){
                    $('#ta_div_parseError').dialog("open");
                    $('#ta_div_parseErrorText').text(errCode);
                    $('#ta_div_parseErrorFilename').text(filename);
                    $('#ta_div_parseErrorDescription').text(errDescription);
            })
        });
        
        //inheritance
        Tab.prototype.init.call(this);
    };
    
    /**
     * When Tab comes into view we update the view
     * @method
     */
    this.activate = function() {
       if(Graph.instance) algo.update();
       Tab.prototype.activate.call(this);

    };
    
    /**
     * A different example graph was selected. Triggers the loader
     * @method
     */
    this.setGraphHandler = function() {
        var selection = $("#tg_select_GraphSelector>option:selected").val();
        var filename = selection + ".txt";
        //console.log(filename);

        //load graph as singleton
        //calls registered event listeners when loaded
        Graph.loadInstance("graphs-new/"+filename);
    };
}

//Prototypal inheritance
GraphEditorTab.prototype = Object.create(Tab.prototype);
GraphEditorTab.prototype.constructor = Tab;