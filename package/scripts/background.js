let isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
chrome = isChrome ? chrome : browser;

let canvas = document.createElement("canvas"), context = canvas.getContext("2d");
let imgDataIndex = 1;

async function getSelectedTab () {
	return new Promise(resolve => {
		chrome.tabs.query({ active: true, windowType: "normal", currentWindow: true }, (tabs) => {
			resolve(tabs[0]);
		});
	});
}

async function sendAction (message) {
	let selectedTab = await getSelectedTab();
	return new Promise((resolve, reject) => {
		chrome.tabs.sendMessage(selectedTab.id, message, null);
		resolve();
	});
}

async function createTab (url) {
	return new Promise((resolve) => {
		chrome.tabs.create({ url });
		resolve();
	})
}

async function captureVisibleTab () {
	return new Promise((resolve) => {
		chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
			resolve(dataUrl)
		});
	})
}

async function captureVisibleArea () {
	let tab = await getSelectedTab();
	let dataUrl = await captureVisibleTab();

	let canvas = document.createElement("canvas"), context = canvas.getContext("2d");

	let image = new Image();
	document.body.appendChild(image);

	image.onload = async () => {
		canvas.width = image.width;
		canvas.height = image.height;

		let host = new URL(tab.url).host;
		context.drawImage(image, 0, 0, image.width, image.height);

		context.canvas.toBlob(async (blob) => {
			let url = window.URL.createObjectURL(blob);
			await createTab(chrome.extension.getURL(`../editor.html?uri=${url}&host=${host}&size=${blob.size}`));
		});
	};
	image.src = dataUrl;
}

async function onMessage (message) {

	if (message.action === "capture-finished" && message.url) {
		if (isChrome) {
			let img = new Image();
			let canvas = document.createElement("canvas");
			let context = canvas.getContext("2d");

			img.onload = () => {
				document.body.appendChild(img);

				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;
				context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

				context.canvas.toBlob(async (blob) => {
					let url = window.URL.createObjectURL(blob);
					URL.revokeObjectURL(message.url);
					await createTab(chrome.extension.getURL(`../editor.html?uri=${url}&host=${message.host}&size=${blob.size}`));
				});
			};

			img.src = message.url;
		}
		else {
			context.canvas.toBlob(async (blob) => {
				let url = window.URL.createObjectURL(blob);
				URL.revokeObjectURL(message.url);
				await createTab(chrome.extension.getURL(`../editor.html?uri=${url}&host=${message.host}&size=${blob.size}`));
			});
		}
	}
	else if (message.action === "capture-visible-page" && message.action !== "abort") {
		await captureVisibleArea();
	}
	else if (message.action === "capture" && message.action !== "abort") {

		let dataUrl = await captureVisibleTab()

		if (!isChrome) {
			if (imgDataIndex === 1) {
				context.clearRect(0, 0, context.canvas.width, context.canvas.height);
				context.beginPath();
				context.canvas.width = context.canvas.width;
				canvas.width = message.canvasW * window.devicePixelRatio;
				canvas.height = message.canvasH * window.devicePixelRatio;
			}

			let img = new Image();

			img.onload = () => {
				context.drawImage(img, message.x, message.y);
			};
			imgDataIndex++;
			img.src = dataUrl;
		}

		await sendAction({ action: "frame", dataUrl, x: message.x, y: message.y });
	}
	else if (message.action === "abort") {
		await sendAction({ action: "abort" });
	}
}

chrome.runtime.onMessage.addListener(onMessage)
