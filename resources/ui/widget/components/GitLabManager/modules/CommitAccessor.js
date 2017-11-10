define(["dojo/_base/declare",
        "dojo/json",
        "dojo/DeferredList",
        "dojo/_base/lang",
        "../../../modules/RestCommunicator",
        "../../../modules/MessageHandler",
        "../../../modules/HeaderMessageHandler",
], function (declare, json, DeferredList, lang, RestCommunicator, MessageHandler, HeaderMessageHandler){
    return declare(null, {

        rtcBaseUrl: null,
        repoObject: null,

        personalTokenService: "service/com.siemens.bt.jazz.services.PersonalTokenService.IPersonalTokenService/tokenStore",

        userAPI: "api/v4/user",
        projectAPI: "api/v4/projects/",

        /**
         * To get branch specific commits add
         * ?ref_name=BRANCHNAME
         */
        commitAPI: "/repository/commits/",

        // Modules
        rest: null,
        messageHandler: null,

        // CallBacks
        setTokenCallBack: null,

        constructor: function(rtcBaseUrl, setTokenCallBack){
            this.rtcBaseUrl = rtcBaseUrl;
            this.setTokenCallBack = setTokenCallBack;
            this.rest = new RestCommunicator();
            this.messageHandler = new MessageHandler();
        },

        setConnectionRepo: function(repoObject){
            this.repoObject = repoObject;
        },

        setAccessToken: function(accessToken){
            this.accessToken = accessToken;
        },

        getConnectionRepo: function(){
            return this.repoObject;
        },

        isGitLabRepository: function(successCallBack){
            var self = this;
            this.rest.getRequest(
                    this.repoObject.server + this.projectAPI,
                    { per_page: 1 },
                    {
                        handleAs: "json",
                        "Accept": "application/json"
                    }
                )
                .then(successCallBack, function(){
                    var message = "The repository \"" + self.repoObject.name + "\" is not a GitLab repository. ";
                    message += "Currently only GitLab repositories are supported.";
                    HeaderMessageHandler.addHeaderMessage(message, HeaderMessageHandler.ERROR);
                });
        },

        authenticateCurrentUser: function(){
            var self = this;
            this.getAccessToken(function(accessToken){
                self.checkAccessToken(accessToken, lang.hitch(self, self.setTokenCallBack), lang.hitch(self, self.getUserAccessToken));
            }, lang.hitch(this, this.getUserAccessToken));
        },

        getAccessToken: function(successCallBack, failureCallBack){
            this.rest.getRequest(
                    this.rtcBaseUrl + this.personalTokenService,
                    { key: this._getUrlHost(this.repoObject.server) },
                    {
                        handleAs: "json",
                        "Accept": "application/json"
                    }
                )
                .then(function(response){
                    if (response.token && response.token.trim()){
                        successCallBack(response.token);
                    } else {
                        failureCallBack();
                    }
                }, failureCallBack);
        },

        saveAccessToken: function(accessToken, successCallBack){
            this.rest.postRequest(
                    this.rtcBaseUrl + this.personalTokenService,
                    null,
                    {
                        handleAs: "json",
                        "Content-Type": "application/json"
                    },
                    json.stringify({
                        key: this._getUrlHost(this.repoObject.server),
                        token: accessToken
                    })
                )
                .then(successCallBack, function(error){
                    var message = "An error occurred and the access token could not be saved. ";
                    message += "Please refresh the page and try again. ";
                    message += "This may be caused by the token service being unavailable or incorrectly configured. ";
                    message += "If this error persists, please contact the Jazz Administrator and inform them of the problem.";
                    HeaderMessageHandler.addHeaderMessage(message, HeaderMessageHandler.ERROR);
                });
        },

        checkAccessToken: function(accessToken, successCallBack, failureCallBack){
            this.rest.getRequest(
                    this.repoObject.server + this.userAPI,
                    { private_token: accessToken },
                    { handleAs: "json" }
                )
                .then(function(){
                    successCallBack(accessToken);
                }, function(error){
                    if (error.response.status === 401){
                        failureCallBack();
                    } else {
                        var message = "The target Git server could not be reached. It may be offline. ";
                        message += "Please check if you can reach the Git server with your browser.";
                        HeaderMessageHandler.addHeaderMessage(message, HeaderMessageHandler.ERROR);
                    }
                });
        },
        
        getUserAccessToken: function(){
            var title = "GitLab Access Token for: " + this._getUrlHost(this.repoObject.server);
            var message = "Please enter your GitLab access token below.<br />" +
                "Instructions on creating an access token for GitLab can be found here: <a href='https://docs.gitlab.com/ce/user/profile/personal_access_tokens.html' target='_blank'>GitLab Access Token</a><br />" +
                "Please grant the token access to all scopes in order to ensure that it has enough permissions.<br /><br />" +
                "If you already did this before, you are seeing it again because your access token has expired or has been revoked.<br />" +
                "Please follow the instructions above to create a new access token to continue.<br /><br />";
            var self = this;
            this.messageHandler.accessTokenPrompt(message, title, function(accessToken) {
                self.saveAccessToken(accessToken, lang.hitch(self, self.authenticateCurrentUser));
            });
        },

        // This probably uses pagination! So we need to account that // Over 100 entrys
        getCommitsFromRepo: function(callBack){
            var service = this.repoObject.server + this.projectAPI + this.repoObject.repo + this.commitAPI;
            var requestParams = {
                    per_page: 100, // Default 20, Max 100
                    private_token: this.accessToken,
            };
            var requestHeader = {
                    handleAs: "json",
            };
            this.rest.getRequest(service, requestParams, requestHeader).then(callBack, function(error){
                var message = "Something went wrong while loading the selected repository. ";
                message += "This means either the URL is configured incorrectly or you don't have access to the repository (private).";
                HeaderMessageHandler.addHeaderMessage(message, HeaderMessageHandler.ERROR);
            });
        },

        addCommentToCommits: function(gitMessage, commits){
            var deferreds = [];
            for(var i=0; i < commits.length; i++){
                var commit = commits[i];
                var service = this.repoObject.server + this.projectAPI + this.repoObject.repo + this.commitAPI + commit.id + "/comments";
                var requestParams = {
                        private_token: this.accessToken,
                        note: gitMessage,
                };
                var requestHeader = {
                        handleAs: "json",
                };
                deferreds.push(this.rest.postRequest(service, requestParams, requestHeader));
            }
            var deferredList = new DeferredList(deferreds);
            deferredList.then(function(result){
                HeaderMessageHandler.addHeaderMessage("Links were successfully added and backlinks were created in GitLab.", HeaderMessageHandler.INFO);
            }, function(error){
                HeaderMessageHandler.addHeaderMessage("Links were added to RTC, but commenting on commits had problems.", HeaderMessageHandler.ERROR);
            });
        },

        _getUrlHost: function(url){
            var aDomElement = document.createElement("a");
            aDomElement.href = url;
            if (aDomElement.host == ""){
                aDomElement.href = aDomElement.href; // Fix for IE. I know. It's weird.
            }
            return aDomElement.host;
        },
    });
});