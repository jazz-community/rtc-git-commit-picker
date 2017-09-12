define(["dojo/_base/declare",
        "../../modules/RestCommunicator",
        "../../modules/MessageHandler",
        "../../modules/HeaderMessageHandler",
], function (declare, RestCommunicator, MessageHandler, HeaderMessageHandler){
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
			var url = this.baseUrl + "whoami";
			var self=this;
			this.xhr.getRequest(url).then(function(response){
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
    			var message = "Cannot load GitLab repositories. Please try again later.";
    			HeaderMessageHandler.addHeaderMessage(message, HeaderMessageHandler.ERROR);
        	});
        },
        
        handleRepoInfos: function(nodeArray){
        	var repoArray = [];
        	for(var i=0; i < nodeArray.length; i++){
        		var repo = this.createRepoDTO(nodeArray[i]);
        		repoArray.push(repo);
        	}
        	this.repoCallBack(repoArray);
        },
        
        createRepoDTO: function(repoNode){
    		var repoObject = {
    			name: repoNode.childNodes[1].innerHTML,
    			description: repoNode.childNodes[3].innerHTML,
    			url: repoNode.childNodes[5].innerHTML,
    			key: repoNode.childNodes[7].innerHTML,
    			confData: repoNode.childNodes[9].innerHTML,
    			message: repoNode.childNodes[11].innerHTML,
    			authKey: repoNode.childNodes[13].innerHTML,
    			owner: repoNode.childNodes[15].innerHTML,
    		};
    		return repoObject;
        },
	});
});