'use strict';

const TwitterClient = require('twitter-api-client').TwitterClient;
const TwitterMedia = require('twitter-media');
const path = require('path');
const fs = require('fs');
const tweetContentFile = "./bundles/speedcontrol-tweetr/extension/data/tweetContent.json";
const speedcontrolBundle = 'nodecg-speedcontrol';

module.exports = function(nodecg) {
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

	nodecg.listenFor('statusesUpdate', (value, ack) => {
		twitterClient.tweets.statusesUpdate(value).catch((error) => {
			nodecg.log.warn('Error posting tweet. Your tweet is either blank, invalid, or a duplicate.')
		});
	});

	nodecg.listenFor('mediaUpload', (value, ack) => {
		try {
			const promise = fs.promises.readFile(value);
			Promise.resolve(promise).then(function(buffer) {
				let callback;
				if (value.includes('png') || value.includes('jpg') || value.includes('gif')) {
					twitterMedia.uploadMedia('image', buffer, (value, ack))
				}
				else if (value.includes('mp4')) {
					twitterMedia.uploadMedia('video', buffer, (value, ack))
				}
				else
					nodecg.log.warn('Media upload failed! Please use a valid file format (png, jpg, gif, mp4)')
			});
		} catch { nodecg.log.warn('Media upload failed! Your file is too big, or there is an invalid filename. (Hint: Make sure to remove spaces in your filename!)') }
	});
	
	nodecg.listenFor('consoleLog', (value) => {
		nodecg.log.warn(value);
	})
}