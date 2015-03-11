define(['backbone'], function(Backbone){

	return Backbone.View.extend({

		initialize: function(){

			/**
			 * Is this generatorSource syncronous (can return immediatly)
			 * @type {Boolean}
			 */
			this.isSync = false;
			/**
			 * Contains all queries returned.
			 * @type {Array}
			 */
			this._queriesReturned = [];

			/**
			 * Contains queries ready to be returned.
			 * @type {Array}
			 */
			this._queriesToReturn = [];

		},







		/**
		 * Returns a new query (a query that was never returned before) syncronously
		 * @return {string} The new query
		 */
		getNewSync: function(){
			var query = this._queriesToReturn.shift();
			if(!query) throw 'Called getNewSync on a async generatorSource that did not hasNewSync. Always call hasNewSync first.';
			this._storeReturnedQuery(query);
			if(this.onQueryReturn) this.onQueryReturn();
			return query;
		},

		hasNewSync: function(){
			return this.isSync ? true : (this._queriesToReturn.length>0);
		},

		/**
		 * Returns true if the given query has already been returned
		 * @param  {string} query
		 * @return {boolean}
		 */
		_queryWasReturned: function(query){
			return _.contains(this._queriesReturned, query);
		},


		_storeReturnedQuery: function(query){
			this._queriesReturned.push(query);
		},

		_storeQueryToReturn: function(query){
			this._queriesToReturn.push(query);
		},

		_queryIsInToReturn: function(query){
			return _.contains(this._queriesToReturn, query);
		}

	});

});