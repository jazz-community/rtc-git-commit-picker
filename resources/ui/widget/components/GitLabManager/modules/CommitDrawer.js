define(["dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/query",
        "dijit/Dialog",
        "dijit/form/TextBox",
], function (declare, domConstruct, query, Dialog, TextBox){
    return declare(null, {
        // Data model
        commitStore: null,

        // CallBack
        commitCallBack: null,

        // DOM Selectors
        givenSelection: null,
        linkingSelection: null,

        // Constants
        selectionHeight: "220px",

        // Misc
        repoName: null,

        constructor: function(){
        },

        setRepoName: function(repoName){
            this.repoName = repoName;
        },

        drawDialog: function(commitStore){
            this.commitStore =  commitStore;
            this._drawCommitPane();
            return this._dialogContainer.domNode;
        },

        redrawCommits: function(){
            this.commitStore._sortMemory();
            this._buildGivenOptions();
            this._buildSelectedOptions();
        },

        _drawCommitPane: function(){
            var content = domConstruct.create("div", {});
            this._createHeaderPart(content);
            this._createSelectionPart(content);
            this._createButtonPart(content);
            this._buildDialog(content);
        },

        _createHeaderPart: function(content){
            this._createCommitLabel(content);
            domConstruct.create("br", {}, content);
        },

        _createCommitLabel: function(content){
            var commitTitle = "Select desired git commits";
            if(this.repoName) commitTitle += " from '" + this.repoName + "'";
            domConstruct.create("h1", {
                innerHTML: commitTitle,
            }, content);
        },

        _createSelectionPart: function(content){
            // Rework here
            this._createGivenSector(content);
            this._createInteractionSector(content);
            this._createLinkingSector(content);
        },

        _createGivenSector: function(content){
            var pane = domConstruct.create("div", {style:{ cssFloat: "left", height:this.selectionHeight}}, content);
            this._createFilterButtons(pane);
            domConstruct.create("label", {innerHTML:"Git Commits:", style:{fontWeight:"bold"}}, pane);
            var form = domConstruct.create("form", {style:{marginTop:"5px"}}, pane);
            this.givenSelection = domConstruct.create("select", {className: "givenCommitsList", multiple: "multiple", size: "10", style:{width:"300px"}}, form);
            this._buildGivenOptions();
        },

        _buildGivenOptions: function(){
            // Clear selection
            while(this.givenSelection.firstChild){
                this.givenSelection.removeChild(this.givenSelection.firstChild);
            }
            // Add data
            var commitData = this.commitStore.getCommitData();
            for(var i=0; i < commitData.length; i++){
                var optionProperties = {value: commitData[i].id, innerHTML: commitData[i].title, commit_id: commitData[i].id};
                if(this.commitStore.checkIfCommitIsAlreadyLinked(commitData[i].id)){
                    optionProperties.disabled = "disabled";
                }
                domConstruct.create("option", optionProperties, this.givenSelection);
            }
        },

        _createLinkingSector: function(content){
            var pane = domConstruct.create("div", {style:{ cssFloat: "left", height: this.selectionHeight}}, content);
            domConstruct.create("div", {style:{height: "30px"}}, pane);
            domConstruct.create("label", {innerHTML:"Commits to link:", style:{fontWeight:"bold"}}, pane);
            var form = domConstruct.create("form", {style:{marginTop:"5px"}}, pane);
            this.linkingSelection = domConstruct.create("select", {className: "linkingCommitsList", multiple: "multiple", size: "10", style:{width:"300px"}}, form);
            this._buildSelectedOptions();
        },

        _buildSelectedOptions: function(){
            // Clear selection
            while(this.linkingSelection.firstChild){
                this.linkingSelection.removeChild(this.linkingSelection.firstChild);
            }
            // Add data
            var commitData = this.commitStore.getSelectedData();
            if (commitData.length > 0){
                for(var i=0; i < commitData.length; i++){
                    domConstruct.create("option", {value: commitData[i].id, innerHTML: commitData[i].title, commit_id: commitData[i].id}, this.linkingSelection);
                }
                this._disableSaveButton(false);
            } else {
                this._disableSaveButton(true);
            }
            
        },

        _disableSaveButton: function(state){
            if (this._dialogContainer){
                query(".saveBtn", this._dialogContainer.domNode).attr("disabled", state);
            }
        },

        _createInteractionSector: function(content){
            var sector = domConstruct.create("div", {style:{ cssFloat: "left", textAlign: "center", height: this.selectionHeight, paddingLeft: "10px", paddingRight:"10px"}}, content);
            var pane = domConstruct.create("div", {style:{border:"1px solid black", padding:"5px", position:"relative", top:"50%", transform:"translateY(-50%)"}}, sector);
            this._createExchangeButtons(pane);
            domConstruct.create("br", {}, pane);
            domConstruct.create("br", {}, pane);
            this._createSortButtons(pane);
        },

        _createExchangeButtons: function(pane){
            domConstruct.create("button", {innerHTML: "<--", className: "secondary-button removeBtn"}, pane);
            domConstruct.create("button", {innerHTML: "-->", className: "secondary-button addBtn"}, pane);
        },

        _createSortButtons: function(pane){
            domConstruct.create("button", {sortDesc: 0, className: "secondary-button sortBtn"}, pane);
        },

        _createFilterButtons: function(pane){
            var borderPane = domConstruct.create("div", {style:{padding:"5px"}}, pane);
            domConstruct.create("label", {innerHTML:"Filter: "}, borderPane);
            var input = domConstruct.create("div", {}, borderPane);
            new TextBox({
                className: "filterField",
                style: "width:150px",
                value: "",
                placeHolder: "Filtery by title or author"
            }, input);
        },

        _createButtonPart: function(content){
            domConstruct.create("br", {}, content);
            var pane = domConstruct.create("div", {style:{ cssFloat: "right", textAlign: "center"}}, content);
            domConstruct.create("button", {innerHTML: "Link the commits", className: "primary-button saveBtn", disabled: "true", style:{}}, pane);
            domConstruct.create("button", {innerHTML: "Cancel", className: "secondary-button cancelBtn", style:{marginLeft:"5px"}}, pane);
        },

        _buildDialog: function(content){
            this._dialogContainer = new Dialog({
                title: "Commit Selection",
                content: content,
                style: "width: auto; height: auto; padding-bottom: 10px; background: white;",
                onCancel: function() {
                    this.destroyRecursive(false);
                }
                });
            this._dialogContainer.startup();
            this._dialogContainer.show();
        },

        _getSelectedGivenCommits: function(){
            var selectedItems = [];
            for(var i=0; i < this.givenSelection.length; i++){
                if(this.givenSelection[i].selected){
                    selectedItems.push(this.givenSelection[i]);
                }
            }
            return selectedItems;
        },

        _getSelectedLinkedCommits: function(){
            var selectedItems = [];
            for(var i=0; i < this.linkingSelection.length; i++){
                if(this.linkingSelection[i].selected){
                    selectedItems.push(this.linkingSelection[i]);
                }
            }
            return selectedItems;
        },

        getCommitsToLink: function(){
            return this.commitStore.getSelectedData();
        },

        closeDialog: function(){
            this._dialogContainer.destroy();
        },

        addLogic: function(){
            var commits = this._getSelectedGivenCommits();
            this.commitStore.addToSelection(commits);
            this.redrawCommits();
        },

        removeLogic: function(){
            var commits = this._getSelectedLinkedCommits();
            this.commitStore.removeFromSelection(commits);
            this.redrawCommits();
        },

        sortLogic: function(){
            this.commitStore.toggleSortDirection();
            this.redrawCommits();
        },

        // We can enhance this logic by adding various field types
        filterLogic: function(filterValue){
            filterValue = filterValue.trim();
            if(filterValue == ""){
                this.commitStore.resetFilter();
            } else {
                var fieldTypes = ["title", "author_email", "committer_email"];
                this.commitStore.filterMemory(fieldTypes, filterValue);
            }
            this.redrawCommits();
        },
    });
});