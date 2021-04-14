let selectedRunId;

nodecg.listenFor('sendEditRunId', (value, ack) => {
	selectedRunId = value;
	document.getElementById("saveTweet").removeAttribute('disabled');
	document.getElementById("saveTweet").innerHTML = 'Save';

	nodecg.sendMessage('getTweetContent', '', (error, result) => {
		for (let i = 0; i < result.length; i++) {
			if (selectedRunId === result[i].id) {
				document.getElementById("editComposeTweet").value = result[i].tweetContent;
				document.getElementById("editAttachmentURL").value = result[i].tweetAttachment;
				break;
			}
		}
	})
});

function saveTweet() {
	nodecg.sendMessage('getTweetContent', '', (error, result) => {
		for (let i = 0; i < result.length; i++) {
			if (selectedRunId === result[i].id) {
				result[i].tweetContent = document.getElementById("editComposeTweet").value;
				result[i].tweetAttachment = document.getElementById("editAttachmentURL").value;
				break;
			}
		}
		nodecg.sendMessage('setTweetContent', result);
		document.getElementById("saveTweet").setAttribute('disabled', 'true')
		document.getElementById("saveTweet").innerHTML = 'Saved!';
	})
}