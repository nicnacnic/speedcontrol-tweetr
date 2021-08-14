const tweetData = nodecg.Replicant('tweetData');
const mediaData = nodecg.Replicant('assets:media')
const selectedRunId = nodecg.Replicant('selectedRunId')

NodeCG.waitForReplicants(tweetData, mediaData, selectedRunId).then(() => {

	selectedRunId.on('change', (newVal) => {
		document.getElementById("editComposeTweet").value = tweetData.value[newVal].content;
		if (tweetData.value[newVal].media === '')
			document.getElementById('mediaList').selectIndex(0)
		else {
			for (let i = 0; i < mediaData.value.length; i++) {
				if (mediaData.value[i].base === tweetData.value[newVal].media) {
					document.getElementById('mediaList').selectIndex(i + 1);
					break;
				}
			}
		}
	});

	mediaData.on('change', (newVal) => {
		let mediaList = document.getElementById('mediaList');
		mediaList.innerHTML = '';
		let emptyItem = document.createElement("paper-item");
		emptyItem.innerHTML = 'None';
		mediaList.appendChild(emptyItem);
		newVal.forEach(media => {
			let paperItem = document.createElement("paper-item");
			paperItem.innerHTML = media.base;
			mediaList.appendChild(paperItem);
		})
	})
});

function saveTweet() {
	tweetData.value[selectedRunId.value].content = document.getElementById("editComposeTweet").value;
	tweetData.value[selectedRunId.value].media = document.getElementById("mediaList").selectedItem.innerHTML;
	nodecg.getDialog('edit-tweet').close(true)
}