define(['app/Views/QueryGeneratorSourceBase'], function(QueryGeneratorSourceBase){
	var alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
	return QueryGeneratorSourceBase.extend({

		minimumQueryLength: 1,
		maximumQueryLength: 5,

		initialize: function(){
			QueryGeneratorSourceBase.prototype.initialize.call(this);
			this.isSync = true;
		},

		/**
		 * Returns a new query (a query that was never returned before) syncronously
		 * @return {string} The new query
		 */
		getNewSync: function(){
			var query;
			while(true){
				query = this._generateQuery();
				if(!this._queryWasReturned(query)) break;
			}

			this._storeReturnedQuery(query);

			return query;

		},

		/**
		 * The actual generator function
		 * @return {string} A query
		 */
		_generateQuery: function(){
			var l = Math.floor(Math.random()* this.maximumQueryLength-this.minimumQueryLength ) + this.minimumQueryLength,
				str='';
			for(var i=0;i<l;i++){
				str+=_.shuffle(alphabet)[0];
			}
			return str;
		}
	});

});