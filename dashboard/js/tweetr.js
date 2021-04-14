'use strict';

const speedcontrolBundle = 'nodecg-speedcontrol';
let runDataActiveRun, runDataArray, buttonTimer;
let firstLoad = true;

window.addEventListener('load', function() {

	runDataActiveRun = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);
	runDataArray = nodecg.Replicant('runDataArray', speedcontrolBundle);

	NodeCG.waitForReplicants(runDataActiveRun);

	runDataActiveRun.on('change', (newVal, oldVal) => {
		let dropdownContent = document.getElementById("runList").items;
		for (let i = 0; i < dropdownContent.length; i++) {
			if (dropdownContent[i].innerHTML === newVal.game) {
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
		nodecg.sendMessage('getTweetContent', '', (error, result) => {
			if (oldVal !== undefined) {
				if (oldVal.length > newVal.length) {
					let duplicateItems = oldVal.filter(obj => newVal.every(s => s.id !== obj.id));
					for (let i = 0; i < duplicateItems.length; i++) {
						result.splice(result.findIndex(obj => obj.id === duplicateItems[i].id), 1);
					}
				}
				else if (oldVal.length < newVal.length) {
					let missingItems = newVal.filter(obj => oldVal.every(s => s.id !== obj.id));
					for (let i = 0; i < missingItems.length; i++) {
						result.push({ id: missingItems[i].id, game: missingItems[i].game, tweetContent: '', tweetAttachment: '' })
					}
				}
			}
			document.getElementById("runList").innerHTML = "";
			for (let i = 0; i < result.length; i++) {
				let paperItem = document.createElement("paper-item");
				paperItem.setAttribute("role", "option");
				paperItem.setAttribute("runId", result[i].id);
				paperItem.innerHTML = result[i].game;
				document.getElementById("runList").appendChild(paperItem)
			}
			nodecg.sendMessage('setTweetContent', result)
		})
	})
})

function startCountdown() {
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
	nodecg.sendMessage('getTweetContent', '', (error, result) => {
		for (let i = 0; i < result.length; i++) {
			if (selectedRunId === result[i].id) {
				if (result[i].tweetContent !== '') {
					if (result[i].tweetAttachment !== '') {
						nodecg.sendMessage('mediaUpload', result[i].tweetAttachment, (error, media_id) => {
							nodecg.sendMessage('statusesUpdate', {
								status: result[i].tweetContent,
								media_ids: media_id,
							})
						})
					}
					else {
						nodecg.sendMessage('statusesUpdate', {
							status: result[i].tweetContent,
						})
					}
				}
				break;
			}
		}
	})
	document.getElementById("tweetNow").innerHTML = 'Tweet Sent'
	document.getElementById("tweetNow").setAttribute('disabled', 'true');
}

function tweetTextarea() {
	const tweetText = document.getElementById("composeTweet").value;
	if (document.getElementById("composeAttachment").value !== undefined && document.getElementById("composeAttachment").value !== '') {
		nodecg.sendMessage('mediaUpload', document.getElementById("composeAttachment").value, (error, media_id) => {
			nodecg.sendMessage('statusesUpdate', {
				status: tweetText,
				media_ids: media_id,
			})
		})
	}
	else {
		nodecg.sendMessage('statusesUpdate', {
			status: tweetText,
		})
	}
	document.getElementById("composeTweet").value = '';
	document.getElementById("composeAttachment").value = '';
}

function cancelTweet() {
	clearInterval(buttonTimer);
	document.getElementById("tweetNow").innerHTML = "Tweet";
	document.getElementById("cancelTweet").setAttribute('disabled', 'true');
}

function changeSelectedTweet() {
	document.getElementById("tweetNow").innerHTML = "Tweet";
	document.getElementById("tweetNow").removeAttribute('disabled')
}

function sendRunIndex() {
	clearInterval(buttonTimer)
	document.getElementById("tweetNow").innerHTML = "Tweet";
	document.getElementById("cancelTweet").setAttribute('disabled', 'true');
	nodecg.sendMessage('sendEditRunId', document.getElementById("runList").selectedItem.getAttribute('runId'));
}