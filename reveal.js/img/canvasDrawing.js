/**
 * @author Mark J. Becker
 * Funktionen in dieser Datei werden dazu genutzt,
 * Formen auf das Canvas zu zeichnen
 */

/**
 * Klasse mit Funktionen, um den Graph auf das Canvas zu zeichnen.
 * Die Funktionen in dieser Klasse sind allesamt statisch
 * @class 
 */
function CanvasDrawMethods() {};

/**
 * Zeichne Pfeil an Kante
 * @param  {Object} ctx             2dContext des Canvas
 * @param  {Object} layout          Layout der Kante
 * @param  {Object} source          Koordinaten des Ausgangspunkts
 * @param  {Object} target          Koordinaten des Zielpunkts
 * @param  {String} label           Text
 * @param  {String} additionalLabel Zusätzlicher Text
 */
CanvasDrawMethods.drawArrowAtPosition = function(ctx,layout,source,target,label,additionalLabel) {
    if(!layout.progressArrow) {
        return;
    }
    var arrowHeadColor = const_Colors.EdgeHighlight2;
    // Pfeilkopf zeichnen
    ctx.beginPath();
    ctx.strokeStyle = arrowHeadColor;
    ctx.lineWidth = 4.0;
    var position = layout.progressArrowPosition || 0.0;
    var center = {x: (source.x + (target.x - source.x) * position), y: (source.y + (target.y - source.y) * position)};
    var edgeAngle = Math.atan2(target.y-source.y,target.x-source.x);
    var arrowStart = {x:center.x+ Math.cos(edgeAngle)* layout.arrowHeadLength/2,y:center.y+ Math.sin(edgeAngle) * layout.arrowHeadLength/2};
    var lineAngle1 = Math.atan2(target.y-source.y,target.x-source.x)
            + layout.arrowAngle + Math.PI;  // Winkel des rechten Pfeilkopfs relativ zum Nullpunkt
    var lineAngle2 = Math.atan2(target.y-source.y,target.x-source.x)
            - layout.arrowAngle + Math.PI;  // Winkel des linken Pfeilkopfs relativ zum Nullpunkt
    ctx.moveTo(arrowStart.x, arrowStart.y);
    ctx.lineTo(arrowStart.x + Math.cos(lineAngle1) * layout.arrowHeadLength, arrowStart.y + Math.sin(lineAngle1) * layout.arrowHeadLength);
    ctx.stroke();
    ctx.moveTo(arrowStart.x, arrowStart.y);
    ctx.lineTo(arrowStart.x + Math.cos(lineAngle2) * layout.arrowHeadLength, arrowStart.y + Math.sin(lineAngle2) * layout.arrowHeadLength);
    ctx.stroke();
}

/**
 * Zeichnet einen Pfeil, wobei die Pfeilspitze in der Mitte ist.<br>
 * Falls der Pfeil als "Highlighted" gekennzeichnet ist wird, so wird ein kleinerer
 * Pfeil auf den großen Pfeil in anderer Farbe gezeichnet.
 * @param {Object} ctx              2dContext des Canvas
 * @param {Object} layout           Layout des Pfeils
 * @param {Object} source           Koordinaten des Ausgangspunkts
 * @param {Object} target           Koordinaten des Zielpunkts
 * @param {String} label            Text auf dem Pfeil
 * @param {String} additionalLabel  Zusatztext zu dem Pfeil
 */
CanvasDrawMethods.drawArrow = function(ctx,layout,source,target,label,additionalLabel) {
    // Linie zeichnen
    CanvasDrawMethods.drawLine(ctx,layout,source,target);
    var arrowHeadColor = layout.lineColor;

    if(layout.isHighlighted) {
        arrowHeadColor = const_Colors.EdgeHighlight3;
    }

    // Pfeilkopf zeichnen
    ctx.beginPath();
    ctx.strokeStyle = arrowHeadColor;
    //var position = 0.0;
    var center = {x: (target.x+source.x)/2, y:(target.y+source.y)/2};
    //var center = {x: (source.x + (target.x - source.x) * position), y: (source.y + (target.y - source.y) * position)};
    var edgeAngle = Math.atan2(target.y-source.y,target.x-source.x);
    var arrowStart = {x:center.x+ Math.cos(edgeAngle)* layout.arrowHeadLength/2,y:center.y+ Math.sin(edgeAngle)* layout.arrowHeadLength/2};
    var lineAngle1 = Math.atan2(target.y-source.y,target.x-source.x)
            + layout.arrowAngle + Math.PI;	// Winkel des rechten Pfeilkopfs relativ zum Nullpunkt
    var lineAngle2 = Math.atan2(target.y-source.y,target.x-source.x)
            - layout.arrowAngle + Math.PI;	// Winkel des linken Pfeilkopfs relativ zum Nullpunkt
    ctx.moveTo(arrowStart.x, arrowStart.y);
    ctx.lineTo(arrowStart.x + Math.cos(lineAngle1) * layout.arrowHeadLength,arrowStart.y + Math.sin(lineAngle1) * layout.arrowHeadLength);
    ctx.stroke();
    ctx.moveTo(arrowStart.x, arrowStart.y);
    ctx.lineTo(arrowStart.x + Math.cos(lineAngle2) * layout.arrowHeadLength,arrowStart.y + Math.sin(lineAngle2) * layout.arrowHeadLength);
    ctx.stroke();
    if(layout.isHighlighted) {
        var thirtyPercent = {x: 0.3*target.x + 0.7*source.x,
                             y: 0.3*target.y + 0.7*source.y};
        CanvasDrawMethods.drawLine(ctx,{lineColor:arrowHeadColor, lineWidth:layout.lineWidth},thirtyPercent,arrowStart);
    }
    if(label) {
        CanvasDrawMethods.drawTextOnLine(ctx,layout,source,target,label);
    }
    if(additionalLabel) {
        CanvasDrawMethods.drawAdditionalTextOnLine(ctx,layout,source,target,additionalLabel);
    }
};

/**
 * Zeichnet einen Linie in 2D
 * @param {Object} ctx           2dContext des Canvas
 * @param {Object} layout        Layout der Linie
 * @param {Object} source        Koordinaten des Ausgangspunkts
 * @param {Object} target        Koordinaten des Zielpunkts
 */
CanvasDrawMethods.drawLine = function(ctx,layout,source,target) {
    // Linie zeichnen
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x,target.y);
    ctx.strokeStyle = layout.lineColor;
    ctx.lineWidth = layout.lineWidth;
    ctx.stroke();
};

/**
 * Zeichnet einen Text auf eine Linie.
 * Der Text wird ensprechend gedreht.
 * @param {Object} ctx           2dContext des Canvas
 * @param {Object} layout        Layout des Pfeils
 * @param {Object} source        Koordinaten des Ausgangspunkts
 * @param {Object} target        Koordinaten des Zielpunkts
 * @param {String} label         Text
 */
CanvasDrawMethods.drawTextOnLine = function(ctx,layout,source,target,label) {
    ctx.save();								// Aktuellen Zustand speichern (vor den Transformationen)
    ctx.font = layout.fontSize.toString() +"px " +layout.font;
    var arrowHeight = Math.sin(layout.arrowAngle)*layout.arrowHeadLength;
    var arrowWidth = Math.cos(layout.arrowAngle)*layout.arrowHeadLength;
    var labelMeasure = ctx.measureText(label);
    var alpha = Math.atan2(target.y-source.y,target.x-source.x);
    var center = {x: (target.x+source.x)/2, y:(target.y+source.y)/2};
    ctx.translate(center.x, center.y);
    ctx.rotate(alpha);
    if(Math.abs(alpha)>Math.PI/2) {					// Verhindere, dass Text auf dem Kopf angezeigt wird.
        ctx.translate(0, layout.fontSize/2);				// Gehe in die Mitte des Texts 
        ctx.rotate(Math.PI);				// Rotiere um 180 Grad
        ctx.fillText(label, -arrowWidth/2, layout.fontSize+3+layout.lineWidth +arrowHeight);		// Schreibe Text an Position 
    }
    else {
        ctx.fillText(label, -labelMeasure.width/2, -3-arrowHeight);									// Verschriebung um 3, um nicht zu nah am Pfeil zu sein.
    }
    ctx.restore();							// Ursprünglichen Zustand wiederherstellen.
};

/**
 * Zeichnet einen Zusatztext auf eine Linie.<br>
 * Der Text wird ensprechend gedreht und umkreist.
 * @param {Object} ctx           2dContext des Canvas
 * @param {Object} layout        Layout des Pfeils
 * @param {Object} source        Koordinaten des Ausgangspunkts
 * @param {Object} target        Koordinaten des Zielpunkts
 * @param {String} label         Text
 */
CanvasDrawMethods.drawAdditionalTextOnLine = function(ctx,layout,source,target,label) {
    ctx.save();								// Aktuellen Zustand speichern (vor den Transformationen)
    ctx.font = layout.fontSize.toString() +"px " +layout.font;
    ctx.fillStyle = layout.lineColor;
    ctx.strokeStyle = layout.lineColor;
    var arrowHeight = Math.sin(layout.arrowAngle)*layout.arrowHeadLength;
    var arrowWidth = Math.cos(layout.arrowAngle)*layout.arrowHeadLength;
    var labelMeasure = ctx.measureText(label);
    var alpha = Math.atan2(target.y-source.y,target.x-source.x);
    var viertel = {x: 0.25*target.x+0.75*source.x, y:0.25*target.y+0.75*source.y};
    ctx.translate(viertel.x, viertel.y);
    ctx.rotate(alpha);
    if(Math.abs(alpha)>Math.PI/2) {			// Verhindere, dass Text auf dem Kopf angezeigt wird.
        ctx.translate(0, layout.fontSize/2);		// Gehe in die Mitte des Texts 
        ctx.rotate(Math.PI);				// Rotiere um 180 Grad
        ctx.fillText(label, -labelMeasure.width/2, layout.fontSize+3+layout.lineWidth +arrowHeight);		// Schreibe Text an Position 
        ctx.beginPath();
        ctx.arc(0,layout.fontSize/2+6+layout.lineWidth +arrowHeight, 0.8*layout.fontSize, 0, Math.PI*2, true); 
    }
    else {
        ctx.fillText(label, -labelMeasure.width/2, -layout.fontSize+12-layout.lineWidth -arrowHeight);		// Schreibe Text an Position 
        ctx.beginPath();
        ctx.arc(0,-layout.fontSize/2-layout.lineWidth -arrowHeight, 0.8*layout.fontSize, 0, Math.PI*2, true); 
    }
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();							// Ursprünglichen Zustand wiederherstellen.
};

/**
 * Zeichnet eine gefüllten Kreis an gegebener Position.
 * In den Kreis kann ein Text geschrieben werden.
 * @param {Object} ctx           2dContext des Canvas.
 * @param {Object} position      Ort, an dem der Knoten erstellt werden soll.
 * @param {Object} layout        Aussehen des Knotens.
 * @param {String} label         Beschriftung des Knotens.
 */

CanvasDrawMethods.drawDisk = function(ctx,position,layout,label) {
    ctx.beginPath();
    // Zeichne Füllung
    ctx.fillStyle =  layout.fillStyle;
    ctx.arc(position.x, position.y, layout.nodeRadius, 0, Math.PI*2, true); 
    ctx.fill();
    // Zeichne Rand
    ctx.lineWidth = layout.borderWidth;
    ctx.strokeStyle = layout.borderColor; 
    ctx.stroke();
    // Zeichne NodeID in den Knoten
    ctx.fillStyle = layout.fontColor; 
    ctx.font = layout.font + " " +layout.fontSize.toString() + "px sans-serif"; 
    // Text sollte maximal so breit sein, dass er in den Knoten passt.
    var labelMeasure = Math.min(ctx.measureText(label).width,layout.nodeRadius*1.7);
    ctx.fillText(label, position.x-labelMeasure/2, position.y+layout.nodeRadius-layout.borderWidth-layout.fontSize/2,layout.nodeRadius*1.7);
};