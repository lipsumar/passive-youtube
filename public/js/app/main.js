requirejs.config({
    //By default load any module IDs from js/
    baseUrl: 'js/bower_components',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
		'jquery': 'jquery/dist/jquery',
		'backbone': 'backbone-amd/backbone',
		'underscore': 'underscore/underscore',
		'tpl': 'requirejs-tpl/tpl',
		'app': '../app'
    }
});

require([
	'jquery',
	'backbone',
	'app/Views/App'
], function($, Backbone, App){

	window.App = new App({
		el: $('#app')
	});



});