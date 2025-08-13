import { defaultOptions } from './constants.js';
import { captureFullpage } from './helpers.js';

let imageBase64: string | undefined;
let editorTabId: number | null = null;
let tabTitle: string | undefined;
let tabId: number | undefined;

const onMessages = async (request: any, _: any, sendResponse: any) => {
  try {
    const { currentTabId, currentTabTitle, actionType, options } = request;

    if (currentTabId !== undefined) {
      tabTitle = currentTabTitle;
      tabId = currentTabId;
    }

    if (actionType === 'get-screenshot') {
      sendResponse({ imageBase64, editorTabId, tabTitle });
      return true;
    }

    if (actionType === 'screenshot-visiblepage') {
      // @ts-ignore: Unreachable code error
      imageBase64 = await chrome.tabs.captureVisibleTab(null, { format: defaultOptions.format, quality: defaultOptions.quality, });

      if (imageBase64) {
        const tabInfos = await chrome.tabs.create({ url: "editor.html" });
        editorTabId = tabInfos.id || 0;
        sendResponse({ message: "screenshot-done" });
      } else {
        sendResponse({ error: "Failed to capture visible tab." });
      }
      return true;
    }

    if (actionType === 'screenshot-fullpage') {
      if (tabId === undefined) {
        sendResponse({ error: "Tab ID is not available for full page screenshot." });
        return true;
      }

      imageBase64 = await captureFullpage(tabId, options);

      if (imageBase64) {
        const tabInfos = await chrome.tabs.create({ url: "editor.html" });
        editorTabId = tabInfos.id || 0;
        sendResponse({ message: "screenshot-done" });
      } else {
        sendResponse({ error: "Failed to capture full page." });
      }
      return true;
    }
  } catch (error: any) {
    console.error(`Error in onMessages: ${error.message}`);
    sendResponse({ error: error.message || "An unknown error occurred." });
  }
};

chrome.runtime.onMessage.addListener(onMessages);
