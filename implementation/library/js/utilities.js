/**
 * @author Richard Stotz
 * Hier wird die Klasse Utilities definiert, die verschiedene 
 * statische Hilfsfunktionen beinhaltet.
 */

/**
 * Klasse mit diversen Hilfunktionen
 * @class 
 */
function Utilities() {};

/**
 * Gibt alle Schlüssel eines assoziativen Arrays zurück
 * @param {Object} obj Assoziatives Array
 * @returns {Array} Die Schlüssel des assoziativen Arrays
 */
Utilities.arrayOfKeys = function(obj) {
    var keys = new Array();
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
};

/**
 * Hilfsfunktion: Ermittelt die Größe eines assoziativen Arrays
 * @param {Object} obj Assoziatives Array
 * @returns {Number} Anzahl der Elemente im Array
 */
Utilities.objectSize = function(obj) {
    var size = 0;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            size++;
        }
    }
    return size;
};
    
/**
 * Wendet die Cantorsche Paarungsfuntion auf zwei Zahlen an.
 * @param {Number} x Erste Zahl
 * @param {Number} y Zweite Zahl
 * @returns {Number} Cantorpaar der zwei Zahlen
 */
Utilities.cantorPaar = function(x,y) {
    return Math.round(y + (x+y)*(x+y+1)/2);
};

/**
 * Umkehrfunktion der Cantorschen Paarungsfunktion
 * @param {Number} z Cantorpaar
 * @returns {Number[]} Die beiden Zahlen, aus denen das Paar bestand
 */
Utilities.getCantorPaar = function(z) {
    var q = Math.floor((Math.sqrt(8*z+1)-1)/2);
    var p2 = z-q*(q+1)/2;
    return [q-p2,p2];
};