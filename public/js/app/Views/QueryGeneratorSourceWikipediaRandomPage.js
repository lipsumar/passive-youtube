define(['jquery','app/Views/QueryGeneratorSourceBase'], function($, QueryGeneratorSourceBase){

	var myFunc = function(){
		console.log('CONVERTER', arguments);
	};

	return QueryGeneratorSourceBase.extend({

		initialize: function(){
			QueryGeneratorSourceBase.prototype.initialize.call(this);
			this.fetchRandomPage();
		},

		fetchRandomPage: function(){
			//console.log('FETCH WIKIPEDIA', this._queriesToReturn.length);
			$.ajax({
				url: 'http://en.wikipedia.org/w/api.php?action=query&generator=random&prop=extracts&exchars=500&format=json',
				dataType: 'jsonp',
				success: _.bind(function(resp){

					var page = _.find(resp.query.pages, function(){return true;});

					if(page && page.title && !this._queryIsInToReturn(page.title) && page.title.substr(0,9)!=='User talk'){
						//console.log('FETCH WIKIPEDIA', page.title);
						this._storeQueryToReturn(page.title);
					}

				},this),
				complete: _.bind(this.onQueryReturn,this)
			});
		},

		onQueryReturn: function(){
			if(this._queriesToReturn.length<3){
				setTimeout(_.bind(this.fetchRandomPage,this),2000);
			}
		}

	});

});