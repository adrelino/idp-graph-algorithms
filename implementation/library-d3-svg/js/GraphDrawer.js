/**
 * Die Farben, die im Projekt genutzt werden.
 * Aus dem TUM Styleguide.
 * @type Object 
 */
var const_Colors = {NodeFilling:            "#98C6EA",  // Pantone 283, 100%
                    NodeBorder:             "#0065BD",  // Pantone 300, 100%, "TUM-Blau"
                    NodeBorderHighlight:    "#C4071B",  // Helles Rot 100% aus TUM Styleguide
                    NodeFillingHighlight:   "#73B78D",  // Dunkelgrün 55 % aus TUM Styleguide
                    NodeFillingLight:       "#00c532",  // Dunkelgrün 55 % aus TUM Styleguide
                    NodeFillingQuestion:    "#C4071B",  // Helles Rot 100% aus TUM Styleguide
                    EdgeHighlight1:         "#C4071B",  // Helles Rot 100% aus TUM Styleguide
                    EdgeHighlight2:         "#73B78D",  // Dunkelgrün 55 % aus TUM Styleguide
                    EdgeHighlight3:         "#73B78D",  // Dunkelgrün 55 % aus TUM Styleguide
                    EdgeHighlight4:         "#007C30",  // Dunkelgrün 100 % aus TUM Styleguide
                    RedText:                "#C4071B",  // Helles Rot 100% aus TUM Styleguide
                    GreenText:              "#007C30",   // Dunkelgrün 100 % aus TUM Styleguide
    PQColor : "#FFFF70", // Helles Gelb
    StartNodeColor : "#33CC33", // Dunklgrün
    CurrentNodeColor : "#C4071B", // Helles Rot
    FinishedNodeColor : "#73B78D", // Wie EdgeHighlight2
    ShortestPathColor : "#73B78D", // Wie EdgeHighlight2
    UnusedEdgeColor : "#0065BD", // Wie NodeBorder
    NormalEdgeColor : "#000000" // Schwarz
                    };

/**
 * Standardgröße eines Knotens
 * @type Number
 */
var global_KnotenRadius = 15;                           // Radius der Knoten
/**
 * Standardaussehen einer Kante.
 * @type Object
 */
var global_Edgelayout = {'arrowAngle' : Math.PI/8,	         // Winkel des Pfeilkopfs relativ zum Pfeilkörper
			             'arrowHeadLength' : 15,             // Länge des Pfeilkopfs
                         'lineColor' : "black",		         // Farbe des Pfeils
			             'lineWidth' : 2,		             // Dicke des Pfeils
                         'font'	: 'Arial',		             // Schrifart 
                         'fontSize' : 14,		             // Schriftgrösse in Pixeln
                         'isHighlighted': false,             // Ob die Kante eine besondere Markierung haben soll
                         'progressArrow': false,             // Zusätzlicher Animationspfeil 
                         'progressArrowPosition': 0.0,       // Position des Animationspfeils
                         'progressArrowSource': null,        // Animationspfeil Source Knoten
                         'progressArrowTarget': null         // Animationspfeil Target Knoten
			};
                        
/**
 * Standardaussehen eines Knotens.
 * @type Object
 */
var global_NodeLayout = {'fillStyle' : const_Colors.NodeFilling,    // Farbe der Füllung
                         'nodeRadius' : 15,                         // Radius der Kreises
                         'borderColor' : const_Colors.NodeBorder,   // Farbe des Rands (ohne Markierung)
                         'borderWidth' : 2,                         // Breite des Rands
                         'fontColor' : 'black',                     // Farbe der Schrift
                         'font' : 'bold',                           // Schriftart
                         'fontSize' : 14                            // Schriftgrösse in Pixeln
                        };

function translate(x,y){
    return "translate("+x+","+y+")";
}

GraphAlgos = d3.map();

GraphDrawer = function(svgOrigin,extraMargin,transTime){

    /////////////////
    //PRIVATE
    var id = svgOrigin.attr("id");
    GraphAlgos.set(id,this);

    var transTime = (transTime!=null) ? transTime : 250;

    var extraMargin = extraMargin || {};

    var xRange = +svgOrigin.attr("width") || 400;
        yRange = +svgOrigin.attr("height") || 300;
    var wS = global_NodeLayout['borderWidth'];
    
    var margin = {
            top: global_KnotenRadius+wS+ (extraMargin.top || 10),
            right: global_KnotenRadius+wS,
            bottom: global_KnotenRadius+wS,
            left: global_KnotenRadius+wS +(extraMargin.left || 0)}

        width = xRange - margin.left - margin.right,
        height = yRange - margin.top - margin.bottom;

    this.height = height;
    this.width = width;

    this.margin = margin;

    var radius = global_KnotenRadius;//20;

    svgOrigin
        .attr({version: '1.1' , xmlns:"http://www.w3.org/2000/svg"})
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    var svg = svgOrigin.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    this.svg=svg;

    var svg_links=svg.append("g").attr("id", "edges");
    var svg_nodes=svg.append("g").attr("id", "nodes");

    this.x = d3.scale.linear()
        .range([margin.left, width-margin.right])
        .domain([0,xRange]);

    this.y = d3.scale.linear()
        .range([height-margin.top, margin.bottom])
        .domain([0,yRange]);

    var transform = function(d){
        return translate(this.x(this.nodeX(d)),this.y(this.nodeY(d)));
    }
    transform = transform.bind(this);

    this.squeeze = function(){
        var nodes;

        if(Graph.instance && (nodes = Graph.instance.getNodes())){
            this.x.domain(d3.extent(nodes, function(d) { return d.x; }));
            this.y.domain(d3.extent(nodes, function(d) { return d.y; }));
        }
    }

    //somehow we get old copies of nodes in d where the state is outdated
    //-> workaround: get the correct node from the Graph instance using its id
    var xfun = function(d){
        return this.x(this.nodeX(Graph.instance.nodes.get(d.id) || d));
    }

    var yfun = function(d){
        return this.y(this.nodeY(Graph.instance.nodes.get(d.id) || d));
    }

    xfun = xfun.bind(this);

    yfun = yfun.bind(this);

    function lineAttribs(d,a,b){
        var attr = { x1:xfun(d.start), y1:yfun(d.start), x2:xfun(d.end), y2:yfun(d.end)};
        if(transTime) d3.select(this).transition().duration(transTime).attr(attr)
        else d3.select(this).attr(attr);
    };

    function textAttribs(d){
        var attr = { x : (xfun(d.start)+xfun(d.end))*0.5 , y : ( yfun(d.start)+yfun(d.end))*.5};
        if(transTime) d3.select(this).transition().duration(transTime).attr(attr)
        else d3.select(this).attr(attr);
    };

    /////////////////
    //PRIVILEDGED


    this.clear = function(){
        svg_nodes.selectAll("g").remove();
        svg_links.selectAll("g").remove();
    };

    this.type="GraphDrawer";
    this.graph = Graph.instance;
    this.svgOrigin = svgOrigin;

    var that = this;

    this.screenPosToNodePos = function(pos){
        return {x: that.x.invert(pos[0]-margin.left), y: that.y.invert(pos[1]-margin.top)};
    };

    this.screenPosToTransform = function(pos){
        return "translate(" + (pos[0]-margin.left) + "," + (pos[1]-margin.top) + ")";
    }

    this.updateNodes = function(){

        // DATA JOIN
        // Join new data with old elements, if any.
          var selection = svg_nodes.selectAll(".node")
            .data(Graph.instance.getNodes(),function(d){return d.id});


        // UPDATE
        // Update old elements as needed.

        // ENTER
        // Create new elements as needed.
          var enterSelection = selection
            .enter().append("g")
            .attr("class","node")
            .call(this.onNodesEntered);//Foo.prototype.setText.bind(bar))

            enterSelection.append("circle")
                .attr("r", radius)
                .style("fill",global_NodeLayout['fillStyle'])
                .style("stroke-width",global_NodeLayout['borderWidth'])
                .style("stroke",global_NodeLayout['borderColor'])

            enterSelection.append("text")
                .attr("class","label unselectable")
                .attr("dy", ".35em")           // set offset y position
                .attr("text-anchor", "middle")

            enterSelection.append("text")
                .attr("class","resource unselectable")
                .attr("dy",-global_KnotenRadius+"px")           // set offset y position
                .attr("text-anchor", "middle")


        // ENTER + UPDATE
        // Appending to the enter selection expands the update selection to include
        // entering elements; so, operations on the update selection after appending to
        // the enter selection will apply to both entering and updating nodes.
            if(transTime){
            selection
                .transition().duration(transTime)
                .attr("transform",transform)
                .call(this.onNodesUpdated);
            }else{
            selection
                .attr("transform",transform)
                .call(this.onNodesUpdated);
            }

            selection.selectAll("text.label")
                 .text(this.nodeLabel);

            selection.selectAll("text.resource")
                .text(this.nodeText);


        // EXIT
        // Remove old elements as needed.
              selection.exit().remove();
    
    } //end updateNodes()



    this.updateEdges = function(){

        var selection = svg_links.selectAll(".edge")
            .data(Graph.instance.getEdges(),function(d){
                return d.id;
             });

    //ENTER

        var enterSelection = selection
            .enter()
            .append("g")
            .attr("class","edge")
            .call(this.onEdgesEntered);
        

        enterSelection.append("line")
            .attr("class","arrow")
            .attr("marker-end", "url(#arrowhead2)")
            .style("stroke","black")
            .style("stroke-width",global_Edgelayout['lineWidth'])

        enterSelection.append("text")
//             .style("text-anchor", "middle")
//             .attr("dominant-baseline","middle")
//             .attr("dy", "-.5em")           // set offset y position
            .attr("class","resource unselectable edgeLabel")
   

    var that = this;


    //ENTER + UPDATE
        var selt = selection;//.transition().duration(1000);
        selt.selectAll("line")
            .each(lineAttribs)
//             .style("opacity",1e-6)
//             .transition()
//             .duration(750)
//             .style("opacity",1);
            
        selt.selectAll("text.resource")
            .text(this.edgeText)
            .style("text-anchor", function(d){
                var arrowXProj = d.start.x-d.end.x;
                return (arrowXProj>0) ? "start" : "end";
            })
            .attr("dominant-baseline",function(d){
                var arrowYProj = d.start.y-d.end.y;
                return (arrowYProj>0) ? "text-before-edge" : "text-after-edge";
            })
            .each(textAttribs)


        selection.call(this.onEdgesUpdated)

    //EXIT
        var exitSelection = selection.exit()
        exitSelection.remove();

    }


    //initialize //TODO: is called twice when we init both tabs at the same time
    if(Graph.instance==null){
        //calls registered event listeners when loaded;
        var GRAPH_FILENAME = GRAPH_FILENAME || null;
        var filename = GRAPH_FILENAME || "graphs-new/"+$("#tg_select_GraphSelector").val()+".txt"; //the selected option 
       Graph.loadInstance(filename,function(error,text,filename){
           console.log("error loading graph instance "+error + " from " + filename +" text: "+text);
       }); 
    }

} //end constructor GraphDrawer


GraphDrawer.prototype.update= function(){
  this.updateNodes();
  this.updateEdges();
}

GraphDrawer.prototype.getType= function(){
    console.log(this.type);
}

GraphDrawer.prototype.onNodesEntered = function(selection) {
//     console.log(selection[0].length + " nodes entered")
}

GraphDrawer.prototype.onNodesUpdated = function(selection) {
//     console.log(selection[0].length + " nodes updated")
}

GraphDrawer.prototype.onEdgesEntered = function(selection) {
//     console.log(selection[0].length + " edges entered")
}

GraphDrawer.prototype.onEdgesUpdated = function(selection) {
//     console.log(selection[0].length + " edges entered")
}

GraphDrawer.prototype.edgeText = function(d){
    return d.toString();
}

GraphDrawer.prototype.nodeText = function(d){
    return d.toString();   
}

GraphDrawer.prototype.nodeLabel = function(d){
    return d.id;
}

GraphDrawer.prototype.nodeX = function(d){
    if(!d){
        console.log(d);
    }
    return d.x;
};

GraphDrawer.prototype.nodeY = function(d){
    return d.y;
};

GraphDrawer.prototype.nodePos = function(d){
    var obj = {};
    obj.x = this.x(this.nodeX(d));
    obj.y = this.y(this.nodeY(d));
    return obj;
}