define(["dojo/_base/declare",
        "dojo/json",
        "../../modules/RestCommunicator",
        "../../modules/MessageHandler",
        "../../modules/HeaderMessageHandler",
], function (declare, json, RestCommunicator, MessageHandler, HeaderMessageHandler){
    return declare(null, {

        baseUrl: null,
        projectArea: null,

        repoCallBack: null,

        constructor: function(baseUrl, projectArea){
            this.baseUrl = baseUrl;
            this.projectArea = projectArea;
            this.xhr = new RestCommunicator();
            this.msgHandler = new MessageHandler();
        },

        getCurrenUser: function(userCallBack){
            this.xhr.getRequest(this.baseUrl + "whoami").then(function(response){
                var searchTerm = "/users/"
                var sliceStart = response.lastIndexOf(searchTerm)+searchTerm.length;
                userCallBack(decodeURIComponent(response.slice(sliceStart)));
            }, function(error){
                var message = "Cannot load current user. Please try again later.";
                HeaderMessageHandler.addHeaderMessage(message, HeaderMessageHandler.ERROR);
            });
        },

        getGitLabRepos: function(callBack){
            this.repoCallBack = callBack;
            var service = this.baseUrl + "service/com.ibm.team.git.common.internal.IGitRepositoryRegistrationRestService/allRegisteredGitRepositories";
            var requestParams = {
                    findRecursively: "true",
                    ownerItemIds: this.projectArea,
            };
            var requestHeader = {
                    handleAs: "xml"
            };
            var self = this;
            this.xhr.getRequest(service, requestParams, requestHeader).then(function(response){
                self.handleRepoInfos(response.getElementsByTagName("values"));
            }, function(error){
                var message = "Cannot load Git repositories. Please try again later.";
                HeaderMessageHandler.addHeaderMessage(message, HeaderMessageHandler.ERROR);
            });
        },

        handleRepoInfos: function(nodeArray){
            var repoArray = [];
            for(var i=0; i < nodeArray.length; i++){
                var repo = this.createRepoDTO(nodeArray[i]);
                var configurationData = json.parse(repo.confData);
                if (typeof configurationData.git_hosted_server === "undefined" ||
                    (typeof configurationData.git_hosted_server === "string" && configurationData.git_hosted_server.toLowerCase() === "gitlab")){
                    repoArray.push(repo);
                }
            }
            this.repoCallBack(repoArray);
        },

        createRepoDTO: function(repoNode){
            var repoObject = {
                name: repoNode.getElementsByTagName('name')[0].innerHTML,
                description: repoNode.getElementsByTagName('description')[0].innerHTML,
                url: repoNode.getElementsByTagName('url')[0].innerHTML,
                key: repoNode.getElementsByTagName('key')[0].innerHTML,
                confData: repoNode.getElementsByTagName('configurationData')[0].innerHTML,
                message: repoNode.getElementsByTagName('message')[0].innerHTML,
                secretKey: repoNode.getElementsByTagName('secretKey')[0].innerHTML,
                ownerPresent: repoNode.getElementsByTagName('ownerPresent')[0].innerHTML,
            };
            return repoObject;
        },
    });
});