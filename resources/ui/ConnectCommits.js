define([
    "dojo/_base/declare",
    "dijit/focus",
    "./widget/GitLabConnector",
    "../library/ActionNode",
    "../library/ActionButtonIcon",
    "../library/HoverViewWrapper"
], function(declare, focus, GitLabConnector, ActionNode, ActionButtonIcon, HoverViewWrapper) {
	var cssSelector = "img.button-img";
	var backgroundUrl = "/service/com.ibm.team.rtc.common.internal.service.web.sprite.ISpriteImageService/img/bundle?id=com.ibm.team.workitem.common&etag=b8b09f70d69bbc3fef0753f03eb21ae9"

	return declare("com.siemens.bt.jazz.workitemeditor.gitLabConnector.ui.ConnectCommits", 
			com.ibm.team.workitem.web.ui2.internal.action.AbstractAction, {

		//	summary:
		//		Default constructor called when the WorkItemEditor is instantiated.
		//		For in-depth information on the creation procedure, see
		//		WorkItemEditorHeader.js, where all actions are created.
		//
		//	params: {actionSpec, workingCopy}
		//		actionSpec corresponds to the action values defined in plugin.xml.
		//		workingCopy is a reference to the current work item being edited:
		//		{
		//			actionSpec: {
		//				action,
		//				iconContext,
		//				iconUri,
		//				id,
		//				label,
		//				parameter
		//			},
		//			workingCopy: {}
		//		}
		constructor: function(params) {
			var nodeLabel = params.actionSpec.label;
			this._buttonNode = new ActionNode(cssSelector, nodeLabel);
		},
		
		isEnabled: function(params) {
			var workingCopy = params.workingCopy || params;
			return !workingCopy.isChanged() && !workingCopy.isNewWorkItem();
		},
		
		//	summary:
		//		Is run when the action button in the WorkItemEditor view is clicked.
		//	params: {actionSpec, workingCopy}
		//		Same as the params passed to the constructor.
		run: function(params) {
            var widget = this.makeWidget(params);
            var hoverViewWrapper = new HoverViewWrapper(this._buttonNode.getPosition(), widget);
            focus.focus(hoverViewWrapper.getDomNode());
		},

        makeWidget: function(params) {
            var minWidth = this._buttonNode.calculateMinWidth();
            var workingCopy = params.workingCopy || params;
            return new GitLabConnector(minWidth, workingCopy);
        }

	});
});
