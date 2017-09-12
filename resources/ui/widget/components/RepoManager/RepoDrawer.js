define(["dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/query",
        "dojo/dom",
], function (declare, domConstruct, query, dom){
	return declare(null, {
		
		rootDiv: null,
		repoData: null,
		repoButton: null,
		
		//Misc
		projectAreaName: null,
		baseUrl: null,
		
		constructor: function(baseUrl, projectAreaName){
			this.baseUrl = baseUrl;
			this.projectAreaName = projectAreaName;
			this.rootDiv = query(".repoPane")[0];
		},
		
		drawRepos: function(repoData){
			this.repoData = repoData;
			if(this.repoData.length == 0){
				this._noRepos();
			} else {
				this._multipleRepos();
			}
			return this.repoButton;
		},
		
		_noRepos: function(){
			this._createRepoLabel("No GitLab Repos Registered.");
			this._createHelpPanel();
		},
		
		_createHelpPanel: function(){
			var supporLink = "https://wiki.siemens.com/display/en/GITlab+Commit+Picker+for+Jazz@BT";
			var content = domConstruct.create("div", {}, this.rootDiv);
			domConstruct.create("a", {href:supporLink, innerHTML:"How to use 'GitLab Connector'", target:"_blank" }, content);
			
//			var list = domConstruct.create("ul", {}, this.rootDiv);
//			this._createGitLabDescription(list);
//			this._createRTCDescription(list);
		},
		
		_createGitLabDescription: function(ul){
			var accTokenLink = "https://docs.gitlab.com/ce/user/profile/personal_access_tokens.html";
			domConstruct.create("li", {innerHTML: "GitLab Side:"}, ul);
			var list = domConstruct.create("ul", {}, ul);
			domConstruct.create("li", {innerHTML: "First you need to create an access token."}, list);
			var test = domConstruct.create("li", {}, list);
			domConstruct.create("a", {href:accTokenLink, innerHTML:"How to use 'Personal Access Tokens'", target:"_blank" }, test);
		},
		
		_createRTCDescription: function(ul){
			var rtcGitOverview = this.baseUrl +"web/projects/"+ encodeURIComponent(this.projectAreaName) + "#action=com.ibm.team.git.web.ui.action.browse_registered_git_repositories";
			domConstruct.create("li", {innerHTML: "RTC Side:"}, ul);
			var list = domConstruct.create("ul", {}, ul);
			domConstruct.create("li", {innerHTML: "You need to register a gitLab repository."}, list);
			var test = domConstruct.create("li", {}, list);
			domConstruct.create("a", {href:rtcGitOverview, innerHTML:"GitLab Repositories", target:"_blank" }, test);
			domConstruct.create("li", {innerHTML: "Needed information:"}, list);
			domConstruct.create("li", {innerHTML: "1: Url to GitLab repo"}, list);
			domConstruct.create("li", {innerHTML: "2: Access Token"}, list);
			domConstruct.create("li", {innerHTML: "3: Name the Repo"}, list);
		},
		
		_multipleRepos: function(){
			this._createRepoLabel("Please Select A GitLab Repo");
			var form = domConstruct.create("form", {}, this.rootDiv);
			var selection = domConstruct.create("select", {id: "repoSelector", size: "5", style:{width:"200px"}}, form);
			for(var i=0; i < this.repoData.length; i++){
				if(i==0){
					domConstruct.create("option", {value: this.repoData[i].name, innerHTML: this.repoData[i].name, selected: true}, selection);
				} else {
					domConstruct.create("option", {value: this.repoData[i].name, innerHTML: this.repoData[i].name}, selection);
				}
			}
			domConstruct.create("br", {}, this.rootDiv);
			this.repoButton = domConstruct.create("button", {innerHTML: "Select Repo", className: "primary-button"}, this.rootDiv);
		},
		
		_createRepoLabel: function(title){
			var header = domConstruct.create("header", {}, this.rootDiv);
			domConstruct.create("h1", {
				innerHTML: title,
			}, header, "first");
			domConstruct.create("br", {}, header);
		},
		
		clearRepoPane: function(){
			while (this.rootDiv.firstChild) {
				this.rootDiv.removeChild(this.rootDiv.firstChild);
			}
		},
		
		evaluateRepoButton: function(){
			var selection = dom.byId("repoSelector");
			var selectedRepo = null;
			for(var i=0; i < selection.length; i++){
				if(selection[i].selected){
					selectedRepo = selection[i];
					break;
				}
			}
			if(selectedRepo){
				for(var i=0; i < this.repoData.length; i++){
					if(this.repoData[i].name == selectedRepo.value){
						return this.repoData[i];
					}
				}
			} else {
				return null;
			}
		},
	});
});