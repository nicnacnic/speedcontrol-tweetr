let selectedRunId;

let tweetData = nodecg.Replicant('tweetData');
let mediaData = nodecg.Replicant('assets:media')
NodeCG.waitForReplicants(tweetData);

nodecg.listenFor('sendEditRunId', (value) => {
	selectedRunId = value;
	document.getElementById("saveTweet").removeAttribute('disabled');
	document.getElementById("saveTweet").innerHTML = 'Save';

	document.getElementById("editComposeTweet").value = '';
	document.getElementById("mediaList").innerHTML = '';

	for (let i = 0; i < tweetData.value.length; i++) {
		if (tweetData.value[i].id === selectedRunId) {
			document.getElementById("editComposeTweet").value = tweetData.value[i].content;
			for (let j = 0; j < mediaData.value.length; j++) {
				let paperItem = document.createElement("paper-item");
				paperItem.innerHTML = mediaData.value[j].base;
				document.getElementById("mediaList").appendChild(paperItem)

				if (tweetData.value[i].media === '')
					document.getElementById("mediaList").selected = null;
				else if (mediaData.value[j].base === tweetData.value[i].media)
					document.getElementById("mediaList").selectIndex(j);
			}
			break;
		}
		else if (i === tweetData.value.length - 1)
			document.getElementById("mediaList").selected = null;
	}
});

function clearMedia() {
	document.getElementById("mediaList").selected = null;
}

function saveTweet() {
	for (let i = 0; i < tweetData.value.length; i++) {
		if (tweetData.value[i].id === selectedRunId) {
			tweetData.value[i].content = document.getElementById("editComposeTweet").value;
			try { tweetData.value[i].media = document.getElementById("mediaList").selectedItem.innerHTML } catch { tweetData.value[i].media = '' }
			break;
		}
	}
	document.getElementById("saveTweet").setAttribute('disabled', 'true')
	document.getElementById("saveTweet").innerHTML = 'Saved!';
}