define(["dojo/_base/declare",
        "dojo/_base/lang",
        "../../modules/RestCommunicator"
], function (declare, lang, RestCommunicator){
	return declare(null, {
		
		linkTypeContainer: {
			displayName: "Git Commits",
			endpointId: "gitcommit",
			id: "com.ibm.team.git.workitem.linktype.gitCommit",
			isSource: false,
			linkDTOs: [],
		},
		
		//TODO THIS IS FOR LOCAL TEST
//		linkTypeContainer: {
//			displayName: "Related Artifacts",
//			endpointId: "relatedArtifact",
//			id: "com.ibm.team.workitem.linktype.relatedartifact",
//			isSource: false,
//			linkDTOs: [],
//		},
		
		generateRTCLinks: function(linksToSave, commits){
			var linkContainer = this.getLinkTypeContainer(linksToSave);
			linkContainer = this.generateLinkDTOContainer(linkContainer, commits);
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
				return linkContainers[typeIndex]
			}
		},
		
		findIndexOfLinkType: function(linkTypeArray){
			for(var i=0; i < linkTypeArray.length; i++){
				if(linkTypeArray[i].id == this.linkTypeContainer.id) return i;
			}
			return -1;
		},
		
		generateLinkDTOContainer: function(linkTypeContainer, commits){
			for(var i=0; i < commits.length; i++){
				var link = this.generateLink(commits[i]);
				linkTypeContainer.linkDTOs.push(link);
			}
        	return linkTypeContainer;
		},
		
		generateLink: function(commit){
			var linkTitle = commit.title + " [@" + commit.short_id + "]";
			var linkDTO = {
				_isNew: true,
				comment: linkTitle,
				url: commit.url,
			};
			return linkDTO;
		},
	});
});