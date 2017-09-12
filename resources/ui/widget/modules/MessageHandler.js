define(["dojo/_base/declare",
        "dojo/query",
        "dojo/dom-construct",
        "dijit/Dialog",
        "dijit/form/TextBox",
        "dojo/on",
], function (declare, query, domConstruct, Dialog, TextBox, on){
	return declare(null, {
		_dialog: null,
		
		//CallBacks
		loginCallBack: null,
		
		info: function(message, title){
			title = (title) ? title : "Info:";
			var content = this._buildContent(message, title);
			this._createDialog(title, content);
		},
		
		//TODO Send the username to pre-fill the username field
		loginPrompt: function(message, callBack, title){
			this.loginCallBack = callBack;
			title = (title) ? title : "Login:";
			var content = this._buildLoginPrompt(message, title);
			this._createDialog(title, content);
		},
		
		_buildLoginPrompt: function(message, title){
			var content = this._buildContent(message, title);
			content = this._buildLogin(content);
			return content;
		},
		
		_buildLogin: function(content){
			var form = this._buildChromeAutofillFix(content);
			this._buildInputArea(form);
			
			this._buildButtonArea(content);
			this._connectLoginLogic(content);
			return content;
		},
		
		/**
		 * Chrome only saves "autocompletion" data if there is a submit to another site.
		 * This is a fix to get those data nonetheless.
		 * We have to add a hidden iFrame and button which we can use to make a fake submit.
		 * 
		 * Also we need to implement "dojo.byId("formButton").click();" to use this logic
		 */
		_buildChromeAutofillFix: function(content){
			domConstruct.create("iframe", {id: "remember", name: "remember", className:"hidden", src:"/content/blank", style:{display:"none"}}, content);
			var form = domConstruct.create("form", {method: "post", target: "remember", action:"/content/blank"}, content);
			domConstruct.create("button", {id: "formButton", className: "hidden", type: "submit", style:{display:"none"}}, form);
			return form;
		},
		
		_buildInputArea: function(content){
			var table = domConstruct.create("table", {}, content);
			var row = domConstruct.create("tr", {}, table);

			var td = domConstruct.create("td", {}, row);
			domConstruct.create("label", {innerHTML:"Username: "}, td);
			
			td = domConstruct.create("td", {}, row);
			var input = domConstruct.create("div", {}, td);
			var box = new TextBox({
				id: "usernameField",
				autocomplete: "on",
				className: "usernameField",
				style: "border: 0px; width: 15em;",
				value: "",
				placeHolder: "Username"
			}, input);
			box.domNode.firstChild.firstChild.style.width = "98%";
			
			row = domConstruct.create("tr", {}, table);
			td = domConstruct.create("td", {}, row);
			domConstruct.create("label", {innerHTML:"Password: "}, td);
			
			td = domConstruct.create("td", {}, row);
			var input = domConstruct.create("div", {}, td);
			box = new TextBox({
				id: "passwordField",
				autocomplete: "on",
				className: "passwordField",
				style: "border: 0px",
				value: "",
				placeHolder: "Password",
				type: "password",
			}, input);
			box.domNode.firstChild.firstChild.style.width = "98%";
		},
		
		_buildButtonArea: function(content){
			domConstruct.create("button", {innerHTML: "Login", className: "primary-button loginBtn", type: "submit", style:{}}, content);
			domConstruct.create("button", {innerHTML: "Cancel", className: "secondary-button cancelBtn", style:{marginLeft:"5px"}}, content);
		},
		
		_connectLoginLogic: function(content){
    		var self=this;
    		var loginBtn = query(".loginBtn", content)[0];
    		on(loginBtn, "click", function(evt){
    			self._loginLogic();
    		});
    		var cancelBtn = query(".cancelBtn", content)[0];
    		on(cancelBtn, "click", function(evt){
    			self._closeDialog();
    		});
    		
    		var usrField = query(".usernameField", content)[0];
    		on(usrField, "keydown", function(evt){
    			self._detectEnter(evt);
    		});
    		var pwField = query(".passwordField", content)[0];
    		on(pwField, "keydown", function(evt){
    			self._detectEnter(evt);
    		});
		},
		
		_detectEnter: function(event){
    		var code = (event.keyCode ? event.keyCode : event.which);
			if(code == 13) { //Enter keycode
				this._loginLogic();
			}
		},
		
		_loginLogic: function(){
			var usr = query(".usernameField", this._dialog.domNode)[0];
			var pw =query(".passwordField", this._dialog.domNode)[0];
			usr.style.backgroundColor = "";
			pw.style.backgroundColor = "";
			
			if(usr.value && pw.value){
    			dojo.byId("formButton").click();
				this.loginCallBack(usr.value, pw.value);
				this._closeDialog();
			} else {
				if(!usr.value) usr.style.backgroundColor = "lightcoral";
				if(!pw.value) pw.style.backgroundColor = "lightcoral";
			}
		},
		
		error: function(message, title){
			var title = (title) ? title : "GitLab Connector: Error";
			var content = this._buildContent(message, title);
			this._createDialog(title, content);
		},
		
		_buildContent: function(message, title){
			var content = domConstruct.create("div", {});
			this._buildTitle(content, title);
			this._buildMessageBody(content, message);
			return content;
		},
		
		_buildTitle: function(content, title){
			domConstruct.create("h2", {
				innerHTML: title,
				style: {marginTop: "auto"}
			}, content);
		},
		
		_buildMessageBody: function(content, message){
			var body = domConstruct.create("div", {}, content);
			body.innerHTML = message
		},
		
		_closeDialog: function(){
			this._dialog.destroyRecursive(false);
		},
		
		_createDialog: function(title, content){
    		this._dialog = new Dialog({
		        title: title,
		        content: content,
		        style: "width: auto; height: auto; padding-bottom: 10px; background: white;",
		        onCancel: function() {
		        	this.destroyRecursive(false);
		        }
		    });
    		this._dialog.startup();
    		this._dialog.show();
		},
	});
});