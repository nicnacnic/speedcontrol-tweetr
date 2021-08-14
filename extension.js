const TwitterClient = require('twitter-api-client').TwitterClient;
const TwitterMedia = require('twitter-media');
const fs = require('fs');
const path = require('path');
let buttonTimer;
const speedcontrolBundle = 'nodecg-speedcontrol';

module.exports = function (nodecg) {
	const tweetData = nodecg.Replicant('tweetData', { defaultValue: {} })
	const runDataActiveRun = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);
	const runDataArray = nodecg.Replicant('runDataArray', speedcontrolBundle);
	const runDataActiveRunSurrounding = nodecg.Replicant('runDataActiveRunSurrounding', speedcontrolBundle)
	const runFinishTimes = nodecg.Replicant('runFinishTimes', speedcontrolBundle);
	const mediaData = nodecg.Replicant('assets:media')
	const selectedRunId = nodecg.Replicant('selectedRunId');
	const countdownTimer = nodecg.Replicant('countdownTimer', { persistent: false, defaultValue: { countdownActive: false, cancelTweet: false, sendTweet: false, countdown: -1 } })

	const twitterClient = new TwitterClient({
		apiKey: nodecg.bundleConfig.apiKey,
		apiSecret: nodecg.bundleConfig.apiSecret,
		accessToken: nodecg.bundleConfig.accessToken,
		accessTokenSecret: nodecg.bundleConfig.accessTokenSecret,
	});

	const twitterMedia = new TwitterMedia({
		consumer_key: nodecg.bundleConfig.apiKey,
		consumer_secret: nodecg.bundleConfig.apiSecret,
		token: nodecg.bundleConfig.accessToken,
		token_secret: nodecg.bundleConfig.accessTokenSecret,
	})

	setTimeout(() => {
		clearInterval(buttonTimer);
		countdownTimer.value = { countdownActive: false, cancelTweet: false, sendTweet: false, countdown: -1 }
	}, 1000)

	runDataArray.on('change', (newVal) => syncArrays(newVal, tweetData.value));
	runDataActiveRun.on('change', (newVal) => startCountdown(newVal));
	countdownTimer.on('change', (newVal) => {
		if (newVal.sendTweet)
			sendTweet();
		else if (newVal.cancelTweet)
			cancelTweet();
	})

	function syncArrays(runArray, tweetArray) {
		let updatedArray = {};
		runArray.forEach(run => {
			if (tweetArray[run.id] === undefined)
				updatedArray[run.id] = { game: run.game, content: '', media: 'None' };
			else if (tweetArray[run.id] !== undefined)
				updatedArray[run.id] = tweetArray[run.id];
		})
		tweetData.value = updatedArray;
	}

	function startCountdown(run) {
		clearInterval(buttonTimer);
		switch (run) {
			case undefined: selectedRunId.value = runDataArray.value[0].id; break;
			default: selectedRunId.value = run.id; break;
		}
		let time = parseFloat(nodecg.bundleConfig.tweetDelay / 1000);
		countdownTimer.value = { countdownActive: true, cancelTweet: false, sendTweet: false, countdown: time }
		buttonTimer = setInterval(() => {
			time--;
			countdownTimer.value.countdown = time;
			if (time <= 0) {
				countdownTimer.value.countdownActive = false;
				countdownTimer.value.countdown = -1;
				countdownTimer.value.sendTweet = true;
			}
		}, 1000)
	}

	function sendTweet() {
		clearInterval(buttonTimer);
		let data = tweetData.value[selectedRunId.value];
		if (data.content.includes('!lastRunTime'))
			try { data.content = data.content.replace('!lastRunTime', runFinishTimes.value[runDataActiveRunSurrounding.value.previous].time) } catch { nodecg.log.warn('The last run either doesn\'t exist or doesn\'t have a final time.') }
		if (data.media !== undefined && data.media !== 'None')
			uploadMedia('./assets/speedcontrol-tweetr/media/' + data.media, (mediaId) => {
				twitterClient.tweets.statusesUpdate({ status: data.content, media_ids: mediaId }).catch(() => {
					nodecg.log.warn('Error posting tweet. Your tweet is either blank, invalid, or a duplicate.')
				});
			})
		else
			twitterClient.tweets.statusesUpdate({ status: data.content }).catch(() => {
				nodecg.log.warn('Error posting tweet. Your tweet is either blank, invalid, or a duplicate.')
			});
	}

	function cancelTweet() {
		clearInterval(buttonTimer);
		countdownTimer.value.countdownActive = false;
		countdownTimer.value.countdown = -1;
	}

	function uploadMedia(media, callback) {
		try {
			const promise = fs.promises.readFile(media);
			Promise.resolve(promise).then((buffer) => {
				if (media.includes('png') || media.includes('jpg') || media.includes('gif'))
					twitterMedia.uploadMedia('image', buffer, (media, mediaId) => callback(mediaId))
				else if (media.includes('mp4'))
					twitterMedia.uploadMedia('video', buffer, (media, mediaId) => callback(mediaId))
				else
					nodecg.log.warn('Media upload failed! Please use a valid file format (png, jpg, gif, mp4)')
			});
		} catch { nodecg.log.warn('Media upload failed! Your file is too big, or there is an invalid filename. (Hint: Make sure to remove spaces in your filename!)') }
	}
}