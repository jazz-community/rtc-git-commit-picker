define([
    // dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    //modules
    "./modules/UrlHandler",
    "./modules/MessageHandler",
    //Components
    "./components/RepoManager/RepoManager",
    "./components/CommitManager/CommitManager",
    "./components/LinkManager/LinkManager",
    // templating
    "./_AbstractActionWidget",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/ConnectCommitsTemplate.html",
    "dojo/domReady!"
], function(
	//Dojo
    declare,
    lang,
    //Modules
    UrlHandler,
    MessageHandler,
    //Components
    RepoManager,
    CommitManager,
    LinkManager,
    //Templating
    _AbstractActionWidget,
    _TemplatedMixin,
    HtmlTemplate
) {
    return declare([_AbstractActionWidget, _TemplatedMixin], {
        templateString: HtmlTemplate,
        
        //Globals
        baseUrl: null,
        projectArea: null,
        currentUser: null,
        
        startup: function() {
        	this.prepareModules();
        	this.prepareSystemInfo();
        	this.prepareComponents();
        	this.repoMgr.loadCurrentUser(lang.hitch(this, this._setCurrentUser));
        	this.repoMgr.startRepoLoading(lang.hitch(this, this.repoIsSelected));
        },
        
        prepareModules: function(){
        	this.urlHandler = new UrlHandler();
        },
        
        prepareSystemInfo: function(){
        	this.baseUrl = this.urlHandler.getCurrentBaseUrl();
        	this.projectArea = {
        			id: this.workItem.object.attributes.projectArea.id,
        			name: this.workItem.object.attributes.projectArea.label,
        	}
        },
        
        prepareComponents: function(){
        	this.repoMgr = new RepoManager(this.baseUrl, this.projectArea);
        	this.commitMgr = new CommitManager();
        	this.linkMgr = new LinkManager();
        },
        
        _setCurrentUser: function(currentUser){
        	this.currentUser = currentUser;
        },
        
        repoIsSelected: function(selectedRepo){
        	var repoObject = this.urlHandler.buildRepoObject(selectedRepo);
        	this.commitMgr.startCommitLoading(repoObject, lang.hitch(this, this.finishCommitLoading));
        },
        
        finishCommitLoading: function(response){
        	this.commitMgr.detectLinkedCommits(this.linkMgr.getLinkTypeContainer(this.workItem.object.linkTypes).linkDTOs, response);
        	this.commitMgr.startDrawing(lang.hitch(this, this.startLinking));
        },
        
        startLinking: function(commitsToLink){
        	var gitLabUrl = this.commitMgr.getGitLabUrl();
        	commitsToLink = this.urlHandler.generateCommitUrl(commitsToLink, gitLabUrl);
        	var linksToSave = this.linkMgr.generateRTCLinks(this.workItem.object.linkTypes, commitsToLink);
        	this.saveLinksToWorkitem(linksToSave, commitsToLink);
        },
        
        saveLinksToWorkitem: function(linkObject, commitsToLink){
        	this.workItem.setValue(linkObject);
        	//Save the Workitem
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
   						self.commitMgr.closeDialog();
   					}
   				});
        	}, 750);
        },
        
        addRTCLinksToCommits: function(commitsToLink){
        	this.commitMgr.addCommentToCommits(this.currentUser, this.workItem.object.id, this.workItem.object.locationUri, commitsToLink);
        	this.commitMgr.closeDialog();
        },
    });
});
