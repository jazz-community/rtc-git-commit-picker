define(["dojo/_base/declare",
        "dojo/DeferredList",
        "dojo/_base/lang",
        "../../modules/RestCommunicator",
        "../../modules/MessageHandler",
        "../../modules/HeaderMessageHandler",
], function (declare, DeferredList, lang, RestCommunicator, MessageHandler, HeaderMessageHandler){
	return declare(null, {
		
		serverUrl: null,
		accessToken: null,
		
		sessionAPI: "api/v4/session",
		projectAPI: "api/v4/projects/",
		commitAPI: "/repository/commits/",
		
		//Modules
		messageHandler: null,
		
		//CallBacks
		tokenCallBack: null,
		
		constructor: function(){
			this.rest = new RestCommunicator();
			this.messageHandler = new MessageHandler();
		},
		
		setConnectionLocation: function(params){
			this.serverUrl = params.server;
			this.repo = params.repo;
		},
		
		setAccessToken: function(accessToken){
			this.accessToken = accessToken;
		},
		
		//TODO This probably uses pagination! So we need to account that //Over 100 entrys
        getCommitsFromRepo: function(callBack){
    		var service = this.serverUrl + this.projectAPI + this.repo + this.commitAPI;
    		var requestParams = {
    				per_page: 100, //Default 20, Max 100
    				private_token: this.accessToken,
    		};
    		var requestHeader = {
    				handleAs: "json",
    		};
    		var self = this;
    		this.rest.getRequest(service, requestParams, requestHeader).then(function(response){
    			callBack(response);
    		}, function(error){
    			var message = "While loading the selected repository something went wrong.<br>";
    			message += "This means either your 'GitLab URL' or your 'Access Token' is faulty.";
    			HeaderMessageHandler.addHeaderMessage(message, HeaderMessageHandler.ERROR);
    		});
        },
        
        getGitLabRepoLocation: function(){
        	return this.serverUrl + decodeURIComponent(this.repo);
        },
        
        addCommentToCommits: function(gitMessage, commits){
        	var deferreds = [];
        	for(var i=0; i < commits.length; i++){
        		var commit = commits[i];
        		var service = this.serverUrl + this.projectAPI + this.repo + this.commitAPI + commit.id + "/comments";
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
        		HeaderMessageHandler.addHeaderMessage("Links are successfully added and backlinks in GitLab are created.", HeaderMessageHandler.INFO);
        	}, function(error){
        		HeaderMessageHandler.addHeaderMessage("Links are added to RTC, but commenting on commits had problems.", HeaderMessageHandler.ERROR);
        	});
        },
        
        getUserToken: function(tokenCallBack){
        	this.tokenCallBack = tokenCallBack;
			var title = "Access Problem:";
			var message = "Your selected GitLab repository has no 'access token'.<br>";
			message += "Please login with your GitLab credentials.<br>";
			this.messageHandler.loginPrompt(message, lang.hitch(this, this._loadUserToken), title);
	    },
	    
	    _loadUserToken: function(username, password){
	    	var service = this.serverUrl+this.sessionAPI;
	    	var parameter = {
    			login: username,
    			password: password,
	    	};
	    	var header = {
	    		handleAs: "json",
	    	};
	    	var self=this;
	    	this.rest.postRequest(service, parameter, header).then(function(success){
	    		self.tokenCallBack(success.private_token);
	    	}, function(err){
	    		console.log("Login Error", err);
	    		if(err.response.status == 401){
	    			//Credentials wrong
	    			var title = "Login Wrong:";
	    			var message = "You've entered the wrong credentials.<br>";
	    			self.messageHandler.loginPrompt(message, lang.hitch(self, self._loadUserToken), title);
	    		} else {
	    			var message = "Something went wrong loading the access token. Please try again later.";
	    			HeaderMessageHandler.addHeaderMessage(message, HeaderMessageHandler.ERROR);
	    		}
		    });
	    },
		
	});
});