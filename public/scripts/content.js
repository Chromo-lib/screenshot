let isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
chrome = isChrome ? chrome : browser;

let canvas = document.createElement("canvas"), context = canvas.getContext("2d");
let initial_position = {}, running = false, aborted = false;
let alteredElements = [];

async function sendRuntimeMessage (message) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage(message);
		resolve();
	});
}

async function drawIMGFrame (dataUrl, messageX, messageY) {
	return new Promise(resolve => {
		var img = new Image;
		img.onload = function () {
			context.drawImage(img, messageX, messageY);
			resolve();
		};
		img.src = dataUrl;
	});
}

async function delay (ms) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}

function measureScrollbar () {
	if (document.body.scrollHeight < window.innerHeight) {
		// No scrollbar
		return 0;
	}
	var scrollDiv = document.createElement("div");
	scrollDiv.className = "ocs-scrollbar-measure";
	document.body.appendChild(scrollDiv);
	var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
	if (scrollbarWidth == 0) {
		// Firefox seems to have problems with this, so in this case just guess that the scrollbar is 15 pixels wide
		scrollbarWidth = 15;
	}
	document.body.removeChild(scrollDiv);
	return scrollbarWidth;
}

document.addEventListener("keydown", function (e) {
	// Abort on escape key
	if (e.keyCode == 27) {
		aborted = true;
	}
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	if (message.action == "start") {
		aborted = false;
		running = true;
		initial_position = {
			x: document.scrollingElement.scrollLeft,
			y: document.scrollingElement.scrollTop
		};

		canvas.width = window.devicePixelRatio * (window.innerWidth - measureScrollbar());
		canvas.height = window.devicePixelRatio * document.scrollingElement.scrollHeight;

		window.scrollTo(0, 0);
		await delay(150);
		await sendRuntimeMessage({ action: "capture", x: 0, y: 0 });
	}
	else if (message.action == "frame") {
		if (aborted) return;
		/** fix element with postion fixed and sticky */
		alteredElements.push({
			element: document.documentElement,
			style: {
				transform: document.documentElement.style.transform
			}
		});

		alteredElements.push({ element: document.body, style: { overflow: document.body.style.overflow } });

		Array.from(document.querySelectorAll('*'))
			.filter(element => {
				let css = window.getComputedStyle(element);
				if (css.position === 'sticky' || css.position.match(/fixed|sticky/gi)) {
					return element;
				}
			})
			.filter(element => {
				let rect = element.getBoundingClientRect();
				return (rect.bottom > 0 || rect.top > 0);
			})
			.forEach(element => {
				alteredElements.push({ element, style: { display: element.style.display } });
				element.style.setProperty("display", "none", "important");
			});

		// Wait until canvas has been updated
		await delay(50);

		// Draw the new frame on the canvas
		await drawIMGFrame(message.dataUrl, message.x, message.y);

		// Wait until canvas has been updated
		await delay(50);

		var x = document.scrollingElement.scrollLeft;
		var y = document.scrollingElement.scrollTop;
		var scrollHeight = document.scrollingElement.scrollHeight;
		var width = window.innerWidth;
		var height = window.innerHeight;
		if (y + height < scrollHeight) {
			// Subtract 20 pixels to avoid getting the horizontal scrollbar repeatedly
			y += height - 20;
			if (y > scrollHeight - height) {
				y = scrollHeight - height;
			}
			window.scrollTo(x, y);

			await delay(100);
			await sendRuntimeMessage({ action: "capture", x: window.devicePixelRatio * x, y: window.devicePixelRatio * y });
		}
		else {
			// We're done, download the canvas
			window.scrollTo(initial_position.x, initial_position.y);
			running = false;

			context.canvas.toBlob(async (blob) => {
				if (blob == null) {
					alert("Sorry, toBlob() returned null. The screenshot you are trying to take is probably too large.\n\nReport your dissatisfaction here:\nhttps://github.com/stefansundin/one-click-screenshot/issues/5\n\nNote: The Firefox version does not seem to have this problem.");
					return;
				}
				// console.log("blob", blob);
				let url = window.URL.createObjectURL(blob);

				/** restore fix element with postion fixed and sticky */
				let state;
				while (state = alteredElements.pop()) {
					for (let property in state.style) {
						state.element.style.setProperty(property, state.style[property], "important");
					}
				}

				/** restore end */
				await delay(50);
				await sendRuntimeMessage({ action: "capture-finished", url, host: window.location.host });
				if(!isChrome) {
					window.open(url, '_blank').focus();
					window.URL.revokeObjectURL(url);
				}
			});
		}
	}
	else if (message.action == "abort") {
		aborted = true;
		await sendRuntimeMessage({ action: "abort" });
	}
	else if (message.action == "capture-visible-page") {
		aborted = false;
		running = true;
		await sendRuntimeMessage({ action: "capture-visible-page" });
	}
});
