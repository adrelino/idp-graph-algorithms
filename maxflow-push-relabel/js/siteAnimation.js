/**
 * @author Adrian Haarbach
 * Allgemeine Animationen der Seite, Initialisierungscode<br>
 */

/**
 * Initialisiere Layout der Seite
 * Tabs, Buttons, ersten Tab<br>
 * Wenn ein Dialog vor dem Tabwechsel aufgerufen wird, z.B. weil der Algorithmus
 * durch Tabwechsel abgebrochen würde, so muss der Tabwechsel zunächst abgefangen werden.
 * Das Ergebnis des Dialogs wird gespeichert und ein Tabwechsel wird ausgelöst.
 */
var graphEditorTab = null, algorithmTab = null;

function initializeSiteLayout() {
//     $("#tabs").tabs();
//     if(window.location.hash) {
//         $("#tabs").tabs( "option", "active", 0 );
//     }
    $("button").button();
    $("#te_button_gotoDrawGraph").click(function() { $("#tabs").tabs("option", "active", 1);});
    $("#te_button_gotoIdee").click(function() { $("#tabs").tabs("option", "active", 3);});
    $("#ti_button_gotoDrawGraph").click(function() { $("#tabs").tabs("option", "active", 1);});
    $("#ti_button_gotoAlgorithm").click(function() { $("#tabs").tabs("option", "active", 2);});
    $("#tw_Accordion").accordion({heightStyle: "content"});
    
                    graphEditorTab = new Tab(new FlowGraphEditor(d3.select("#tg_canvas_graph")),$("#tab_tg"));
                    algorithmTab = new Tab(new GoldbergTarjanPushRelabelAlgorithm(d3.select("#ta_canvas_graph")),$("#tab_ta"));
                    graphEditorTab.init();
                    algorithmTab.init();

//     $('#tg_select_GraphSelector').selectmenu();

    $('#fileDownloader').on('click',function(foo){
        var ahref = $(this);
        var text = Graph.instance.toString();
//         text.replace("\r\n", "\\r\\n");
        text = "data:text/plain,"+encodeURIComponent(text);
        ahref.prop("href",text);
    });

    $('#ta_div_parseError').dialog({
                autoOpen: false,
                resizable: false,
//                 modal: true,
                buttons: {
                    "Ok": function() {
//                             $("#tabs").removeData("requestedTab");
//                             $("#tabs").removeData("tabChangeDialogOpen");
                        $(this).dialog( "close" );
                    }
//                         "Tab wechseln": function() {
//                             $(this).dialog( "close" );
//                             var newTabID =$("#tabs").data("requestedTab");
//                             $("#tabs").removeData("requestedTab");
//                             $("#tabs").tabs("option", "active", newTabID);
//                             $("#tabs").removeData("tabChangeDialogOpen");
//                         }   
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
            if(id == "tab_tg") {             // Tab Graph erstellen
                graphEditorTab.deactivate();
            }
            if(id == "tab_ta") {             // Tab Graph ausführen
//                 if($("#tab_ta").data("algo").getStatusID() != null && $("#tab_ta").data("algo").getStatusID() !== 8 && $("#tab_ta").data("algo").getStatusID() !== 2) {
//                     if($("#tabs").data("tabChangeDialogOpen") == null) {
//                         event.preventDefault();
//                         $("#tabs").data("requestedTab", $("#"+ui.newPanel.attr("id")).index()-1);
//                         $("#tabs").data("tabChangeDialogOpen", true);
//                         $("#ta_div_confirmTabChange").dialog("open");
//                     }else{
//                         $("#tab_ta").data("algo").destroy();
//                     }
//                 }else{
                    algorithmTab.deactivate();
//                 }
            }
        },
        activate: function(event, ui) {
            var id = ui.newPanel[0].id;
            if(id == "tab_tg") {
//                 if(graphEditorTab == null){
//                     graphEditorTab.init();
//                 }
                graphEditorTab.activate();
            } else if(id == "tab_ta") {
//                 if(algorithmTab == null){
//                     algorithmTab.init();
//                 }
                algorithmTab.activate();
            }
        }
    });
}