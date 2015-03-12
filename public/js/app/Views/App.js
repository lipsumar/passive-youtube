define([
	'jquery',
	'backbone',
	'app/Views/YouTubeSearch',
	'app/Views/YouTubePlayer',
	'app/Collections/VideoQueue',
	'app/Models/Video',
], function($, Backbone, YouTubeSearchView, YouTubePlayerView, VideoQueue, VideoModel){

	return Backbone.View.extend({
		initialize: function(){
			this.firstVideoIn = true;
			this.sessionId = this.generateSessionId();
			console.log('sessionId', this.sessionId);
			this.initQueue();

			// create YouTubeSearch and YouTubePlayer just to load the API
			this.youTubeSearch = new YouTubeSearchView();
			this.youTubePlayer = new YouTubePlayerView();

			this.listenTo(this, 'allApisReady', _.bind(this.allApisReady, this));
			this.loadApis();


			this.listenTo(this.youTubeSearch, 'foundVideo', this.addVideoToQueue);
			this.listenTo(this.queue,'add', this.videoIn);
			this.listenTo(this.queue,'add', this.storeQueueInLocalStorage);


			this.jingleId = 1;

			$(window).on('resize', _.debounce(this.onWindowResize,200));
			this.onWindowResize();

			this.showJingle();


		},

		initQueue: function(){
			var stored = (window.localStorage && window.localStorage.getItem('PY_queue')) || null;
			if(stored) stored = JSON.parse(stored);
			if(stored && stored.length>800){
				stored = [];
			}
			this.queue = new VideoQueue(stored);
			console.log('starting queue with '+this.queue.length+' item(s)');

		},

		storeQueueInLocalStorage: function(){
			if(!window.localStorage) return;
			window.localStorage.setItem('PY_queue', JSON.stringify(this.queue.toJSON()));
		},

		generateSessionId: function(){
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				return v.toString(16);
			});
		},

		loadApis: function(){
			this.listenToOnce(this.youTubeSearch, 'api:ready', _.bind(this.apiLoaded, this));
			this.listenToOnce(this.youTubePlayer, 'api:ready', _.bind(this.apiLoaded, this));
			this.youTubeSearch.loadApi();
			this.youTubePlayer.loadApi();
		},

		apiLoaded: function(){
			if(this.youTubeSearch.apiReady && this.youTubePlayer.apiReady){
				this.trigger('allApisReady');
			}
		},

		allApisReady: function(){
			console.log('ALL APIs Ready');
			this.youTubeSearch.findRandom();
		},

		onWindowResize: function(){

			$('#app>*,.jingle').css({
				width: '100%',
				height: $(window).height()
			});

		},



		/**
		 * Called when the YouTubeSearch found a video
		 * Responsible for creating video model and filtering out duplicates
		 * @param {string} videoId
		 */
		addVideoToQueue: function(videoId){
			var video = new VideoModel({id:videoId});
			if(!this.queue.get(videoId)){
				this.queue.add(video);
			}else{
				console.log('found video already in queue');
				this.youTubeSearch.findRandom();
			}

		},

		/**
		 * This is called when video has been added to the queue.
		 * Responsible for creating a player (and player div) and start preloading the video
		 * @return {void}
		 */
		videoIn: function(video){

			console.log('>> videoIn '+video.id);

			var firstVideoIn = this.firstVideoIn;
			this.firstVideoIn = false;

			var elementId = 'YTPlayer-'+video.cid;
			this.$el.prepend('<div id="'+elementId+'" class="YTPlayer"></div>');
			video.player = new YouTubePlayerView({
				el: $('#'+elementId),
				video: video,
				//elementId: elementId
			});
			this.listenToOnce(video.player, 'ready', _.bind(function(){
				console.log('video is READY');
				if(video.player.duration < 15){
					console.log('TOO SHORT', video.id);
					//too short, rejected
					video.player.remove();
					video.set('tooShort', true);//in case we want to display the list of played videos
					this.youTubeSearch.findRandom();
					return;

				}

				if(firstVideoIn){
					this.setCurrentVideo(video);

					//video.player.seekToAlmostStart();
					video.player.YTPlayer.unMute();
					console.log('play()');
					video.player.play();

					// setTimeout(function(){
					// 	video.player.seekToAlmostStart();
					// 	video.player.play();
					// }, 2000);

					this.hideJingle();

					window.video = video;
				}else{
					video.player.preload();
				}
			},this));

			this.listenToOnce(video.player, 'error', function(){
				//error, rejected
				window.location.reload();
				//video.player.remove();
				//video.set('error', true);
				//this.youTubeSearch.findRandom();
			});

			this.listenToOnce(video.player, 'almostEnd', _.bind(this.videoAlmostEnd, this));

			video.player.createPlayer();

			if(firstVideoIn){
				this.youTubeSearch.findRandom();
			}



		},

		setCurrentVideo: function(video){
			this.currentVideo = video;
			/*$.getJSON('server/sessionPost.php', {
				session: this.sessionId,
				video: video.id
			});*/
		},

		videoAlmostEnd: function(tryCount){
			tryCount = typeof(tryCount)==='number' ? tryCount : 1;
			var nextVideo = this.queue.last();

			if(nextVideo.id === this.currentVideo.id){
				console.warn('we dont have a next video !');
				if(tryCount>20){
					window.location.reload();
					return;
				}
				setTimeout(_.bind(this.videoAlmostEnd,this, tryCount+1), 1000);
				return;
			}

			if(nextVideo.player.preloaded){
				// next video is super ready
				nextVideo.player.play();
				this.youTubeSearch.findRandom();
				this.blinkCurrentVideo();
				this.showJingle();
				setTimeout(_.bind(this.stopCurrentVideo, this, nextVideo), 3000);
			}else{
				console.warn('next video not preloaded');
				if(tryCount>70){
					window.location.reload();
					return;
				}
				setTimeout(_.bind(this.videoAlmostEnd,this, tryCount+1), 1000);

			}
		},

		blinkCurrentVideo: function(){
			this.currentVideo.player.blink();//$el.addClass('blink');
		},

		stopCurrentVideo: function(nextVideo){
			this.hideJingle();
			this.currentVideo.player.stop();
			var lastVideo = this.currentVideo;
			this.setCurrentVideo(nextVideo);
			lastVideo.player.remove();
		},



		hideJingle: function(){
			$('#jingle'+this.jingleId).hide();
			this.jingleId = Math.round(Math.random()*2);
			$('#loading').hide();
		},

		showJingle: function(){
			$('#jingle'+this.jingleId).show();
		}
	});

});