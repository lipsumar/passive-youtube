define(['backbone','app/Views/QueryGeneratorSourceSimple','app/Views/QueryGeneratorSourceWikipediaRandomPage'], function(Backbone, QueryGeneratorSourceSimple, QueryGeneratorSourceWikipediaRandomPage){

	return Backbone.View.extend({

		initialize: function(){
			this.sources = [
				new QueryGeneratorSourceSimple(),
				new QueryGeneratorSourceWikipediaRandomPage(),
			];
		},

		/**
		 * Sync method to get a fresh query immediatly
		 * @return {string} The query
		 */
		getNewQuery: function(){

			// get a source
			var source = this.getRandomSource();

			// is source ready to give a sync query ?
			if(!source.hasNewSync()){
				// get a sync source
				source = this.getRandomSyncSource();
			}

			// return source.getSync
			return source.getNewSync();

		},


		getRandomSource: function(){
			return this.sources[Math.round(Math.random()*(this.sources.length-1))];
		},

		getRandomSyncSource: function(){
			var shuffledSources = _.shuffle(this.sources);
			return _.findWhere(shuffledSources, {isSync:true});
		}
	});

});