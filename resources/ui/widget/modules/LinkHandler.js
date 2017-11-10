define(["dojo/_base/declare",
        "dojo/json",
        "dojo/_base/lang",
        "./RestCommunicator"
], function (declare, json, lang, RestCommunicator){
    return declare(null, {

        linkTypeContainer: {
            displayName: "Git Commits",
            endpointId: "gitcommit",
            id: "com.ibm.team.git.workitem.linktype.gitCommit",
            isSource: false,
            linkDTOs: [],
        },

        constructor: function(){
            // This linkTypeContainer is only used when there aren't any git links.
            // It needs to be cleared manually to fix a bug where it was keeping deleted links.
            this.linkTypeContainer.linkDTOs = [];
        },

        generateRTCLinks: function(linksToSave, commits, repoKey, baseUrl){
            var linkContainer = this.getLinkTypeContainer(linksToSave);
            linkContainer = this.generateLinkDTOContainer(linkContainer, commits, repoKey, baseUrl);
            linksToSave = this.setLinkTypeContainer(linkContainer, linksToSave);
            var linkSaveObject = {
                    path: ["linkTypes"],
                    value: linksToSave,
            };
            return linkSaveObject;
        },

        setLinkTypeContainer: function(linkContainer, linkContainers){
            var typeIndex = this.findIndexOfLinkType(linkContainers);
            if(typeIndex == -1){
                linkContainers.push(linkContainer);
            } else {
                linkContainers[typeIndex] = linkContainer;
            }
            return linkContainers;
        },

        getLinkTypeContainer: function(linkContainers){
            var typeIndex = this.findIndexOfLinkType(linkContainers);
            if(typeIndex == -1){
                return this.linkTypeContainer;
            } else {
                return linkContainers[typeIndex];
            }
        },

        findIndexOfLinkType: function(linkTypeArray){
            for(var i=0; i < linkTypeArray.length; i++){
                if(linkTypeArray[i].id == this.linkTypeContainer.id) return i;
            }
            return -1;
        },

        generateLinkDTOContainer: function(linkTypeContainer, commits, repoKey, baseUrl){
            for(var i=0; i < commits.length; i++){
                var link = this.generateLink(commits[i], repoKey, baseUrl);
                linkTypeContainer.linkDTOs.push(link);
            }
            return linkTypeContainer;
        },

        generateLink: function(commit, repoKey, baseUrl){
            var linkTitle = commit.title + " [@" + commit.short_id + "]";
            var linkDTO = {
                _isNew: true,
                comment: linkTitle,
                url: this._generateLinkUrl(commit, repoKey, baseUrl),
            };
            return linkDTO;
        },

        // Creates a URL to the internal service. The URL contains all the information about the commit.
        // This is needed for the rich hover to work. The service redirects to the commit when clicked.
        _generateLinkUrl: function(commit, repoKey, baseUrl){
            var jsonString = json.stringify({ 
                c: commit.message,
                d: commit.created_at,
                e: commit.committer_email,
                k: repoKey,
                n: commit.committer_name,
                s: commit.id,
                u: commit.url,
            });
            var encodedString = com_siemens_bt_jazz_gitlab_encoding_helper.encode(jsonString);
            var urlToCommit = baseUrl + "com.ibm.team.git.internal.resources.IGitResourceRestService/commit?value=" + encodedString;
            return urlToCommit;
        },
    });
});