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
                    GreenText:              "#007C30"   // Dunkelgrün 100 % aus TUM Styleguide
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



var GraphDrawer = function(graph,svgOrigin){

    /////////////////
    //PRIVATE

    var xRange = 400,
        yRange = 300;

    var margin = {top: 20, right: 20, bottom: 20, left: 30},
        width = xRange - margin.left - margin.right,
        height = yRange - margin.top - margin.bottom;

    var radius = global_KnotenRadius;//20;

    svgOrigin
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    // d3.select("body").selectAll("svg")
    svgOrigin
        .append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("refX",12) /*must be smarter way to calculate shift*/
        .attr("refY",2)
        .attr("markerWidth", 12)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead

    var svg = svgOrigin.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var svg_links=svg.append("g").attr("id", "edges");
    var svg_nodes=svg.append("g").attr("id", "nodes");

    var x = d3.scale.linear()
        .range([margin.left, width-margin.right]);

    var y = d3.scale.linear()
        .range([height-margin.top, margin.bottom]);

        x.domain(d3.extent(graph.getNodes(), function(d) { return d.x; }));  //[0,xRange]);
     // x.domain([0,Math.max(width,d3.max(nodes, function(d){return d.x;}))]);
     // y1.domain([0,Math.max(height,d3.max(nodes, function(d){return d.y;}))]);
    //   y.domain([0,2*nodes.length]);
        y.domain(d3.extent(graph.getNodes(), function(d) { return d.y; }));//.nice();

    var transform = function(d){
      return "translate(" + x(d.x) + "," + y(d.y) + ")"
    ;};

    var nodePos = function(d){
        return {x:x(d.x), y:y(d.y)};
    };

    function lineAttribs(d){
     d3.select(this)
      .attr({ x1:nodePos(d.start).x, y1:nodePos(d.start).y, x2:nodePos(d.end).x, y2:nodePos(d.end).y });
    };

    function textAttribs(d){
        d3.select(this)
          .attr({ x:(nodePos(d.start).x+nodePos(d.end).x)*0.5, y:(nodePos(d.start).y+nodePos(d.end).y)*.5});
    };
     
    var textfun = function(d) { return "[" + d.resources.join(",") + "]"};
    var textfunNode = function(d) { return "(" + d.resources.join(",") + ")"};


    /////////////////
    //PRIVILEDGED

    this.type="GraphDrawer";
    this.graph = graph;
    this.svgOrigin = svgOrigin;

    this.screenPosToNodePos = function(pos){
        return {x: x.invert(pos[0]-margin.left), y: y.invert(pos[1]-margin.top)};
    };

    this.screenPosToTransform = function(pos){
        return "translate(" + (pos[0]-margin.left) + "," + (pos[1]-margin.top) + ")";
    }

    this.updateNodes = function(){

        // DATA JOIN
        // Join new data with old elements, if any.
          var selection = svg_nodes.selectAll(".node")
            .data(graph.getNodes(),function(d){return d.id});


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
                .text(function(d){return d.id})
                .attr("class","unselectable")
                .attr("dy", ".35em")           // set offset y position
                .attr("text-anchor", "middle")

            enterSelection.append("text")
                .attr("class","resource")
                .attr("dy",-global_KnotenRadius+"px")           // set offset y position
                .attr("text-anchor", "middle")


        // ENTER + UPDATE
        // Appending to the enter selection expands the update selection to include
        // entering elements; so, operations on the update selection after appending to
        // the enter selection will apply to both entering and updating nodes.
            selection
//                 .transition()
                .attr("transform",transform)
                .call(this.onNodesUpdated);

            selection.selectAll("text.resource").text(textfunNode);


        // EXIT
        // Remove old elements as needed.
              selection.exit().remove();
    
    } //end updateNodes()



    this.updateEdges = function(){

        var selection = svg_links.selectAll(".edge")
            .data(graph.getEdges(),function(d){
                return d.id;
             });

//                     console.log("update",selection);


    //ENTER

        var enterSelection = selection
            .enter()
            .append("g")
            .attr("class","edge")
            .call(this.onEdgesEntered);

//         console.log("enter1",enterSelection1);
//         console.log("enter",enterSelection);
        

        enterSelection.append("line")
            .attr("marker-end", "url(#arrowhead)")
            .style("stroke","black")
            .style("stroke-width",global_Edgelayout['lineWidth'])

        enterSelection.append("text")
            .attr("class","unselectable");


    //ENTER + UPDATE
        selection.selectAll("line")
            .each(lineAttribs)
//             .style("opacity",1e-6)
//             .transition()
//             .duration(750)
//             .style("opacity",1);
            

        selection.selectAll("text")
            .attr("class","resource")
            .each(textAttribs)
            .text(textfun)
            .attr("vertical-align","middle");

        selection.call(this.onEdgesUpdated)

    //EXIT
        var exitSelection = selection.exit()
//         console.log("exit",exitSelection);
        exitSelection.remove();

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


