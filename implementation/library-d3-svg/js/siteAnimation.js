var graphEditorTab = null, algorithmTab = null;

function svgHack(){
//add arrowhead
    var defs = d3.select("body").append("svg")
        .attr("id","graph-defs")
        .append("defs")

     defs.append("marker")
        .attr("id", "arrowhead2")
        .attr("refX",24) /*must be smarter way to calculate shift*/
        .attr("refY",4)
        .attr("markerUnits","userSpaceOnUse")
        .attr("markerWidth", 24)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0,0 V 8 L12,4 Z"); //this is actual shape for arrowhead

     defs.append("marker")
        .attr("id", "arrowhead3")
        .attr("refX",24) /*must be smarter way to calculate shift*/
        .attr("refY",4)
        .attr("markerUnits","userSpaceOnUse")
        .attr("markerWidth", 24)
        .attr("markerHeight", 8)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M 0,0 V 8 L12,4 Z"); //this is actual shape for arrowhead



//replace img with svg

//     //http://www.mediaevent.de/svg-in-html-seiten/
    var imgs = d3.selectAll("img");

// //    var sources = imgs[0].map(function(d){return d.src});

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


function svgSerialize(svgHtml){//Node){
//   if(styles){
//     //svg.select('defs').select('style').text('<![CDATA['+styles+']]>')

//     var header ='<svg width="'+ww+'" height="'+hh+'" version="1.1" xmlns="http://www.w3.org/2000/svg">';
//     header +='<defs>';
//     //inline arrowhead marker style
//     header += d3.select('#graph-defs').select('defs').html();
//     //inline css styles
//     header += '<style type="text/css"> <![CDATA['+styles+']]> </style>';
//     header += '</defs>';
//     header +=svgNode.innerHTML;
//     header +='</svg>';

//    return 'data:image/svg+xml;utf8,'+header;
//   }



  //use jquery to get the svg xml, doesnt work with d3.
  //var svgContainer = that.tab.find('.svgContainer');//.clone();
  //var svg = svgContainer.find(".graphCanvas");
//   d3.select(this).attr({ version: '1.1' , xmlns:"http://www.w3.org/2000/svg"});
  //var svgHtml = svgContainer.html();

  //var svgHtml = (new XMLSerializer()).serializeToString(svgNode);//svgOrigin.node()
  //var seed = 50 + Math.floor(Math.random()*1000000); //lower 50 ones are reserved for my own use

  //svgHtml = svgHtml.replace(/arrowhead2/g,"arrowhead"+seed);

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
function svgSerializeAndCrop(svgNode,styles,crop){
  var sel=d3.select(svgNode);
  var algo = GraphAlgos.get(sel.attr("id"));

  var oldId = sel.attr("id");
  var oldClass = sel.attr("class");
  sel.attr("id",null);
  sel.attr("class",null);

  if(algo && crop){
    var nodes = Graph.instance.getNodes();

    var screenCoords = nodes.map(algo.nodePos.bind(algo));

    var xR = d3.extent(screenCoords,function(d){return d.x});
    var yR = d3.extent(screenCoords,function(d){return d.y});

    var transl = "translate(-"+xR[0]+",-"+yR[0]+")";

    var oldWidth = sel.attr("width");
    var oldHeight = sel.attr("height");
    var width = xR[1]-xR[0]+algo.margin.left+algo.margin.right;
    var height = yR[1]-yR[0]+algo.margin.top+algo.margin.bottom;

    //use d3 to select transform, doesnt work with jqyery since it selects all g's, not just the top level one;
    var oldTra = sel.select("g").attr("transform");

    sel.select("g").attr("transform",oldTra+","+transl);//.each("end",function(){
    sel.attr("width",width);
    sel.attr("height",height);
    sel.attr("viewBox","0 0 "+width+" "+height);//http://stackoverflow.com/questions/19484707/how-can-i-make-an-svg-scale-with-its-parent-container
  }

    //inline arrowhead marker style
  var header = d3.select('#graph-defs').select('defs').html()+'\n';
  var defs = sel.insert('defs',"g").html(header);

      //inline css style
  var styles = styles.replace(/(\r\n|\n|\r)/gm," ");

  //var header2 = '<style type="text/css"> <![CDATA['+styles+']]> </style>';

  var styleSel = defs.append("style").attr("type","text/css");
  styleSel.text('<![CDATA['+styles+"]]>");

 // var svgHtmlinner = sel.html();

  var svgHtml = sel.node().outerHTML;
  svgHtml = svgHtml.replace("&lt;","<").replace("&gt;",">");

  var href = svgSerialize(svgHtml);

  if(algo && crop){
    //move back
    sel.attr("viewBox",null);
    sel.attr("width",oldWidth);
    sel.attr("height",oldHeight);
    sel.select("g").attr("transform",oldTra);
  }

  sel.attr("id",oldId);
  sel.attr("class",oldClass);

  defs.remove();


  return href;
}

function svgGraphCanvasDownloadable(){
   var container = d3.selectAll(".svgContainer");
   
   //1. bottom left: SVG Download
   //contains a svg and an a
   var links = container.selectAll('a');
   var svgOrigins = container.selectAll('svg');
   var styles;
   //async query styles from css file
   d3.text(d3.select("#graph-style").attr("href"),function(s){styles = s});


   links.on('mousedown',function(a,b,c){
     var node = svgOrigins[c][0];

     var href = svgSerializeAndCrop(node,styles);

     var ahref = d3.select(this);
     ahref.property("href-lang","image/svg+xml");
     ahref.property("href",href);
//      window.location=data;
   });

   //2 bottom right: Legende

   var legende = container.selectAll(".Legende");
   //var legendeText = container.selectAll(".LegendeText");
   //var legendeButton = container.selectAll(".LegendeMin");

   //legendeText.style("display","none");

   legende.forEach(function(a){
      var legendeText = $(a).find(".LegendeText");
      legendeText.hide();

      var legendeButton = $(a).find(".LegendeMin");
      legendeButton.button({icons: {primary: "ui-icon-plus"},text: false});
      legendeButton.on("click",function(){
        if(legendeText.is(":visible")){
          legendeText.hide();
          legendeButton.button({icons: {primary: "ui-icon-plus"},text: false});
        }else{
          legendeText.show();
          legendeButton.button({icons: {primary: "ui-icon-minus"},text: false});
        }
        //var foo = legendeText.toggle();
      })
   })

//    legendeButton.forEach(function(a,b){
//      var legendeMaxButton = $(a);
//         legendeMaxButton.button({icons: {primary: "ui-icon-plus"},text: false});
//    })

//    legendeButton.on('click',function(a,b,c){
//      legendeText.attr("visibility","hidden");
//    });
}


/**
 * Initializes the page layout of all interactive tabs
 * @author Adrian Haarbach
 * @global
 * @function
 */
function initializeSiteLayout() {

    $("button").button();
    $("#te_button_gotoDrawGraph").click(function() { $("#tabs").tabs("option", "active", 1);});
    $("#te_button_gotoIdee").click(function() { $("#tabs").tabs("option", "active", 3);});
    $("#ti_button_gotoDrawGraph").click(function() { $("#tabs").tabs("option", "active", 1);});
    $("#ti_button_gotoAlgorithm").click(function() { $("#tabs").tabs("option", "active", 2);});
    $("#tw_Accordion").accordion({heightStyle: "content"});
    
    graphEditorTab = new GraphEditorTab(new GraphEditor(d3.select("#tg_canvas_graph")),$("#tab_tg"));
    graphEditorTab.init();
    
    algorithmTab = new AlgorithmTab(new GraphAlgorithm(d3.select("#ta_canvas_graph"),d3.select("#ta_canvas_graph2")),$("#tab_ta"));
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


//http://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters
function getUrlVars() {
    var vars = {};
    var parts = window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[key] = value;
    });
    return vars;
  }

function getUrlHash() {
  return window.location.hash;
}



$(function() {
    initializeSiteLayout();
    $("#year").html(new Date().getFullYear());
});
$(document).ready(function() {
    $("#menu").mmenu({
       "navbar": {
          "title": "Übersicht"
       },
       "offCanvas": {
          "zposition": "front"
       },
       "counters": true,
       "slidingSubmenus": true,
       "classes": "mm-light",
    });
 });