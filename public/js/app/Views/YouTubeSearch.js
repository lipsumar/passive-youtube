define(['jquery','backbone','app/Views/QueryGenerator'], function($, Backbone, QueryGenerator){

	return Backbone.View.extend({

		initialize: function(){
			this.queryGenerator = new QueryGenerator();
		},

		findRandom: function(){
			var that = this;
			this.requesting = true;
			var query = this.generateQuery();

			var request = gapi.client.youtube.search.list({
				q: query,
				maxResults: 1,
				type: 'video',
				videoDuration: 'short',
				videoEmbeddable: 'true',
				videoSyndicated: 'true',
				regionCode: 'BE',
				part: 'id',
				key: 'AIzaSyDofeQWY01hne73-Vrbp8vfjBRXcZFWLOo'
			});

			request.execute(function(resp){
				that.requesting = false;

				if(resp.result.items && resp.result.items[0]){
					// found !
					var videoId = resp.result.items[0].id.videoId;
					console.log('found video', videoId);
					that.trigger('foundVideo', videoId);
				}else{
					// not found
					console.log('no video found, retrying');
					that.findRandom();
				}
			});
		},

		generateQuery: function(){
			return this.queryGenerator.getNewQuery();
		},

		loadApi: function(){
			var that = this;
			window.googleApiClientReady = function(){
				console.log('Google API ready');

				gapi.auth.init(function(){
					gapi.client.load('youtube', 'v3', function() {
						console.log('youtube api ready');
						that.apiReady = true;
						that.trigger('api:ready');
					});
				});
			};

			this.insertScript('https://apis.google.com/js/client.js?key=AIzaSyDofeQWY01hne73-Vrbp8vfjBRXcZFWLOo&onload=googleApiClientReady');
		},

		insertScript: function(url){
			var sc = document.createElement('script');
			sc.src = url;
			$('head').append(sc);
		}

	});

});