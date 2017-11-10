define([
    "dojo/_base/declare", 
    "dojo/dom-geometry",
    "dojo/query",
    "dijit/registry"
], function (declare, domGeom, query, registry) {
    var _wic = com.ibm.team.workitem.web.client.internal.WorkItemClient;
    var HeaderMessageHandler = declare("com.siemens.bt.jazz.rtc.workitemeditor.presentation.linkcreator.ui.HeaderMessageHandler", null, {

        INFO: _wic.INFO,
        WARNING: _wic.WARNING,
        ERROR: _wic.ERROR,

        addHeaderMessage: function(message, severity) {
            var obj = this._setupDijitWorkItemHeaderObject();
            if (obj == null) {
                alert(message);
                return;
            }
            obj.setHeaderMessage({
                message: message,
                severity: severity
            });
        },

        _setupDijitWorkItemHeaderObject: function() {
            var editorHeaderObjects = query(".com-ibm-team-workItem-workItemEditorHeader");
            var visibleEditorHeaderObjects = this._filterVisible(editorHeaderObjects);
            if (typeof visibleEditorHeaderObjects !== "undefined" && visibleEditorHeaderObjects !== null &&
                typeof visibleEditorHeaderObjects.length === "number" && typeof visibleEditorHeaderObjects[0].id === "string") {
                var firstEditorHeader = visibleEditorHeaderObjects[0].id;
                var dijitObj = registry.byId(firstEditorHeader);
                if (typeof dijitObj !== "undefined" &&
                    typeof dijitObj.setHeaderMessage === "function" &&
                    typeof dijitObj.clearValidationMessage === "function" &&
                    typeof dijitObj._refreshButton !== "undefined") {
                    return dijitObj;
                }
            }
            return null;
        },

        _filterVisible: function(elements) {
            var self = this;
            var response = [];
            elements.forEach(function (element) {
                if (self._isVisible(element)) {
                    response.push(element);
                }
            });
            return response;
        },

        _isVisible: function(element) {
            var el = domGeom.getContentBox(element);
            return (el.w > 0 || el.h > 0);
        },
    });
    return new HeaderMessageHandler();
});