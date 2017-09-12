define(["dojo/_base/declare",
        "dojo/store/Memory",
        "dojo/_base/lang",
        "dojo/date/locale",
], function (declare, Memory, lang, locale){
	return declare(null, {
		
		commitData: null,
		commitDataFiltered: null,
		selectedCommits: null,
		linkedCommits: null,
		
		sortDescending: true,
		
		//Filter
		filterBy: null,
		filterValue: null,
		
		constructor: function(){
		},
		
		getCommitData: function(){
			return this.commitDataFiltered.data;
		},
		
		getSelectedData: function(){
			return this.selectedCommits.data;
		},
		
		setCommitData: function(commitData, selectedCommits){
			this._unifyDates(commitData);
			this.commitData = new Memory({data: lang.clone(commitData), idProperty: "id"});
			this.commitDataFiltered = new Memory({data: lang.clone(commitData), idProperty: "id"});
			this.selectedCommits =  new Memory({idProperty: "id"});
			this.linkedCommits = lang.clone(selectedCommits);
		},
		
		_unifyDates: function(commits){
			for(var i=0; i < commits.length; i++){
				var commit = commits[i];
				commit.committed_date = new Date(commit.committed_date);
			}
		},
		
		toggleSortDirection: function(){
			this.sortDescending = !this.sortDescending;
		},
		
		addToSelection: function(commitArray){
			for(var i=0; i < commitArray.length; i++){
				var commitId = commitArray[i].getAttribute("commit_id");
				if(this.checkIfCommitIsAlreadyLinked(commitId)) continue;
				var entity = this.commitData.get(commitId);
				if(!this.commitData.remove(commitId)) console.log("Add Problems remove commit");
				if(!this.commitDataFiltered.remove(commitId)) console.log("Add Problems remove filtered commit");
				this.selectedCommits.put(entity);
			}
		},
		
		removeFromSelection: function(commitArray){
			for(var i=0; i < commitArray.length; i++){
				var commitId = commitArray[i].getAttribute("commit_id");
				var entity = this.selectedCommits.get(commitId);
				if(!this.selectedCommits.remove(commitId)) console.log("Remove Problems");
				this.commitData.put(lang.clone(entity));
				this.commitDataFiltered.put(lang.clone(entity));
			}
			this.filterMemory(this.filterBy, this.filterValue);
			return this.commitData;
		},
		
		checkIfCommitIsAlreadyLinked: function(commitId){
			for(var i=0; i < this.linkedCommits.length; i++){
				if(this.linkedCommits[i].id == commitId) return true;
			}
			return false;
		},
		
		filterMemory: function(filterBy, filterValue){
			if(filterBy && filterValue){
				this.filterBy = filterBy;
				this.filterValue = filterValue;
				var filterValue = filterValue.toLowerCase();
				var result = this.commitData.query(function(object){
					var match = false;
					for(var i=0; filterBy.length > i; i++){
						var checkValue = object[filterBy[i]].toLowerCase();
						match = checkValue.indexOf(filterValue) != -1;
						if(match) break;
					}
					return match;
				});
				this.commitDataFiltered.setData(result);
			}
		},
		
		resetFilter: function(){
			this.commitDataFiltered.setData(lang.clone(this.commitData.data));
			this.filterBy = null;
			this.filterValue = null;
		},
		
		_sortMemory: function(){
			this.commitData.setData(this.commitData.query({}, {sort: [{attribute: "committed_date", descending: this.sortDescending}]}));
			this.commitDataFiltered.setData(this.commitDataFiltered.query({}, {sort: [{attribute: "committed_date", descending: this.sortDescending}]}));
			this.selectedCommits.setData(this.selectedCommits.query({}, {sort: [{attribute: "committed_date", descending: this.sortDescending}]}));
		},
	});
});