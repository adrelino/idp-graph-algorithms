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
    this.init = function() {
        legendeMax = this.tab.find(".Legende");
        legendeMin = this.tab.find(".LegendeMinimized");
        legendeMaxButton = legendeMax.find(".LegendeMin");
        legendeMinButton = legendeMin.find(".LegendeMin");
        tabIntroDialog = this.tab.find(".tabIntroDialog");
        tabChangeWarningDialog = this.tab.find(".tabChangeWarningDialog");
        statusWindow = this.tab.find(".statusWindow");
        this.statusBackup = statusWindow.html();
        this.animateLegende();
//         this.svgOrigin.attr('user-select','none').attr('unselectable','on').on("selectstart.CanvasDrawer",false);
//         this.drawIntervalID = setInterval(function() { algo.drawCanvas(); }, 20);
//         this.needRedraw = true;
        this.openDialogs();
//         this.addRefreshToTabbar();

        //         this.registerEventHandlers();
//         this.needRedraw = true;
        this.minimizeLegend();
        algo.init && algo.init();
        this.initialized=true;
    };
    
    /**
     * when tab is openend
     * @method
     */
    this.activate = function() {
        if(!this.initialized) this.init();
        algo.activate && algo.activate();
    };
    
    /**
     * when tab is closed
     * @method
     */
    this.deactivate = function() {
        algo.deactivate && algo.deactivate();
    };

    /**
     * HTML des Tabs vor dem Öffnen des Tabs
     * @type String
     */
    this.statusBackup = null;
    /**
     * Zeigt an, ob der Tab z.Zt. aktiv ist (ungenutzt)
     * @type Boolean
     */
    this.active = false;
    
    /**
     * jQuery Objekt der maximierten Legende
     * @type Object
     */
    var legendeMax;
    /**
     * jQuery Objekt der minimierten Legende
     * @type Object
     */
    var legendeMin;
    /**
     * jQuery Objekt des "Maximieren" Buttons de Legende im aktuellen Tab
     * @type Object
     */
    var legendeMaxButton;
    /**
     * jQuery Objekt des "Minimieren" Buttons de Legende im aktuellen Tab
     * @type Object
     */
    var legendeMinButton;
    /**
     * jQuery Objekt des Dialogs, der zu Beginn des Tabs gezeigt wird.
     * @type Object
     */
    var tabIntroDialog;
    /**
     * jQuery Objekt des Dialogs, der zu Beginn des Tabs gezeigt wird.
     * @type Object
     */
    var tabChangeWarningDialog;
    /**
     * jQuery Objekt des statusFensters des Tabs
     * @type Object
     */
    var statusWindow;
    
    
    /**
     * Entfernt Intervalle und Event Handler für die den Canvas Drawer
     * @method
     */
//     this.destroyCanvasDrawer = function() {
//         legendeMaxButton.off("click.CanvasDrawer");
//         legendeMinButton.off("click.CanvasDrawer");
// //         this.svgOrigin.selectAll("*").remove();
// //         this.canvas.off("selectstart.CanvasDrawer");
// //         window.clearInterval(this.drawIntervalID);
//         tabIntroDialog.dialog("destroy");
// //         if($("body").data("graph")) {
// // //             $("body").data("graph").restoreLayout();
// //         }
//         this.tab.find(".statusWindow").html(this.statusBackup);
//         this.removeRefreshFromTabbar();
//     };

    /**
     * Minimiert die Legende und positioniert sie korrekt.
     * @method
     */
    this.minimizeLegend = function() {
        legendeMax.hide();
        legendeMin.show();
    };

    /**
     * Maximiert die Legende und positioniert sie korrekt.
     * @method
     */
    this.maximizeLegend = function() {
        legendeMax.show();
        legendeMin.hide();
    };
    
    /**
     * Öffnet die Dialoge, die zu dem Tab gehören: Eingangsdialog und mglw. 
     * Abfrage, ob man den Tab wirklich verlassen möchte.
     * @method
     */
    this.openDialogs = function() {
        var currentTab = this.tab;      // Closure
        var minW = 150;
        if(this.tab.attr("id") == "tab_tf2") {
            minW = 570;
        }
        $(function() {
            tabIntroDialog.dialog({
                dialogClass: "shadow",
                resizable: false,
                draggable: false,
                minWidth: minW,
                position: { my: "center center", at: "center center", of: currentTab},
                modal: false,
                autoOpen: false,
                beforeClose: function(event, ui) {
                    tabIntroDialog.effect('transfer', {
                        to: statusWindow
                    }, 500, null);
                    return true;
                },
                buttons: {
                    Ok: function() {$(this).dialog( "close" );}
                }
            });
        });

        if(!tabIntroDialog.data("wasOpen")) {
            tabIntroDialog.dialog("open");
            tabIntroDialog.data("wasOpen",true);
        }
        // Tabwechsel Warndialog
        if(tabChangeWarningDialog) {
            $(function() {
                tabChangeWarningDialog.dialog({
                    autoOpen: false,
                    resizable: false,
                    modal: true,
                    buttons: {
                        "In diesem Tab bleiben": function() {
                            $("#tabs").removeData("requestedTab");
                            $("#tabs").removeData("tabChangeDialogOpen");
                            $(this).dialog( "close" );
                        },
                        "Tab wechseln": function() {
                            $(this).dialog( "close" );
                            var newTabID =$("#tabs").data("requestedTab");
                            $("#tabs").removeData("requestedTab");
                            $("#tabs").tabs("option", "active", newTabID);
                            $("#tabs").removeData("tabChangeDialogOpen");
                        }   
                    }
                });
            });
        }
    };
    
    /**
     * Animiert die Legende: Buttons zum maximieren / minimieren, Icons in den
     * Buttons, Tooltipp für Vorgängerkante
     * @method
     */
    this.animateLegende = function() {
        legendeMaxButton.button({icons: {primary: "ui-icon-minus"},text: false});
        legendeMinButton.button({icons: {primary: "ui-icon-plus"},text: false});
        this.maximizeLegend();
        legendeMaxButton.on("click.CanvasDrawer",this.minimizeLegend);
        legendeMinButton.on("click.CanvasDrawer",this.maximizeLegend);
        $("tr.LegendeZeileClickable").tooltip();
    };
    
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