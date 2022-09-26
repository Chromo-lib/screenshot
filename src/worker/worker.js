import { captureFullpage } from './utils.js';

let options = {
  deviceScaleFactor: 1,
  format: "png",
  fromSurface: true,
};

let imageBase64;
let editorTabId;
let tabTitle;
let tabId;

const onMessages = async (request, sender, sendResponse) => {
  try {
    const { currentTabId, currentTabTitle, actionType } = request;

    if (request.currentTabId) {
      tabTitle = currentTabTitle;
      tabId = currentTabId;
    }

    if (actionType === 'get-screenshot') {
      sendResponse({ imageBase64, editorTabId, tabTitle });
    }

    if (actionType === 'screenshot-visiblepage') {
      imageBase64 = await chrome.tabs.captureVisibleTab(null, { format: options.format });

      if (imageBase64) {
        const tabInfos = await chrome.tabs.create({ url: "editor.html" });
        editorTabId = tabInfos.id;
      }
    }

    if (actionType === 'screenshot-fullpage') {
      // await chrome.debugger.sendCommand({ tabId }, "Debugger.enable");
      imageBase64 = await captureFullpage(tabId,options);

      if (imageBase64) {
        const tabInfos = await chrome.tabs.create({ url: "editor.html" });
        editorTabId = tabInfos.id;
        // await chrome.debugger.sendCommand({ tabId }, "Debugger.disable");
        sendResponse({ message: "screenshot-done" });
      }
    }

    if (actionType === 'getVersion') {
      await chrome.debugger.attach({ tabId }, "1.3");
      const data = await chrome.debugger.sendCommand({ tabId }, "Browser.getVersion");
      if (data) chrome.runtime.sendMessage({ message: 'Browser.getVersion', data });
      await chrome.debugger.detach({ tabId });
    }
  } catch (error) {
    console.log('Error ==> ', error.message);
  }
}

chrome.runtime.onMessage.addListener(onMessages);