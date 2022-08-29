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

    if (actionType === 'get-screenshot') {
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
      
      await chrome.debugger.attach({ tabId }, "1.3");
      await sleep();

      // await chrome.debugger.sendCommand({ tabId }, "Debugger.enable");

      imageBase64 = await captureFullpage(tabId);

      await chrome.debugger.detach({ tabId });
      await sleep();

      if (imageBase64) {
        const tabInfos = await chrome.tabs.create({ url: "../src/editor.html" });
        editorTabId = tabInfos.id;

        // await chrome.debugger.sendCommand({ tabId }, "Debugger.disable");
        sendResponse({ message: "screenshot-done" });
      }
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