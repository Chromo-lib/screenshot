let isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
chrome = isChrome ? chrome : browser;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
	if (request.action === 'captureFullPage') {
		await captureFullPage();
	}

	if (request.action === 'captureVisibleArea') {
		await captureVisibleArea();
	}
});

async function sendAction (tab, message) {
	return new Promise((resolve, reject) => {
		chrome.tabs.sendMessage(tab.id, message, null, response => {
			resolve(response);
		});
	});
}

function getImageFromDataURI (dataUri) {
	return new Promise(resolve => {
		let image = new Image();
		image.addEventListener('load', () => {
			resolve(image);
		});
		image.src = dataUri;
		//console.log(dataUri)
	});
}

function capture () {
	return new Promise(resolve => {
		chrome.tabs.captureVisibleTab(null, null, async dataURI => {
			resolve(await getImageFromDataURI(dataURI));
		});
	});
}

function delay (ms) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}

function toBlob (canvas) {
	return new Promise(resolve => {
		canvas.toBlob(async blob => {
			resolve(blob);
		});
	});
}

function getSelectedTab () {
	return new Promise(resolve => {
		chrome.tabs.query({ active: true, windowType: "normal", currentWindow: true }, (tabs) => {
			resolve(tabs[0]);
		});
	});
}

function createTab (url) {
	return new Promise(resolve => {
		chrome.tabs.create({ url }, async tab => {
			chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
				if (info.status === 'complete' && tabId === tab.id) {
					chrome.tabs.onUpdated.removeListener(listener);
					resolve(tab);
				}
			});
		});
	});
}

let isTakingScreenshot = false;
async function captureFullPage () {
	if (isTakingScreenshot) {
		return;
	}
	isTakingScreenshot = true;

	let tab = await getSelectedTab(),
		info = await sendAction(tab, { action: 'getSizeInfo' }),
		canvas = document.createElement('canvas'),
		context = canvas.getContext('2d');

	canvas.width = info.body.width * devicePixelRatio;
	canvas.height = info.body.height * devicePixelRatio;

	await sendAction(tab, { action: 'start' });

	for (var y = 0; info.body.height > y; y += info.window.height) {
		await sendAction(tab, { action: 'setScroll', y });

		// browser is too slow to reflect render changes
		await delay(500);

		let snap = await capture();

		context.drawImage(snap,
			0,
			y * devicePixelRatio,
			info.window.width * devicePixelRatio,
			info.window.height * devicePixelRatio
		);

		// prevent locking
		await delay(1);
	}

	await sendAction(tab, { action: 'finish' });

	let uri = URL.createObjectURL(await toBlob(canvas));

	chrome.tabs.create({
		'url': chrome.extension.getURL(`../editor.html?uri=${uri}&host=${info.host}`)
	});

	isTakingScreenshot = false;
	chrome.runtime.sendMessage({ action: 'finish' });
}

async function captureVisibleArea () {
	let tab = await getSelectedTab();
	chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {

		let canvas = document.createElement("canvas");
		let ctx = canvas.getContext("2d");

		let image = new Image();
		document.body.appendChild(image);

		image.onload = async () => {
			canvas.width = image.width;
			canvas.height = image.height;

			let host = new URL(tab.url).host;
			ctx.drawImage(image, 0, 0, image.width, image.height);

			let uri = URL.createObjectURL(await toBlob(canvas));
			chrome.tabs.create({
				'url': chrome.extension.getURL(`../editor.html?uri=${uri}&host=${host}`)
			});
		};

		image.src = dataUrl;
	});
}