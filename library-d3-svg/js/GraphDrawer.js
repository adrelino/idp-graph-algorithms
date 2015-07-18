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



var GraphDrawer = function(svgOrigin,additionalMarginTop){

    /////////////////
    //PRIVATE

    var additionalMarginTop = additionalMarginTop || 0;

    var xRange = +svgOrigin.attr("width") || 400;
        yRange = +svgOrigin.attr("height") || 300;
    var wS = global_NodeLayout['borderWidth'];
    var margin = {top: global_KnotenRadius+wS+additionalMarginTop, right: global_KnotenRadius+wS, bottom: global_KnotenRadius+wS, left: global_KnotenRadius+wS},
        width = xRange - margin.left - margin.right,
        height = yRange - margin.top - margin.bottom;

    this.margin = margin;

    var radius = global_KnotenRadius;//20;

    svgOrigin
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

//     //d3.select("body").selectAll("svg")
    svgOrigin
        .append("defs").append("marker")
        .attr("id", "arrowhead2")
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

        x.domain([0,xRange]);//d3.extent(graph.getNodes(), function(d) { return d.x; }));  //[0,xRange]);
     // x.domain([0,Math.max(width,d3.max(nodes, function(d){return d.x;}))]);
     // y1.domain([0,Math.max(height,d3.max(nodes, function(d){return d.y;}))]);
    //   y.domain([0,2*nodes.length]);
        y.domain([0,yRange]);//d3.extent(graph.getNodes(), function(d) { return d.y; }));//.nice();

    var transform = function(d){
      return "translate(" + x(d.x) + "," + y(d.y) + ")"
    ;};

    var nodePos = function(d){
        return {x:x(d.x), y:y(d.y)};
    };

    this.nodePos = nodePos;

    function lineAttribs(d){
     d3.select(this)
      .attr({ x1:nodePos(d.start).x, y1:nodePos(d.start).y, x2:nodePos(d.end).x, y2:nodePos(d.end).y });
    };

    function textAttribs(d){
        d3.select(this)
          .attr({ x:(nodePos(d.start).x+nodePos(d.end).x)*0.5, y:(nodePos(d.start).y+nodePos(d.end).y)*.5});
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
        return {x: x.invert(pos[0]-margin.left), y: y.invert(pos[1]-margin.top)};
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
            selection
//                 .transition()
                .attr("transform",transform)
                .call(this.onNodesUpdated.bind(this));

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
            .style("stroke","black")
            .style("stroke-width",global_Edgelayout['lineWidth'])

        enterSelection.append("text")
//             .style("text-anchor", "middle")
//             .attr("dominant-baseline","middle")
//             .attr("dy", "-.5em")           // set offset y position
            .attr("class","resource unselectable edgeLabel")


    //ENTER + UPDATE
        selection.selectAll("line")
            .attr("marker-end", "url(#arrowhead2)")
            .each(lineAttribs)
//             .style("opacity",1e-6)
//             .transition()
//             .duration(750)
//             .style("opacity",1);
            
        selection.selectAll("text.resource")
            .each(textAttribs)
            .text(this.edgeText)
            .style("text-anchor", function(d){
                var arrowXProj = d.start.x-d.end.x;
                return (arrowXProj>0) ? "start" : "end";
            })
            .attr("dominant-baseline",function(d){
                var arrowYProj = d.start.y-d.end.y;
                return (arrowYProj>0) ? "text-before-edge" : "text-after-edge";
            })

        selection.call(this.onEdgesUpdated)

    //EXIT
        var exitSelection = selection.exit()
        exitSelection.remove();

    }


    //initialize //TODO: is called twice when we init both tabs at the same time
    if(Graph.instance==null){
        //calls registered event listeners when loaded;
       Graph.loadInstance("graphs-new/graph1.txt",function(error,text,filename){
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