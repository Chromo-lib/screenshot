importScripts('./utils.js');

let options = {
  deviceScaleFactor: 1,
  format: "png",
  fromSurface: true,
};

let imageBase64;
let editorTabId;
let tabTitle;
let tabId;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  try {
    const { currentTabId, currentTabTitle, actionType } = request;

    if (request.currentTabId) {
      tabTitle = currentTabTitle;
      tabId = currentTabId;
    }

    if (actionType === 'get-image') {
      sendResponse({ imageBase64, editorTabId, tabTitle });
    }

    if (actionType === 'screenshot-visiblepage') {
      imageBase64 = await chrome.tabs.captureVisibleTab(null, { format: "png" });

      if (imageBase64) {
        const tabInfos = await chrome.tabs.create({ url: "../src/editor.html" });
        editorTabId = tabInfos.id;
      }
    }

    if (actionType === 'screenshot-fullpage') {
      await chrome.debugger.attach({ tabId }, "1.0");
      await sleep();

      await chrome.debugger.sendCommand({ tabId }, "Page.enable");
      await sleep();

      await chrome.debugger.sendCommand({ tabId }, "Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
      await sleep();

      const { contentSize } = await chrome.debugger.sendCommand({ tabId }, "Page.getLayoutMetrics", {});
      await sleep();

      await setSize(tabId, { height: contentSize.height, width: contentSize.width }); // returns empty object
      await sleep();

      imageBase64 = await screenshot(tabId);
      await sleep(200);

      await chrome.debugger.sendCommand({ tabId }, "Emulation.clearDeviceMetricsOverride"); // returns empty object      
      await chrome.debugger.detach({ tabId });
      await sleep(200);

      if (imageBase64) {
        const tabInfos = await chrome.tabs.create({ url: "../src/editor.html" });
        editorTabId = tabInfos.id;
      }
    }
  } catch (error) {
    console.log('Error ==> ', error.message);
  }
});
