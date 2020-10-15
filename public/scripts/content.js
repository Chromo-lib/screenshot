let isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
chrome = isChrome ? chrome : browser;

let onAction = (function () {
	let actions = {}

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		let action = actions[request.action];

		setTimeout(async () => {
			sendResponse(await action(request));
		}, 0);

		return true;
	});

	return function (name, callback) {
		actions[name] = callback;
	};
})();

function delay (ms) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}

onAction('getSizeInfo', async request => {
	let rect = document.body.getBoundingClientRect();

	return {
		window: {
			width: window.innerWidth,
			height: window.innerHeight,
			scrollY: window.scrollY,
			scrollX: window.scrollX
		},
		body: {
			bottom: rect.bottom,
			height: rect.height,
			left: rect.left,
			right: rect.right,
			top: rect.top,
			width: rect.width
		},
		host: window.location.host
	};
});

let alteredElements = [];
onAction('start', async request => {
	scroll(0, 0);

	alteredElements.push({
		element: document.documentElement,
		style: {
			transform: document.documentElement.style.transform
		}
	});

	alteredElements.push({
		element: document.body,
		style: {
			overflow: document.body.style.overflow
		}
	});

	Array.from(document.querySelectorAll('*')).filter(element => {
		let css = window.getComputedStyle(element);

		return css.position && css.position.match('fixed');
	})
		.filter(element => {
			let rect = element.getBoundingClientRect();
			return (
				rect.bottom === window.innerHeight &&
				rect.top > 0
			);
		})
		.forEach(element => {
			alteredElements.push({
				element,
				style: {
					display: element.style.display
				}
			});

			element.style.display = 'none';
		});
});

onAction('setScroll', async request => {
	if (request.x || request.y) {
		document.documentElement.style.transform = `translate(-${request.x || 0}px, -${request.y || 0}px)`;
	} else {
		document.documentElement.style.transform = null;
	}

	document.body.style.overflow = 'hidden';
});

onAction('finish', async request => {
	// restore all fixed elements
	let state;
	while (state = alteredElements.pop()) {
		for (let property in state.style) {
			state.element.style[property] = state.style[property];
		}
	}
});

onAction('onCaptureFullPage', () => {
	chrome.runtime.sendMessage({ action: 'captureFullPage' });
});

onAction('onCaptureVisibleArea', () => {
	chrome.runtime.sendMessage({ action: 'captureVisibleArea' });
});
