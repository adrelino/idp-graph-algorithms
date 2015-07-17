/**
 * Initializes the page layout of all interactive tabs
 * @author Adrian Haarbach
 * @global
 * @function
 */
function initializeSiteLayout() {
    var graphEditorTab = null, algorithmTab = null;

    $("button").button();
    $("#te_button_gotoDrawGraph").click(function() { $("#tabs").tabs("option", "active", 1);});
    $("#te_button_gotoIdee").click(function() { $("#tabs").tabs("option", "active", 3);});
    $("#ti_button_gotoDrawGraph").click(function() { $("#tabs").tabs("option", "active", 1);});
    $("#ti_button_gotoAlgorithm").click(function() { $("#tabs").tabs("option", "active", 2);});
    $("#tw_Accordion").accordion({heightStyle: "content"});
    
    graphEditorTab = new Tab(new FlowGraphEditor(d3.select("#tg_canvas_graph")),$("#tab_tg"));
    graphEditorTab.init();
    
    algorithmTab = new Tab(new GoldbergTarjanPushRelabelAlgorithm(d3.select("#ta_canvas_graph")),$("#tab_ta"));
    algorithmTab.init();

    $('#fileDownloader').on('click',function(foo){
        var ahref = $(this);
        var text = Graph.instance.toString();
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
   

    $("#tabs").tabs({
        beforeActivate: function(event, ui) {
            var id = ui.oldPanel[0].id;
            if(id == "tab_tg") { /** graph editor tab */
                graphEditorTab.deactivate();
            }else if(id == "tab_ta") { /** graph algorithm tab */
                algorithmTab.deactivate();
            }
        },
        activate: function(event, ui) {
            var id = ui.newPanel[0].id;
            if(id == "tab_tg") {
                graphEditorTab.activate();
            } else if(id == "tab_ta") {
                algorithmTab.activate();
            }
        }
    });
}