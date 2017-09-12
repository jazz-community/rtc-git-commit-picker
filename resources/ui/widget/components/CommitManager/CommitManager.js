define(["dojo/_base/declare",
        "dojo/query",
        "dojo/on",
        "dojo/_base/lang",
        "./CommitAccessor",
        "./CommitDrawer",
], function (declare, query, on, lang, CommitAccessor, CommitDrawer){
	return declare(null, {
		//Components
		commitDialog: null,
		
		//CallBacks
		commitsLoadedCallBack: null,
		
		constructor: function(){
			this.commitAccessor = new CommitAccessor();
			this.commitDrawer = new CommitDrawer();
		},
		
		getGitLabUrl: function(){
			return this.commitAccessor.getGitLabRepoLocation();
		},
		
		startCommitLoading: function(repoObject, callBack){
			this.commitsLoadedCallBack = callBack;
			this.commitDrawer.setRepoName(repoObject.name);
			this.commitAccessor.setConnectionLocation(repoObject);
			
			if(!repoObject.accessToken || repoObject.accessToken.length < 1){
				this.commitAccessor.getUserToken(lang.hitch(this, this._tokenAccess));
			} else {
				this._tokenAccess(repoObject.accessToken);
			}
		},
		
		_tokenAccess: function(accessToken){
			this.commitAccessor.setAccessToken(accessToken);
			this.commitAccessor.getCommitsFromRepo(this.commitsLoadedCallBack);
		},
		
		detectLinkedCommits: function(links, commits){
			var linkedCommits = [];
			for(var i=0; i < links.length; i++){
				var linkUrl = links[i].url;
				var searchTerm = "/commit/";
				var aoi = linkUrl.lastIndexOf(searchTerm);
				if(aoi == -1) continue;
				var commitId = linkUrl.slice(aoi + searchTerm.length);
				var linkedCommitIdx = this._getCommitIdxById(commitId, commits);
				if(linkedCommitIdx != -1){
					linkedCommits.push(commits[linkedCommitIdx]);
				}
			}
			this.commitDrawer.setData(commits, linkedCommits);
		},
		
		_getCommitIdxById: function(id, commits){
			for(var i=0; i < commits.length; i++){
				if(commits[i].id == id) return i;
			}
			return -1;
		},
		
		startDrawing: function(callBack){
			this.commitCallBack = callBack;
			this.commitDialog = this.commitDrawer.drawDialog();
			this._connectLogic();
		},
		
		addCommentToCommits: function(user, workitemId, backLink, commits){
        	var gitMessage = "This commit was linked by [RTC Work Item "+workitemId+"]("+backLink+")";
        	gitMessage += " on behalf of "+user;
			this.commitAccessor.addCommentToCommits(gitMessage, commits);
		},
		
		closeDialog: function(){
			this.commitDrawer.closeDialog();
		},
		
		_connectLogic: function(){
			this._connectListLogic();
			this._connectSiteLogic();
			this._connectSortLogic();
			this._connectFilterLogic();
		},
		_connectListLogic: function() {
			this._connectAddLogic();
			this._connectRemoveLogic();
		},
		
		_connectAddLogic: function(){
			var self=this;
			var addBtn = query(".addBtn", this.commitDialog)[0];
    		on(addBtn, "click", function(evt){
    			self.commitDrawer.addLogic();
    		});	
    		var givenSelection = query(".givenCommitsList", this.commitDialog)[0];
    		on(givenSelection, "dblclick", function(evt){
    			self.commitDrawer.addLogic();
    		});
		},
		
		_connectRemoveLogic: function(){
			var self=this;
			var removeBtn = query(".removeBtn", this.commitDialog)[0];
    		on(removeBtn, "click", function(evt){
    			self.commitDrawer.removeLogic();
    		});	
    		var linkingSelection = query(".linkingCommitsList", this.commitDialog)[0];
    		on(linkingSelection, "dblclick", function(evt){
    			self.commitDrawer.removeLogic();
    		});
		},
		
    	_connectSiteLogic: function(){
			var self=this;
			var saveBtn = query(".saveBtn", this.commitDialog)[0];
    		on(saveBtn, "click", function(evt){
    			self._saveSelectedLinks();
    		});	
    		var cancelBtn = query(".cancelBtn", this.commitDialog)[0];
    		on(cancelBtn, "click", function(evt){
    			self.closeDialog();
    		});
    	},
    	
    	_saveSelectedLinks: function(){
    		var commits = this.commitDrawer.getCommitsToLink();
    		this.commitCallBack(commits);
    	},
    	
    	_connectSortLogic: function(){
    		var self=this;
			var sortLabel = [
				"Sort Asc",
				"Sort Desc",
			];
			var sortBtn = query(".sortBtn", this.commitDialog)[0];
			sortBtn.innerHTML = sortLabel[0];
    		on(sortBtn, "click", function(evt){
    			var mode = this.getAttribute("sortDesc");
    			if(mode == 1){
    				this.setAttribute("sortDesc", 0);
    			} else {
    				this.setAttribute("sortDesc", 1);
    			}
    			this.innerHTML = sortLabel[mode]
    			self.commitDrawer.sortLogic();
    		});
    	},
    	
    	_connectFilterLogic: function(){
    		var self=this;
    		var filterField = query(".filterField", this.commitDialog)[0];
    		on(filterField, "keyup", function(evt){
    			self.commitDrawer.filterLogic(this.value);
    		});
    	},
	});
});