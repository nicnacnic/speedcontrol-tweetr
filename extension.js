const TwitterApiModule = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');
const Papa = require('./papaParse.min.js')
const fetch = require('node-fetch');
const FormData = require('form-data');
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
	const settings = nodecg.Replicant('settings', { defaultValue: { autoTweet: false, countdown: 60 } });
	const countdownTimer = nodecg.Replicant('countdownTimer', { persistent: false, defaultValue: { countdownActive: false, cancelTweet: false, sendTweet: false, countdown: null } })

	const twitterClient = new TwitterApiModule.TwitterApi({
		appKey: nodecg.bundleConfig.apiKey,
		appSecret: nodecg.bundleConfig.apiSecret,
		accessToken: nodecg.bundleConfig.accessToken,
		accessSecret: nodecg.bundleConfig.accessTokenSecret,
	});

	runDataArray.on('change', (newVal) => syncArrays(newVal, tweetData.value));
	runDataActiveRun.on('change', (newVal, oldVal) => startCountdown(newVal, oldVal));
	selectedRunId.on('change', (newVal) => {
		if (countdownTimer.value.countdownActive) countdownTimer.value.cancelTweet = true;
	})

	nodecg.listenFor('sendTweet', () => sendTweet())
	nodecg.listenFor('cancelTweet', () => cancelTweet())
	nodecg.listenFor('exportCSV', (value, callback) => createCSV(callback))
	nodecg.listenFor('inportCSV', (value, callback) => inportCSV(value, callback))

	function syncArrays(runArray, tweetArray) {
		let updatedArray = {};
		runArray.forEach(run => {
			if (tweetArray[run.id] === undefined) updatedArray[run.id] = { game: run.game, category: run.category, content: '', media: null };
			else updatedArray[run.id] = tweetArray[run.id];
		})
		tweetData.value = updatedArray;
	}

	function startCountdown(newVal, oldVal) {
		clearInterval(buttonTimer);
		if (!oldVal || newVal.id == oldVal.id) return;
		switch (newVal) {
			case undefined: selectedRunId.value = runDataArray.value[0].id; break;
			default: selectedRunId.value = newVal.id; break;
		}
		let time = settings.value.countdown;
		if (!settings.value.autoTweet) return;
		countdownTimer.value = { countdownActive: true, cancelTweet: false, sendTweet: false, countdown: time }
		buttonTimer = setInterval(() => {
			time--;
			countdownTimer.value.countdown = time;
			if (time <= 0) sendTweet();
		}, 1000)
	}

	async function sendTweet() {
		clearInterval(buttonTimer);
		let data = tweetData.value[selectedRunId.value];
		countdownTimer.value = { countdownActive: false, sendTweet: true, cancelTweet: false, countdownTimer: null }
		if (data.content.includes('!lastRunTime'))
			try { data.content = data.content.replace('!lastRunTime', runFinishTimes.value[runDataActiveRunSurrounding.value.previous].time) } catch { nodecg.log.warn('The last run either doesn\'t exist or doesn\'t have a final time.') }
		if (data.media !== undefined && data.media !== 'None' && data.media !== '' && data.media !== null)
			try {
				const mediaIds = await Promise.all([
					twitterClient.v1.uploadMedia(`./assets/speedcontrol-tweetr/media/${data.media}`),
				]);
				twitterClient.v1.tweet(data.content, { media_ids: mediaIds });
			} catch { nodecg.log.warn(`Error posting tweet. Your tweet is either blank, invalid, or a duplicate. Run: ${runDataArray.value[selectedRunId.value].game} ${runDataArray.value[selectedRunId.value].category}`) }
		else try { twitterClient.v1.tweet(data.content); } catch { nodecg.log.warn(`Error posting tweet. Your tweet is either blank, invalid, or a duplicate. Run: ${runDataArray.value[selectedRunId.value].game} ${runDataArray.value[selectedRunId.value].category}`) }
	}

	function cancelTweet() {
		clearInterval(buttonTimer);
		countdownTimer.value = { countdownActive: false, cancelTweet: true, sendTweet: false, countdown: null }
	}

	// function uploadMedia(media, callback) {
	// 	try {
	// 		const promise = fs.promises.readFile(media);
	// 		Promise.resolve(promise).then((buffer) => {
	// 			if (media.includes('png') || media.includes('jpg') || media.includes('gif') || media.includes('jpeg') || media.includes('webp'))
	// 				twitterMedia.uploadMedia('image', buffer, (media, mediaId) => callback(mediaId))
	// 			else if (media.includes('mp4'))
	// 				twitterMedia.uploadMedia('video', buffer, (media, mediaId) => callback(mediaId))
	// 			else
	// 				nodecg.log.warn('Media upload failed! Please use a valid file format (png, jpg, gif, mp4)')
	// 		});
	// 	} catch (e) { nodecg.log.warn('Media upload failed! Your file is too big, or there is an invalid filename. (Hint: Make sure to remove spaces in your filename!)'); console.log(e) }
	// }

	async function inportCSV(value, callback) {
		let data = Papa.parse(value).data;
		for (let i = 1; i < data.length; i++) {
			let split = data[i][5].split('/');
			let mediaName = split[split.length - 1];
			// if (data[i][5] !== null || data[i][5]) {


			// 	let promise = await new Promise((resolve, reject) => {
			// 		let download = fetch(data[i][5], {
			// 			method: 'GET',
			// 			responseType: 'stream',
			// 		}).then(res => {
			// 			res.body.pipe(fs.createWriteStream('./bundles/speedcontrol-tweetr/media.jpeg'))
			// 			.on('error', (err) => console.log(err))
			// 			.once('close', () => resolve())
			// 		})
			// 	})

			// 	const form = new FormData();

			// 	form.append(split[split.length - 1], fs.createReadStream('./bundles/speedcontrol-tweetr/media.jpeg')); 

			// 	// let formData = {
			// 	// 	name: split[split.length - 1],
			// 	// 	file: {
			// 	// 	  value:  fs.createReadStream('./bundles/speedcontrol-tweetr/media.jpeg'),
			// 	// 	  options: {
			// 	// 		filename: split[split.length - 1],
			// 	// 		contentType: 'image/jpeg'
			// 	// 	  }
			// 	// 	}
			// 	//   };


			// 	let uploadData = await fetch(`https://dashboard.indiethon.live/assets/speedcontrol-tweetr/media`, {
			// 		method: 'POST',
			// 		headers: {
			// 			cookie: 'socketToken=86b7b358-e058-4399-b85e-0213b3ba8927'
			// 		},
			// 		body: form
			// 	})
			// 	console.log(uploadData)
			// }
			tweetData.value[data[i][0]] = { game: data[i][1], category: data[i][2], content: data[i][4], media: (!mediaName) ? mediaName : null };
		}
		callback(null);
	}

	function createCSV(callback) {
		let array = [];
		for (const run of Object.keys(tweetData.value)) {
			let runData = runDataArray.value.find(x => x.id === run);
			let runners = [];
			for (const team of runData.teams) {
				for (const runner of team.players) {
					runners.push(runner.name);
				}
			}
			array.push({
				ID: run,
				Game: runData.game,
				Category: runData.category,
				"Runner(s)": runners.join(', '),
				"Tweet Content": tweetData.value[run].content,
				Media: (tweetData.value[run].media === 'None') ? '' : tweetData.value[run].media,
			})
		}
		callback(null, Papa.unparse(array))
	}
}