define(["dojo/_base/declare",
], function (declare){
    return declare(null, {

        getCurrentBaseUrl: function(){
            var server = window.location.origin;
            var application = window.location.pathname.split("/")[1];
            return server + "/" + application + "/";
        },

        buildRepoObject: function(selectedRepo){
            var repoObject = this.getUrlRepoParts(selectedRepo.url);
            repoObject.name = selectedRepo.name;
            repoObject.repoKey = selectedRepo.key;
            repoObject.repoLocation = repoObject.server + decodeURIComponent(repoObject.repo);
            return repoObject;
        },

        getUrlRepoParts: function(url){
            var searchTerm = "://";
            var prefixIdx = url.indexOf(searchTerm) + searchTerm.length;

            var prefix = url.slice(0, prefixIdx);
            url = url.slice(prefixIdx);

            searchTerm = "/";
            var serverIdx = url.indexOf(searchTerm) + searchTerm.length;
            var repo = encodeURIComponent(url.slice(serverIdx));

            // Check for .git Ending
            searchTerm = ".git";
            var checkSum = repo.lastIndexOf(searchTerm) + searchTerm.length;
            if(repo.length <= checkSum) repo = repo.slice(0, repo.lastIndexOf(searchTerm));

            var repoParts = {
                    server: prefix + url.slice(0, serverIdx),
                    repo: repo,
            };
            return repoParts;
        },

        generateCommitUrl: function(commitsToLink, gitLabUrl){
            for(var i=0; i < commitsToLink.length; i++){
                var commit = commitsToLink[i];
                commit.url = gitLabUrl + "/commit/" + commit.id
            }
            return commitsToLink;
        },
        
    });
});