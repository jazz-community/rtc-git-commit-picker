define(["dojo/_base/declare",
        "dojo/json",
        "dojo/query",
        "dojo/on",
        "dojo/_base/lang",
        "./modules/CommitAccessor",
        "./modules/CommitDrawer",
        "./modules/CommitStore",
], function (declare, json, query, on, lang, CommitAccessor, CommitDrawer, CommitStore){
    return declare(null, {
        currentUser: null,

        // Components
        commitDialog: null,

        // CallBacks
        commitsLoadedCallBack: null,

        constructor: function(rtcBaseUrl){
            this.commitAccessor = new CommitAccessor(rtcBaseUrl, lang.hitch(this, this._tokenAccess));
            this.commitDrawer = new CommitDrawer();
            this.commitStore = new CommitStore();
        },

        getConnectionRepo: function(){
            return this.commitAccessor.getConnectionRepo();
        },

        setCurrentUser: function(currentUser){
            this.currentUser = currentUser;
        },

        startCommitLoading: function(repoObject, callBack){
            this.commitsLoadedCallBack = callBack;
            this.commitDrawer.setRepoName(repoObject.name);
            this.commitAccessor.setConnectionRepo(repoObject);
            this.commitAccessor.isGitLabRepository(lang.hitch(this.commitAccessor, this.commitAccessor.authenticateCurrentUser));
        },

        _tokenAccess: function(accessToken){
            this.commitAccessor.setAccessToken(accessToken);
            this.commitAccessor.getCommitsFromRepo(this.commitsLoadedCallBack);
        },

        setCommitData: function(linkDTOs, commits){
            var linkedCommits = this.detectLinkedCommits(linkDTOs, commits);
            this.commitStore.setCommitData(commits, linkedCommits);
        },

        detectLinkedCommits: function(links, commits){
            var linkedCommits = [];
            for(var i=0; i < links.length; i++){
                var linkUrl = links[i].url;
                var searchTerm = "/commit?value=";
                var aoi = linkUrl.lastIndexOf(searchTerm);
                if(aoi == -1) continue;
                var encodedCommit = linkUrl.slice(aoi + searchTerm.length);
                var linkCommit = json.parse(com_siemens_bt_jazz_gitlab_encoding_helper.decode(encodedCommit));
                var linkedCommitIdx = this._getCommitIdxById(linkCommit.s, commits);
                if(linkedCommitIdx != -1){
                    linkedCommits.push(commits[linkedCommitIdx]);
                }
            }
            return linkedCommits;
        },

        _getCommitIdxById: function(id, commits){
            for(var i=0; i < commits.length; i++){
                if(commits[i].id == id) return i;
            }
            return -1;
        },

        startDrawing: function(callBack){
            this.commitCallBack = callBack;
            this.commitDialog = this.commitDrawer.drawDialog(this.commitStore);
            this._connectLogic();
        },

        addCommentToCommits: function(workitemId, backLink, commits){
            var gitMessage = "This commit was linked by [RTC Work Item " + workitemId + "](" + backLink + ")";
            gitMessage += " on behalf of "+ this.currentUser;
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
                query(".saveBtn", this.commitDialog).attr("disabled", true);
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
                "Sort Desc",
                "Sort Asc",
            ];
            var sortBtn = query(".sortBtn", this.commitDialog)[0];
            sortBtn.innerHTML = sortLabel[0];
            on(sortBtn, "click", function(evt){
                var mode = this.getAttribute("sortDesc") ^ 1;
                this.setAttribute("sortDesc", mode);
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