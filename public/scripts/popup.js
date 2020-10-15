let isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
chrome = isChrome ? chrome : browser;

async function sendAction (message) {
	return new Promise(async (resolve) => {
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, message, null, response => {
				resolve(response);
			});
		});
	});
}

document.querySelector('.btns-container').addEventListener('click', async (e) => {
	if (e.target.id === 'btn-fullpage') {
		await sendAction({ action: 'onCaptureFullPage' });
	}

	if (e.target.id === 'btn-partial') {
		await sendAction({ action: 'onCaptureVisibleArea' });
	}

	if (chrome.runtime.lastError) {
		document.querySelector('.container').classList.remove('disp-none');
	}
});

chrome.runtime.onMessage.addListener((request) => {
	//console.log(request);
});