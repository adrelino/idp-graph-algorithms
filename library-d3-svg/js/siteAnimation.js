/**
 * Initializes the page layout of all interactive tabs
 * @author Adrian Haarbach
 * @global
 * @function
 */
function initializeSiteLayout(GraphAlgorithmConstructor) {
    var graphEditorTab = null, algorithmTab = null;

    $("button").button();
    $("#te_button_gotoDrawGraph").click(function() { $("#tabs").tabs("option", "active", 1);});
    $("#te_button_gotoIdee").click(function() { $("#tabs").tabs("option", "active", 3);});
    $("#ti_button_gotoDrawGraph").click(function() { $("#tabs").tabs("option", "active", 1);});
    $("#ti_button_gotoAlgorithm").click(function() { $("#tabs").tabs("option", "active", 2);});
    $("#tw_Accordion").accordion({heightStyle: "content"});
    
    graphEditorTab = new GraphEditorTab(new GraphEditor(d3.select("#tg_canvas_graph")),$("#tab_tg"));
    graphEditorTab.init();
    
    algorithmTab = new AlgorithmTab(new GraphAlgorithmConstructor(d3.select("#ta_canvas_graph")),$("#tab_ta"));
    algorithmTab.init();
  
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