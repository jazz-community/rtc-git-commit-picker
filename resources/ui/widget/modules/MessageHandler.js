define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/query",
        "dojo/dom",
        "dojo/dom-construct",
        "dijit/Dialog",
        "dijit/form/TextBox",
        "dijit/focus",
        "dojo/on",
], function (declare, lang, query, dom, domConstruct, Dialog, TextBox, focus, on){
    return declare(null, {
        _dialog: null,

        // CallBacks
        accessTokenCallBack: null,
        loginCallBack: null,

        info: function(message, title){
            title = (title) ? title : "Info:";
            var content = this._buildContent(message, title);
            this._createDialog(title, content);
        },

        accessTokenPrompt: function(message, title, callBack){
            this.accessTokenCallBack = callBack;
            title = (title) ? title : "Access Token:";
            var content = this._buildAccessTokenPrompt(message, title);
            this._createDialog(title, content);
            setTimeout(function(){
                focus.focus(dom.byId("accessTokenField"));
            }, 250);
        },

        _buildAccessTokenPrompt: function(message, title){
            var content = this._buildContent(message, title);
            content = this._buildAccessTokenPromptContent(content);
            return content;
        },

        _buildAccessTokenPromptContent: function(content){
            this._buildAccessTokenInputArea(content);
            this._buildAccessTokenButtonArea(content);
            this._connectSaveAccessTokenLogic(content);
            return content;
        },

        _buildAccessTokenInputArea: function(content){
            var table = domConstruct.create("table", {}, content);
            var row = domConstruct.create("tr", {}, table);

            var td = domConstruct.create("td", {}, row);
            domConstruct.create("label", {innerHTML:"Access Token: "}, td);

            td = domConstruct.create("td", {}, row);
            var input = domConstruct.create("div", {}, td);
            var box = new TextBox({
                id: "accessTokenField",
                autocomplete: "off",
                className: "accessTokenField",
                style: "border: 0px; width: 15em;",
                value: "",
                placeHolder: "Access Token"
            }, input);
            box.domNode.firstChild.firstChild.style.width = "98%";
        },

        _buildAccessTokenButtonArea: function(content){
            domConstruct.create("br", {}, content);
            domConstruct.create("button", {innerHTML: "Save", className: "primary-button saveBtn", type: "submit", style:{}}, content);
            domConstruct.create("button", {innerHTML: "Cancel", className: "secondary-button cancelBtn", style:{marginLeft:"5px"}}, content);
        },

        _connectSaveAccessTokenLogic: function(content){
            var self=this;
            var saveBtn = query(".saveBtn", content)[0];
            on(saveBtn, "click", function(evt){
                self._saveAccessTokenLogic();
            });
            var cancelBtn = query(".cancelBtn", content)[0];
            on(cancelBtn, "click", function(evt){
                self._closeDialog();
            });

            var accessTokenField = query(".accessTokenField", content)[0];
            on(accessTokenField, "keydown", function(evt){
                self._detectEnter(evt, lang.hitch(self, self._saveAccessTokenLogic));
            });
        },

        _saveAccessTokenLogic: function(){
            var accessToken = query(".accessTokenField", this._dialog.domNode)[0];
            accessToken.style.backgroundColor = "";

            if(accessToken.value){
                this.accessTokenCallBack(accessToken.value);
                this._closeDialog();
            } else {
                accessToken.style.backgroundColor = "lightcoral";
            }
        },

        _detectEnter: function(event, callBack){
            var code = (event.keyCode ? event.keyCode : event.which);
            if(code == 13) { // Enter keycode
                callBack();
            }
        },

        error: function(message, title){
            var title = (title) ? title : "Git Commit Picker: Error";
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