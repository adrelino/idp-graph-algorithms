    var graphEditorTab = null, algorithmTab = null;

/**
 * Initializes the page layout of all interactive tabs
 * @author Adrian Haarbach
 * @global
 * @function
 */
function initializeSiteLayout(GraphAlgorithmConstructor) {

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


//http://www.mediaevent.de/svg-in-html-seiten/
   var imgs = d3.selectAll("img");

//    var sources = imgs[0].map(function(d){return d.src});


   imgs.attr("src",function(a,b,c){
       var src = this.src;
       var selection = d3.select(this);
       if(src.indexOf(".svg")==src.length-4){
           d3.text(src, function(error,text){
//             console.log(selection.html());
//             d3.select("#svgtest").html(text);
            var parent = d3.select(selection.node().parentNode)
                
//                 parent.append("p").text("test");
                parent.insert("span","img").html(text);
                var newSVGElem = parent.select("span").select("svg");

                newSVGElem.attr("class","svgText");

                selection.remove();

//             var foo = selection.node().parentNode.innerHtml; //).append("div").html(text);
        });
       }
       return src;
   })
}