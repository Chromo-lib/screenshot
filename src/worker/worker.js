import {sleep,setDeviceMetricsOverride,captureFullpage} from './utils.js';

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

    if (actionType === 'get-screenshot') {
      sendResponse({ imageBase64, editorTabId, tabTitle });
    }

    if (actionType === 'screenshot-visiblepage') {
      imageBase64 = await chrome.tabs.captureVisibleTab(null, { format: "png" });

      if (imageBase64) {
        const tabInfos = await chrome.tabs.create({ url: "editor.html" });
        editorTabId = tabInfos.id;
      }
    }

    if (actionType === 'screenshot-fullpage') {
      // await chrome.debugger.sendCommand({ tabId }, "Debugger.enable");
      imageBase64 = await captureFullpage(tabId);     
      
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
      if(data) chrome.runtime.sendMessage({ message: 'Browser.getVersion', data });
      await chrome.debugger.detach({ tabId });
    }
  } catch (error) {
    console.log('Error ==> ', error.message);
  }
});

// chrome.debugger.onDetach.addListener((source, reason) => {
//   console.log(source, reason);
// });

// chrome.debugger.onEvent.addListener((tabId, method, params) =>{
//   console.log(tabId, method, params);
// });