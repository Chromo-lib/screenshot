let isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
chrome = isChrome ? chrome : browser;

let loadingEl = document.querySelector('.lds-dual-ring');
let isCapturing = false;
let aborted = false;

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

async function onAction (e) {

	if (e.target.id === 'btn-fullpage' && !aborted) {
		await sendAction({ action: 'start' });
	}

	if (e.target.id === 'btn-partial' && !aborted) {
		await sendAction({ action: 'capture-visible-page' });
	}

	if (e.target.id === 'btn-open-editor') {
		await createTab(chrome.extension.getURL(`../editor.html`));
	}

	if (chrome.runtime.lastError) {
		isCapturing = false;
		setTimeout(() => {
			if (!isCapturing) document.querySelector('.container').classList.remove('disp-none');
		}, 500);
	}
}

async function onMessage (request) {

	aborted = request.action === "abort";

	if ((request.action === "capture-finished" && request.url) || aborted) {
		loadingEl.classList.add('disp-none');
		isCapturing = true;
	}

	if (request.action === "capture" && !aborted) {
		loadingEl.classList.remove('disp-none');
		isCapturing = true;
	}
}

document.querySelector('.btns-container').addEventListener('click', onAction, false)
chrome.runtime.onMessage.addListener(onMessage)
