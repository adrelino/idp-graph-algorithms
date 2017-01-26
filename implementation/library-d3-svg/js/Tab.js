/**
 * A Tab in the view. Wires together the legend and calls algo's activation functions.
 * @author Adrian Haarbach
 * @class
 * @param {GraphDrawer} algo - Instance of an algorithm. Must have interface methods : init, activate, deactivate
 * @param {Object} p_tab - Jquery tab elector
 */
function Tab(algo,p_tab) {

    var that = this;
    this.algo=algo;

    /**
     * jQuery Objekt des aktuellen Tabs
     * @type Object
     */
    this.tab = p_tab;

    this.initialized = false;
    
    /**
     * Initialisiert das Zeichenfeld
     * @method
     */
    this._init = function() {
        algo.init && algo.init();
        this.initialized=true;
    };
    
    /**
     * when tab is openend
     * @method
     */
    this._activate = function() {
        if(!this.initialized) this.init();
        algo.activate && algo.activate();
    };
    
    /**
     * when tab is closed
     * @method
     */
    this._deactivate = function() {
        algo.deactivate && algo.deactivate();
    };

    /**
     * Zeigt an, ob der Tab z.Zt. aktiv ist (ungenutzt)
     * @type Boolean
     */
    this.active = false;
    
//     /**
//      * Fügt ein "Neu laden" Icon zum Tab hinzu, aktiviert es
//      * @method
//      */
//     this.addRefreshToTabbar = function() {
//         $("#tabs").find(".ui-tabs-active").append('<span class="ui-icon ui-icon-refresh" style="display:inline-block">Klicke auf den Titel des Tabs, um ihn zurückzusetzen.</span>');
//         $("#tabs").find(".ui-tabs-active").attr("title","Klicke auf den Titel des Tabs, um ihn zurückzusetzen.").tooltip();
//         $("#tabs").tabs("refresh");
//         $("#tabs").find(".ui-tabs-active").find("span").on("click.Refresh",function(e) {
//             e.stopPropagation();
//             algo.refresh();
//         });
//     };
    
//     /**
//      * Entfernt das neu laden Icon und die Funktionalität
//      * @method
//      */
//     this.removeRefreshFromTabbar = function() {
//         $("#tabs").find(".ui-tabs-active").tooltip().tooltip("destroy");
//         $("#tabs").find(".ui-tabs-active").find("span").off(".Refresh");
//         $("#tabs").find(".ui-icon-refresh").remove();
//         $("#tabs").tabs("refresh");
//     };
}

Tab.prototype.init = function(){
    this._init();
}

Tab.prototype.activate = function(){
    this._activate();
}

Tab.prototype.deactivate = function(){
    this._deactivate();
}