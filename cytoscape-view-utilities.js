(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function (cytoscape, cy, options, ur) {

    cy
        .style()
        .selector("node.hidden")
        .css(options.node.hidden)
        .selector("edge.hidden")
        .css(options.edge.hidden);

    function elesScratchHidden(eles, val){
        return eles.each(function (i, ele) {
            if (!ele.scratch("_viewUtilities"))
                ele.scratch("_viewUtilities", {});
            ele.scratch("_viewUtilities").hidden = val;
        });
    }

    cytoscape("collection", "hideEles", function () {
        var eles = this.not(".hidden");
        eles = eles.union(eles.connectedEdges());

        elesScratchHidden(eles, true)
            .addClass("hidden")
            .unselect();

        return eles;
    });

    cytoscape("collection", "showEles", function () {
        var eles = this.filter(".hidden");
        eles = eles.union(eles.connectedEdges());
        
        elesScratchHidden(eles, false)
            .removeClass("hidden");

        return eles;
    });

    if (ur) {
        function urShow(eles) {
            return eles.showEles();
        }

        function urHide(eles) {
            return eles.hideEles();
        }

        ur.action("show", urShow, urHide);
        ur.action("hide", urHide, urShow);
    }

};
},{}],2:[function(require,module,exports){
module.exports = function (cytoscape, cy, options, ur) {

    cy
        .style()
        .selector("node.highlighted")
        .css(options.node.highlighted)
        .selector("node.unhighlighted")
        .css(options.node.unhighlighted)
        .selector("edge.highlighted")
        .css(options.edge.highlighted)
        .selector("edge.unhighlighted")
        .css(options.edge.unhighlighted)
        .update();

    function elesScratchHighlighted(eles, val) {
        return eles.each(function (i, ele) {
            if (!ele.scratch("_viewUtilities"))
                ele.scratch("_viewUtilities", {});
            ele.scratch("_viewUtilities").highlighted = val;
        });
    }

    function highlight(eles) {
        elesScratchHighlighted(eles, true)
            .removeClass("unhighlighted")
            .addClass("highlighted");
    }

    function unhighlight(eles) {
        elesScratchHighlighted(eles, false)
            .removeClass("highlighted")
            .addClass("unhighlighted");
    }

    function getWithNeighbors(eles) {
        return eles.add(eles.descendants()).closedNeighborhood();
    }

    cytoscape("collection", "highlight", function () {
        var eles = this; //.filter("[!highlighted]")
        var cy = eles.cy();


        var others = cy.elements().difference(eles.union(eles.ancestors()));

        if (cy.$(".highlighted:visible").length == 0)
            unhighlight(others);

        highlight(eles);

        return this;

    });

    cytoscape("collection", "unhighlight", function () {
        var eles = this;//.filter("[highlighted='true'], [^highlighted]");

        unhighlight(eles);

        return this;
    });


    cytoscape("collection", "highlightNeighbors", function () {
        var eles = this;

        var allEles = getWithNeighbors(eles);

        return allEles.highlight();

    });

    cytoscape("collection", "unhighlightNeighbors", function () {
        var eles = this;

        var allEles = getWithNeighbors(eles);

        return allEles.unhighlight();
    });

    cytoscape("collection", "highlightNeighbours", function () {
        var eles = this;

        return eles.highlightNeighbors();
    });

    cytoscape("collection", "unhighlightNeighbours", function () {
        var eles = this;

        return eles.unhighlightNeighbors();
    });

    cytoscape("core", "removeHighlights", function () {
        var cy = this;
        var eles = cy.elements();

        return eles
            .removeClass("highlighted")
            .removeClass("unhighlighted")
            .removeData("highlighted");
    });

    cytoscape("collection", "isHighlighted", function () {
        var ele = this;
        return ele.is(".highlighted:visible") ? true : false;
    });

    if (ur) {
        var funcs = {};

        var highlightHistories = {};


        function urRemoveHighlights() {

            var highlighteds = cy.$(".highlighted");
            var unhighlighteds = cy.$(".unhighlighted");
            cy.removeHighlights();

            return {highlighteds: highlighteds, unhighlighteds: unhighlighteds};
        }

        function urUndoRemoveHighlights(eles) {
            eles.highlighteds.highlight();
            eles.unhighlighteds.unhighlight();
        }

        function urUndoHighlight(eles) {
            var res = eles.unhighlight();

            if (cy.$(".highlighted:visible").length == 0)
                cy.removeHighlights();
            return res;
        }


        function urHighlightNeighbors(eles) {
            var res;
            if (eles.firstTime)
                res = eles.highlightNeighbors();
            else
                res = eles.highlight();
            return res;
        }

        function urHighlight(eles) {
            return eles.highlight();
        }

        function urUnhighlight(eles) {
            return eles.unhighlight();
        }

        function urUndoUnhighlight(eles) {
            return eles.highlight();
        }

        ur.action("highlightNeighbors", urHighlightNeighbors, urUndoHighlight);
        ur.action("highlightNeighbours", urHighlightNeighbors, urUndoHighlight);
        ur.action("highlight", urHighlight, urUndoHighlight);
        ur.action("unhighlight", urUnhighlight, urUndoUnhighlight);
        ur.action("unhighlightNeighbors", urUnhighlight, urUndoUnhighlight);
        ur.action("unhighlightNeighbours", urUnhighlight, urUndoUnhighlight);
        ur.action("removeHighlights", urRemoveHighlights, urUndoRemoveHighlights);
    }
};
},{}],3:[function(require,module,exports){
;(function () {
    'use strict';

    // registers the extension on a cytoscape lib ref
    var register = function (cytoscape, $) {

        if (!cytoscape || !$) {
            return;
        } // can't register if cytoscape unspecified

        var options = {
            node: {
                highlighted: {}, // styles for when nodes are highlighted.
                unhighlighted: { // styles for when nodes are unhighlighted.
                    'opacity': 0.3
                },
                hidden: {
                    "display": "none"
                }
            },
            edge: {
                highlighted: {}, // styles for when edges are highlighted.
                unhighlighted: { // styles for when edges are unhighlighted.
                    'opacity': 0.3
                },
                hidden: {
                    "display": "none"
                }
            },
            searchBy: ["id"] // Array of data fields will a string be searched on or function which executes search.
        };


        var hideShow = require("./hide-show");
        var search = require("./search");
        var highlight = require("./highlight");

        var initialized = false;

        cytoscape('core', 'viewUtilities', function (opts) {
            $.extend(true, options, opts);

            if (!initialized) {
                initialized = true;
                var cy = this;

                if (cy.undoRedo)
                    var ur = cy.undoRedo(null, true);

                highlight(cytoscape, cy, options, ur);
                hideShow(cytoscape, cy, options, ur);
                search(cytoscape, cy, options);

            }
            return this;
        });

    };

    if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
        module.exports = register;
    }

    if (typeof define !== 'undefined' && define.amd) { // expose as an amd/requirejs module
        define('cytoscape-view-utilities', function () {
            return register;
        });
    }

    if (typeof cytoscape !== 'undefined' && typeof $ !== "undefined") { // expose to global cytoscape (i.e. window.cytoscape)
        register(cytoscape, $);
    }

})();

},{"./hide-show":1,"./highlight":2,"./search":4}],4:[function(require,module,exports){
module.exports = function (cytoscape, cy, options) {

    cytoscape("collection", "search", function (text, searchBy) {
        var eles = this;

        if (!searchBy)
            searchBy = options.searchBy;

        var res;
        if (typeof searchBy == "function")
            res = searchBy(text);
        else {
            res = eles.filter(function (i, ele) {
                return searchBy.map(function (field) {
                        return ele.data(field) ? ele.data(field) : "";
                    }).join("$^>").indexOf(text) >= 0;
            });
        }

        return res;
    });

};
},{}]},{},[3]);
