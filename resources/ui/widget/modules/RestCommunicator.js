define(["dojo/_base/declare",
		"dojo/Deferred",
		"dojo/request/xhr",
], function (declare, Deferred, xhr){
	return declare(null, {
		
		/**** REQUEST - INFO ***
		 * XHR POST Request.
		 * @param {String} service - Mostly this contains a HOST + SERVICE (E.g. localhost/myService.json)
		 * @param {object} parameter - If your request needs to be parameterized, use a key/value object to automatically add it to the request.
		 * @param {object} header - Key/Value object which will be inserted to the request.
		 * Request specific headers you could set to change the request behaviour:
		 * 		-isSychron (Default: false)
		 * 			-False: Non blocking asynchronous requests
		 * 			-True: BLOCKING synchronous requests
		 * 		-preventCache (Default: false)
		 * 			-False: Nothing happens
		 * 			-True: A parameter will be added to the request to advice the server to NOT send cached values
		 * 		-handleAs: (Default: text)
		 * 			-Standard handlers are: text, json, javascript and xml
		 * 			-More info and how to create your own handlers are found here: "dojo/request/handlers"
		 * 
		 * @return {object : deferred} deferred - A dojo object which allows easier asynchronous handling.
		 * 		How to use it:
		 *		x.getRequest(service, requestParams, requestHeader).then(function(success){
		 *		}, function(error){
		 *		});
		 ******/
		
		getRequest: function(service, parameter, header){
			var request = this._buildRequestUrl(service, parameter);
			return this._xhrRequest(request, header, "GET");
		},
		
		postRequest: function(service, parameter, header){
			var request = this._buildRequestUrl(service, parameter);
			return this._xhrRequest(request, header, "POST");
		},
		
		putRequest: function(service, parameter, header){
			var request = this._buildRequestUrl(service, parameter);
			return this._xhrRequest(request, header, "PUT");
		},
		
		delRequest: function(service, parameter, header){
			var request = this._buildRequestUrl(service, parameter);
			return this._xhrRequest(request, header, "DELETE");
		},
		
		_xhrRequest: function(request, header, method){
			if(!header) header = {};
			var deferred = new Deferred();
			xhr(request, {
				method: method,
				headers: header,
				handleAs: (header.handleAs) ? header.handleAs : "text",
				preventCache: (header.preventCache) ? header.preventCache : false,
				sync: (header.isSychron) ? header.isSychron : false,
			}).then(function(response){
				deferred.resolve(response);
			}, function(error){
				deferred.reject(error);
			});
			return deferred;
		},
		
		_buildRequestUrl: function(service, parameters){
			if(!parameters) return service;
			var request = service;
			var paramKeys = Object.keys(parameters);
			for(var i=0; i < paramKeys.length; i++){
				if(i==0){
					request += "?";
				} else {
					request += "&";
				}
				request += paramKeys[i];
				request += "=";
				request += parameters[paramKeys[i]];
			}
			return request;
		},
	});
});