function sleep(ms = 50) { return new Promise(r => setTimeout(r, ms)); }

function setSize(tabId, { height, width }) {
  const ops = { height: height, width: width, deviceScaleFactor: options.deviceScaleFactor, mobile: false };
  return new Promise((resolve) => {
    chrome.debugger.sendCommand({ tabId }, "Emulation.setDeviceMetricsOverride", ops, resolve);
  });
}

function screenshot(tabId) {
  const ops = { format: options.format, fromSurface: true };
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand({ tabId }, "Page.captureScreenshot", ops, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        let base64Data = `data:image/${options.format};base64,${response.data}`;
        resolve(base64Data);
      }
    });
  });
}

function setBg(tabId, bg) {
  return new Promise((resolve) => {
    chrome.debugger.sendCommand({ tabId }, "Emulation.setDefaultBackgroundColorOverride", bg, resolve);
  });
}