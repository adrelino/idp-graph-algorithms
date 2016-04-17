var graphEditorTab = null, algorithmTab = null;

function svgHack(){
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

function svgSerialize(svgNode){
  //use jquery to get the svg xml, doesnt work with d3.
  //var svgContainer = that.tab.find('.svgContainer');//.clone();
  //var svg = svgContainer.find(".graphCanvas");
//   d3.select(this).attr({ version: '1.1' , xmlns:"http://www.w3.org/2000/svg"});
  //var svgHtml = svgContainer.html();

  var svgHtml = (new XMLSerializer()).serializeToString(svgNode);//svgOrigin.node()
  var seed = 50 + Math.floor(Math.random()*1000000); //lower 50 ones are reserved for my own use

  svgHtml = svgHtml.replace(/arrowhead2/g,"arrowhead"+seed);

  //                 svgHtml = '<?xml-stylesheet type="text/css" href="href="../library-d3-svg/css/graph-style.css" ?>' + svgHtml;

  var b64 = btoa(svgHtml); // or use btoa if supported

  // Works in recent Webkit(Chrome)
  //      $("body").append($("<img src='data:image/svg+xml;base64,\n"+b64+"' alt='file.svg'/>"));

  // Works in Firefox 3.6 and Webit and possibly any browser which supports the data-uri
  //      $("body").append($("<a href-lang='image/svg+xml' href='data:image/svg+xml;base64,\n"+b64+"' title='file.svg'>Download</a>"));


  var href = "data:image/svg+xml;base64,\n"+b64;
  return href;
}

//http://spin.atomicobject.com/2014/01/21/convert-svg-to-png/
//http://techslides.com/save-svg-as-an-image
function svgSerializeAndCrop(svgNode){
  var sel=d3.select(svgNode);
  var algo = GraphAlgos.get(sel.attr("id"));

  if(algo){
    var nodes = Graph.instance.getNodes();

    var screenCoords = nodes.map(algo.nodePos.bind(algo));

    var xR = d3.extent(screenCoords,function(d){return d.x});
    var yR = d3.extent(screenCoords,function(d){return d.y});

    var transl = "translate(-"+xR[0]+",-"+yR[0]+")";

    var width = xR[1]-xR[0]+algo.margin.left+algo.margin.right;
    var height = yR[1]-yR[0]+algo.margin.top+algo.margin.bottom;

    //use d3 to select transform, doesnt work with jqyery since it selects all g's, not just the top level one;
    var oldTra = algo.svgOrigin.select("g").attr("transform");
    var oldWidth = algo.svgOrigin.attr("width");
    var oldHeight = algo.svgOrigin.attr("height");

    algo.svgOrigin.select("g").attr("transform",oldTra+","+transl);//.each("end",function(){
    algo.svgOrigin.attr("width",width);
    algo.svgOrigin.attr("height",height);
  }

  var href = svgSerialize(svgNode);

  if(algo){
    //move back
    algo.svgOrigin.attr("width",oldWidth);
    algo.svgOrigin.attr("height",oldHeight);
    algo.svgOrigin.select("g").attr("transform",oldTra);
  }

  return href;
}

function svgGraphCanvasDownloadable(){
   var container = d3.selectAll(".svgContainer");
   //contains a svg and an a
   var links = container.selectAll('a');
   var svgOrigins = container.selectAll('svg');


   links.on('mousedown',function(a,b,c){
     var node = svgOrigins[c][0];

     var href = svgSerializeAndCrop(node);

     var ahref = d3.select(this);
     ahref.property("href-lang","image/svg+xml");
     ahref.property("href",href);
//      window.location=data;
   })
}


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
    
    algorithmTab = new AlgorithmTab(new GraphAlgorithmConstructor(d3.select("#ta_canvas_graph"),d3.select("#ta_canvas_graph2")),$("#tab_ta"));
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

   svgHack();
   svgGraphCanvasDownloadable();
}