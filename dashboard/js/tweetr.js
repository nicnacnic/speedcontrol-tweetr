'use strict';

const speedcontrolBundle = 'nodecg-speedcontrol';
let runDataActiveRun = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);
let runDataArray = nodecg.Replicant('runDataArray', speedcontrolBundle);
let tweetData = nodecg.Replicant('tweetData');
let mediaData = nodecg.Replicant('assets:media')
let buttonTimer;
let firstLoad = true;

NodeCG.waitForReplicants(runDataActiveRun, runDataArray, tweetData).then(function() {
	syncArrays(tweetData.value, runDataArray.value);
	for (let i = 0; i < tweetData.value.length; i++) {
		let paperItem = document.createElement("paper-item");
		paperItem.setAttribute("runId", tweetData.value[i].id);
		paperItem.innerHTML = tweetData.value[i].game;
		document.getElementById("runList").appendChild(paperItem)

		if (runDataActiveRun.value.id === tweetData.value[i].id) {
			document.getElementById("runList").setAttribute('selected', i);
		}
	}
})

window.addEventListener('load', function() {
	runDataActiveRun.on('change', (newVal, oldVal) => {
		let dropdownContent = document.getElementById("runList").items;
		for (let i = 0; i < dropdownContent.length; i++) {
			if (dropdownContent[i].getAttribute('runId') === newVal.id) {
				document.getElementById("runList").setAttribute('selected', i);
				break;
			}
		}
		if (nodecg.bundleConfig.autoTweet && !firstLoad)
			startCountdown();
		else
			showButtons();
		firstLoad = false;
	});

	runDataArray.on('change', (newVal, oldVal) => {
		if (oldVal !== undefined)
			syncArrays(oldVal, newVal);
		document.getElementById("runList").innerHTML = "";
		for (let i = 0; i < tweetData.value.length; i++) {
			let paperItem = document.createElement("paper-item");
			paperItem.setAttribute("runId", tweetData.value[i].id);
			paperItem.innerHTML = tweetData.value[i].game;
			document.getElementById("runList").appendChild(paperItem)
		}
	})
	
	mediaData.on('change', (newVal, oldVal) => {
		document.getElementById("mediaList").innerHTML = "";
		for (let i = 0; i < mediaData.value.length; i++) {
			let paperItem = document.createElement("paper-item");
			paperItem.innerHTML = mediaData.value[i].base;
			document.getElementById("mediaList").appendChild(paperItem)
			document.getElementById("mediaList").selected = null;
		}
	})
});

function syncArrays(oldVal, newVal) {
	let result = tweetData;
	if (oldVal.length > newVal.length) {
		let duplicateItems = oldVal.filter(obj => newVal.every(s => s.id !== obj.id));
		for (let i = 0; i < duplicateItems.length; i++) {
			result.value.splice(result.value.findIndex(obj => obj.id === duplicateItems[i].id), 1);
		}
	}
	else if (oldVal.length < newVal.length) {
		let missingItems = newVal.filter(obj => oldVal.every(s => s.id !== obj.id));
		for (let i = 0; i < missingItems.length; i++) {
			result.value.push({ id: missingItems[i].id, game: missingItems[i].game, content: '', media: '' })
		}
	}
}

function startCountdown() {
	clearInterval(buttonTimer);
	const tweetButton = document.getElementById("tweetNow");
	let time = parseFloat((nodecg.bundleConfig.tweetDelay / 1000))
	tweetButton.innerHTML = "AutoTweet in " + time + "s";
	tweetButton.removeAttribute('disabled')
	document.getElementById("cancelTweet").removeAttribute('disabled')
	buttonTimer = setInterval(function() {
		time--
		tweetButton.innerHTML = "AutoTweet in " + time + "s";
		if (time <= 0) {
			clearInterval(buttonTimer);
			tweetButton.innerHTML = "Tweet Sent";
			tweetButton.setAttribute('disabled', 'true');
			document.getElementById("cancelTweet").setAttribute('disabled', 'true');
			tweetNow();
		}
	}, 1000)
}

function showButtons() {
	document.getElementById("tweetNow").removeAttribute('disabled');
	document.getElementById("tweetNow").innerHTML = 'Tweet';
}

function tweetNow() {
	clearInterval(buttonTimer)
	document.getElementById("tweetNow").innerHTML = "Tweet";
	document.getElementById("cancelTweet").setAttribute('disabled', 'true');
	let selectedRunId = document.getElementById("runList").selectedItem.getAttribute('runId');
	let currentTweetData = tweetData.value.find(obj => {
		return obj.id === selectedRunId
	})
	if (currentTweetData !== undefined) {
		sendTweet(currentTweetData);
		document.getElementById("tweetNow").innerHTML = 'Tweet Sent'
		document.getElementById("tweetNow").setAttribute('disabled', 'true');
	}
}

function sendTweet(data) {
	let mediaAsset = mediaData.value.find(obj => {
		return obj.base === data.media;
	})
	if (mediaAsset !== undefined) {
		nodecg.sendMessage('mediaUpload', "./" + mediaAsset.url, (error, media_id) => {
			nodecg.sendMessage('statusesUpdate', {
				status: data.content,
				media_ids: media_id,
			})
		})
	}
	else {
		nodecg.sendMessage('statusesUpdate', {
			status: data.content,
		})
	}
}

function tweetTextarea() {
	const tweetText = document.getElementById("composeTweet").value;
	if (document.getElementById("composeTweet").value !== undefined && document.getElementById("mediaList").selectedItem.innerHTML !== '') {
		let currentTweetData = { content: tweetText, media: document.getElementById("mediaList").selectedItem.innerHTML }
		sendTweet(currentTweetData);
		document.getElementById("composeTweet").value = '';
		document.getElementById("mediaList").selected = null;
	}
}
function cancelTweet() {
	clearInterval(buttonTimer);
	document.getElementById("tweetNow").innerHTML = "Tweet";
	document.getElementById("cancelTweet").setAttribute('disabled', 'true');
}

function changeSelectedTweet() {
	clearInterval(buttonTimer);
	document.getElementById("tweetNow").innerHTML = "Tweet";
	document.getElementById("tweetNow").removeAttribute('disabled')
}

function sendRunIndex() {
	clearInterval(buttonTimer)
	document.getElementById("tweetNow").innerHTML = "Tweet";
	document.getElementById("cancelTweet").setAttribute('disabled', 'true');
	nodecg.sendMessage('sendEditRunId', document.getElementById("runList").selectedItem.getAttribute('runId'));
}