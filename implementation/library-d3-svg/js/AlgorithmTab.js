/**
 * Tab for an algorithm
 * initializes the buttons, callbacks, the logger and fast forward funcitonality
 * @author Adrian Haarbach
 * @augments AlgorithmTab
 * @class
 */
function AlgorithmTab(algo,p_tab) {
    Tab.call(this, algo, p_tab);

    /**
     * ID of the fast forward interval
     * @type Number
     */
    algo.fastForwardIntervalID = null;

    var that = this;

    /**
     * Timeout speed in milliseconds for fast forward
     * @type Number
     */
    var fastForwardSpeed = 500;

    /**
     * the logger instance
     * @type Logger
     */
    var logger = new Logger(d3.select("#logger"));


    var fastforwardOptions = {label: $("#ta_button_text_fastforward").text(), icons: {primary: "ui-icon-seek-next"}};
    var rewindOptions = {label: $("#ta_button_text_rewind").text(), icons: {primary: "ui-icon-seek-prev"}};

    /**
     * Initialisiert das Zeichenfeld
     * @method
     */
    this.init = function() {

        var pauseOptions = {label: $("#ta_button_text_pause").text(), icons: {primary: "ui-icon-pause"}};

//         if(algo.rewindStart && algo.rewindStop){
//             $("#ta_button_rewind")
//             .button(rewindOptions)
//             .click(function() {
//                 $(this).button("option",this.checked ? pauseOptions : rewindOptions);
//                 this.checked ? algo.rewindStart() : algo.rewindStop();
//             })
//         }else{
             $("#ta_button_rewind").hide();
             $("#ta_button_text_rewind").hide();
//         }

//        $("#ta_button_rewind")
//             .button(rewindOptions)
//             .click(function() {
//                 $(this).button("option",this.checked ? pauseOptions : rewindOptions);
//                 this.checked ? that.rewindStart() : that.rewindStop();
//             });
        
        $("#ta_button_Zurueck")
            .button({icons: {primary: "ui-icon-seek-start"}})
            .click(function() {
                algo.previousStepChoice();
            });
        
        $("#ta_button_1Schritt")
            .button({icons: {primary: "ui-icon-seek-end"}})
            .click(function() {
                algo.nextStepChoice();
            });

        $("#ta_button_vorspulen")
            .button(fastforwardOptions)
            .click(function() {
                $(this).button("option",this.checked ? pauseOptions : fastforwardOptions);
                this.checked ? that.fastForwardAlgorithm() : that.stopFastForward();
            });

//         $("#ta_vorspulen_speed").on("input",function(){
//             fastForwardSpeed=+this.value;  
//         });



        $("#ta_div_statusTabs").tabs();
        $("#ta_div_statusTabs").tabs("option", "active", 2);

        $("#ta_tr_LegendeClickable").removeClass("greyedOutBackground");
        
        var pseudocode = d3.select("#ta_div_statusPseudocode")
        var sel = pseudocode.selectAll("div").selectAll("p")
        sel.attr("class", function(a, pInDivCounter, divCounter) {
            return "pseudocode";
        });

        d3.select("#tw_div_statusPseudocode").html(pseudocode.html())

        Tab.prototype.init.call(this);

    };

    /**
     * "Spult vor", führt den Algorithmus mit hoher Geschwindigkeit aus.
     * @method
     */
    algo.fastForwardAlgorithm = function() {
        $("#ta_button_1Schritt").button("option", "disabled", true);
        $("#ta_button_Zurueck").button("option", "disabled", true);
//         $("#ta_button_rewind").button("option", "disabled", true);
//         var geschwindigkeit = 5; // Geschwindigkeit, mit der der Algorithmus ausgeführt wird in Millisekunden
        
        algo.nextStepChoice();
        algo.fastForwardIntervalID = window.setInterval(function() {
            algo.nextStepChoice();
        }, fastForwardSpeed);

        //algo.update();
    };

    /**
     * Stoppt das automatische Abspielen des Algorithmus
     * @method
     */
    algo.stopFastForward = function() {
        $("#ta_button_1Schritt").button("option", "disabled", false);
        $("#ta_button_Zurueck").button("option", "disabled", false);
//         $("#ta_button_rewind").button("option", "disabled", false);
        window.clearInterval(algo.fastForwardIntervalID);
        algo.fastForwardIntervalID = null;
        d3.select("#ta_button_vorspulen").property("checked",false);
        $("#ta_button_vorspulen").button("option",fastforwardOptions);
        //algo.update();
    };
    
    
    algo.setDisabledBackward = function(disabled) {
        $("#ta_button_Zurueck").button("option", "disabled", disabled);
    };
    
    algo.setDisabledForward = function(disabled, disabledSpulen) {
        var disabledSpulen = (disabledSpulen!==undefined) ? disabledSpulen : disabled;
        $("#ta_button_1Schritt").button("option", "disabled", disabled);
        $("#ta_button_vorspulen").button("option", "disabled", disabledSpulen);
    };
}

// Vererbung realisieren
AlgorithmTab.prototype = Object.create(Tab.prototype);
AlgorithmTab.prototype.constructor = AlgorithmTab;
