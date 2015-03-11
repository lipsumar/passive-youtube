define([
	'jquery',
	'backbone'
], function($, Backbone){

	return Backbone.View.extend({
		initialize: function(options){
			this.options = options || {};
			this.video = this.options.video;
		},

		createPlayer: function(){
			this.YTPlayer = new YT.Player(this.el.id, {
				width: '100%',
				height: $(window).height(),
				//width: 370,
				//height: 200,

				videoId: this.video.id,
				events:{
					onReady: _.bind(this.onPlayerEarlyReady,this),
					onError: _.bind(this.onPlayerError, this),
					onStateChange: _.bind(this.onPlayerStateChange, this)
				},
				playerVars: {
					'rel': 0,
					'modestbranding': 1,
					'color': 'white',
					'controls' : 0,
					'showinfo' : 0,
					'iv_load_policy' : 3,
					'origin' : location.origin,
				}
			});
			//console.log('QUALITY',this.YTPlayer.getPlaybackQuality());
			//this.YTPlayer.setPlaybackQuality('medium');
		},

		onPlayerEarlyReady: function(){
			if(this.YTPlayer.getDuration()===0){
				console.log('need for pre-preloading');
				// no duration yet, need to play the video
				this.YTPlayer.mute();
				this.YTPlayer.playVideo();
				var player = this.YTPlayer,
					that = this;
				function checkDuration(){
					var dur = player.getDuration();
					if(!dur){
						setTimeout(checkDuration, 100);
					}else{
						console.log('pause video');
						player.pauseVideo();
						player.unMute();
						that.onPlayerReady();
					}
				}
				setTimeout(checkDuration, 200);
			}else{
				console.log('no need for pre-preloading');
				this.onPlayerReady();
			}
		},

		onPlayerReady: function(){
			console.log('onPlayerReady');
			var duration = this.YTPlayer.getDuration();

			if(!duration){
				alert('no duration bug');
				return;
			}

			this.duration = this.YTPlayer.getDuration();
			this.almostStartTime = this.duration*0.2;
			this.almostEndTime = this.duration*0.2 +10;


			this.$el = $('#'+this.el.id);
			this.el = this.$el[0];


			this.YTPlayer.setPlaybackQuality('small');

			this.trigger('ready');


		},

		onPlayerStateChange: function(event){
			// this fix a bug where the video would play from the beginning
			// and not
			if(event.data == YT.PlayerState.PLAYING && this.currentTimeIsBeforeAlmostStart()){
				this.seekToAlmostStart();
			}
			if (event.data == YT.PlayerState.BUFFERING) {
				event.target.setPlaybackQuality('small');
			}
			if(event.data == YT.PlayerState.ENDED && this.video.id===App.currentVideo.id){
				//window.location.reload();
			}
		},

		onPlayerError: function(){
			//alert('error');
			this.trigger('error');
		},

		preload: function(){
			this.YTPlayer.mute();
			this.YTPlayer.playVideo();

			this.YTPlayer.seekTo(this.almostStartTime);
			// setTimeout(_.bind(function(){
			// 	this.YTPlayer.seekTo(this.almostStartTime);
			// },this), 2000);


			this.checkForPreloadReady();
		},

		currentTimeIsBeforeAlmostStart: function(){
			return this.YTPlayer.getCurrentTime() < this.almostStartTime;
		},

		checkForPreloadReady: function(){
			if(this.YTPlayer.getCurrentTime() >= this.almostStartTime+1){
				//console.log('>>>> preload ready');
				this.YTPlayer.pauseVideo();
				this.YTPlayer.unMute();
				this.preloaded = true;
				this.trigger('preloaded');
			}else{
				setTimeout(_.bind(this.checkForPreloadReady, this), 500);
			}
		},


		play: function(){
			this.YTPlayer.playVideo();
			this.checkForAlmostEndTime();
		},


		checkForAlmostEndTime: function(){
			if(this.YTPlayer.getCurrentTime()>=this.almostEndTime){
				this.trigger('almostEnd');
			}else{
				setTimeout(_.bind(this.checkForAlmostEndTime, this), 500);
			}
		},

		stop: function(){
			this.YTPlayer.stopVideo();
		},





		seekToAlmostStart: function(){
			this.YTPlayer.seekTo(this.almostStartTime, true);
		},


		loadApi: function(){
			if(window.YT && window.YT.Player){
				this.apiReady = true;
			}else{
				window.onYouTubeIframeAPIReady = _.bind(this.onYouTubeIframeAPIReady,this);
				var tag = document.createElement('script');
				tag.src = "https://www.youtube.com/iframe_api";
				var firstScriptTag = document.getElementsByTagName('script')[0];
				firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			}
		},

		onYouTubeIframeAPIReady: function(){
			this.apiReady = true;
			this.trigger('api:ready');
			console.log('onYouTubeIframeAPIReady :)');
		},

		blink: function(d){
			d = typeof(d) !== 'boolean' ? false : d;
			this.$el.toggleClass('hidden',d);

			if(!this.stopBlink){
				setTimeout(_.bind(this.blink, this, !d), 200);
			}
		},


		remove: function(){
			this.stopBlink = true;
			$('#'+this.el.id).remove();
			this.player = null;
			Backbone.View.prototype.remove.apply(this, arguments);
		}
	});

});