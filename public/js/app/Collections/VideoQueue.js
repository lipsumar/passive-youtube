define(['backbone','app/Models/Video'], function(Backbone, VideoModel){

	return Backbone.Collection.extend({
		model: VideoModel
	});

});