define([
    // dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/request/script",
    // modules
    "./modules/UrlHandler",
    "./modules/MessageHandler",
    "./modules/LinkHandler",
    // Components
    "./components/RTCManager/RTCManager",
    "./components/GitLabManager/GitLabManager",
    // templating
    "./_AbstractActionWidget",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/PickCommitsTemplate.html",
    "dojo/domReady!"
], function(
    // Dojo
    declare,
    lang,
    script,
    // Modules
    UrlHandler,
    MessageHandler,
    LinkHandler,
    // Components
    RTCManager,
    GitLabManager,
    // Templating
    _AbstractActionWidget,
    _TemplatedMixin,
    HtmlTemplate
) {
    return declare([_AbstractActionWidget, _TemplatedMixin], {
        templateString: HtmlTemplate,

        // Globals
        baseUrl: null,
        projectArea: null,
        
        constructor: function() {
            this.encoderScriptPath = net.jazz.ajax._contextRoot + "/web/com.siemens.bt.jazz.workitemeditor.gitCommitPicker/dist/encoder-bundle.js";
        },

        // Make sure that the global variable "com_siemens_bt_jazz_gitlab_encoding_helper" is defined before setting up the widget.
        startup: function(){
            if (typeof com_siemens_bt_jazz_gitlab_encoding_helper != "undefined"){
                this._startup();
            } else {
                var self = this;
                script.get(this.encoderScriptPath).then(function() {
                    self._startup();
                });
            }
        },

        // This is the real startup function.
        _startup: function(){
            this.prepareModules();
            this.prepareSystemInfo();
            this.prepareComponents();
            this.rtcMgr.loadCurrentUser(lang.hitch(this, this._setCurrentUser));
            this.rtcMgr.startRepoLoading(lang.hitch(this, this.repoIsSelected));
        },

        prepareModules: function(){
            this.urlHandler = new UrlHandler();
            this.linkHandler = new LinkHandler();
        },

        prepareSystemInfo: function(){
            this.baseUrl = this.urlHandler.getCurrentBaseUrl();
            this.projectArea = {
                    id: this.workItem.object.attributes.projectArea.id,
                    name: this.workItem.object.attributes.projectArea.label,
            }
        },

        prepareComponents: function(){
            this.rtcMgr = new RTCManager(this.baseUrl, this.projectArea);
            this.gitlabMgr = new GitLabManager(this.baseUrl);
        },

        _setCurrentUser: function(currentUser){
            this.gitlabMgr.setCurrentUser(currentUser);
        },

        repoIsSelected: function(selectedRepo){
            var repoObject = this.urlHandler.buildRepoObject(selectedRepo);
            this.gitlabMgr.startCommitLoading(repoObject, lang.hitch(this, this.finishCommitLoading));
        },

        finishCommitLoading: function(response){
            this.gitlabMgr.setCommitData(this.linkHandler.getLinkTypeContainer(this.workItem.object.linkTypes).linkDTOs, response);
            this.gitlabMgr.startDrawing(lang.hitch(this, this.startLinking));
        },

        startLinking: function(commitsToLink){
            var gitLabRepo = this.gitlabMgr.getConnectionRepo();
            commitsToLink = this.urlHandler.generateCommitUrl(commitsToLink, gitLabRepo.repoLocation);
            var linksToSave = this.linkHandler.generateRTCLinks(this.workItem.object.linkTypes, commitsToLink, gitLabRepo.repoKey, this.baseUrl);
            this.saveLinksToWorkitem(linksToSave, commitsToLink);
        },

        saveLinksToWorkitem: function(linkObject, commitsToLink){
            this.workItem.setValue(linkObject);
            // Save the Workitem
            var self = this;
            setTimeout(function(){
                self.workItem.storeWorkItem({
                    operationMsg: 'Saving',
                       applyDelta: true,
                       onSuccess: function(parms) {
                           console.log("Save Success");
                           self.addRTCLinksToCommits(commitsToLink);
                       },
                       onError: function(error) {
                           self.gitlabMgr.closeDialog();
                       }
                   });
            }, 750);
        },

        addRTCLinksToCommits: function(commitsToLink){
            this.gitlabMgr.addCommentToCommits(this.workItem.object.id, this.workItem.object.locationUri, commitsToLink);
            this.gitlabMgr.closeDialog();
        },
    });
});