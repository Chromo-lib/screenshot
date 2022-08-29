function sleep(ms = 50) { return new Promise(r => setTimeout(r, ms)); }

function setDeviceMetricsOverride(tabId, { height, width }) {
  const ops = { height: height, width: width, deviceScaleFactor: 1, captureBeyondViewport: false, mobile: false };
  return new Promise((resolve) => {
    chrome.debugger.sendCommand({ tabId }, "Emulation.setDeviceMetricsOverride", ops, resolve);
  });
}

async function captureFullpage(tabId) {
  await chrome.debugger.sendCommand({ tabId }, "Page.enable");
  await sleep();

  await chrome.debugger.sendCommand({ tabId }, "Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
  await sleep();

  const { contentSize } = await chrome.debugger.sendCommand({ tabId }, "Page.getLayoutMetrics");
  await sleep();

  await setDeviceMetricsOverride(tabId, { height: contentSize.height, width: contentSize.width }); // returns empty object

  return new Promise((resolve, reject) => {

    const ops = { format: 'png', fromSurface: true };
    chrome.debugger.sendCommand({ tabId }, "Page.captureScreenshot", ops, async (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        let base64Data = `data:image/png;base64,${response.data}`;
        await sleep(Math.ceil(contentSize.height / 30));

        await chrome.debugger.sendCommand({ tabId }, "Emulation.clearDeviceMetricsOverride"); // returns empty object 
        resolve(base64Data);
      }
    });
  });
}