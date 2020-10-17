let isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
chrome = isChrome ? chrome : browser;

let loadingEl = document.querySelector('.lds-dual-ring');
let isCapturing = false;

async function sendAction (message) {
	return new Promise(async (resolve) => {
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, message, null, response => {
				resolve(response);
			});
		});
	});
}

async function createTab (url) {
	return new Promise((resolve) => {
		chrome.tabs.create({ url });
		resolve();
	})
}

document.querySelector('.btns-container').addEventListener('click', async (e) => {

	if (e.target.id === 'btn-fullpage') {
		await sendAction({ action: 'start' });
	}

	if (e.target.id === 'btn-partial') {
		await sendAction({ action: 'capture-visible-page' });
	}

	if (e.target.id === 'btn-open-editor') {
		await createTab(chrome.extension.getURL(`../editor.html`));
	}

	if (chrome.runtime.lastError) {
		isCapturing = false;
		setTimeout(() => {
			if(!isCapturing) document.querySelector('.container').classList.remove('disp-none');
		}, 500);
	}
});

chrome.runtime.onMessage.addListener((request) => {

	if (request.action === "capture-finished" && request.url) {
		loadingEl.classList.add('disp-none');
		isCapturing = true;
	}

	if (request.action === "capture") {
		loadingEl.classList.remove('disp-none');
		isCapturing = true;
	}
});