define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/on",
        "./RepoAccessor",
        "./RepoDrawer",
], function (declare, lang, on, RepoAccessor, RepoDrawer){
    return declare(null, {
        // Components
        repoAccessor: null,
        repoDrawer: null,

        // Callbacks
        repoSelectedCallback: null,

        constructor: function(baseUrl, projectArea){
            this.repoAccessor = new RepoAccessor(baseUrl, projectArea.id);
            this.repoDrawer = new RepoDrawer(baseUrl, projectArea.name);
        },

        loadCurrentUser: function(userCallBack){
            this.repoAccessor.getCurrenUser(userCallBack);
        },

        startRepoLoading: function(callBack){
            this.repoSelectedCallback = callBack;
            this.repoAccessor.getGitLabRepos(lang.hitch(this, this.finishedRepoLoading));
        },

        finishedRepoLoading: function(response){
            if(response.length == 1){
                this.repoSelectedCallback(response[0]);
            } else {
                var submitBtn = this.repoDrawer.drawRepos(response);
                this.connectLogic(submitBtn);
            }
        },

        connectLogic: function(button){
            var self = this;
            on(button, "click", function(evt){
                var selectedRepo = self.repoDrawer.evaluateRepoButton();
                self.repoSelectedCallback(selectedRepo);
            });
        },
    });
});