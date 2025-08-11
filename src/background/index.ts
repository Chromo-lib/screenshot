import { captureFullpage } from './utils.js';

interface ScreenshotOptions {
  deviceScaleFactor: number;
  format: "png" | "jpeg";
  fromSurface: boolean;
  quality?: number;
}

interface MessageRequest {
  deviceScaleFactor?: number;
  currentTabId?: number;
  currentTabTitle?: string;
  actionType: 'get-screenshot' | 'screenshot-visiblepage' | 'screenshot-fullpage';
}

interface MessageResponse {
  imageBase64?: string;
  editorTabId?: number | null;
  tabTitle?: string;
  message?: string;
  error?: string;
}

let imageBase64: string | undefined;
let editorTabId: number | null = null;
let tabTitle: string | undefined;
let tabId: number | undefined;

const screenshotOptions: ScreenshotOptions = {
  deviceScaleFactor: 1,
  format: "png",
  fromSurface: true,
  quality: 100,
};

const onMessages = async (request: MessageRequest, sender: chrome.runtime.MessageSender, sendResponse: (response?: MessageResponse | Promise<MessageResponse>) => void): Promise<void> => {
  try {
    const { currentTabId, currentTabTitle, actionType, deviceScaleFactor } = request;

    if (currentTabId !== undefined) {
      tabTitle = currentTabTitle;
      tabId = currentTabId;
    }

    if (actionType === 'get-screenshot') {
      sendResponse({ imageBase64, editorTabId, tabTitle });
      return;
    }

    if (actionType === 'screenshot-visiblepage') {
      imageBase64 = await chrome.tabs.captureVisibleTab(null, { format: screenshotOptions.format, quality: screenshotOptions.quality });

      if (imageBase64) {
        const tabInfos = await chrome.tabs.create({ url: "editor.html" });
        editorTabId = tabInfos.id;
        sendResponse({ message: "screenshot-done" });
      } else {
        sendResponse({ error: "Failed to capture visible tab." });
      }
      return;
    }

    if (actionType === 'screenshot-fullpage') {
      if (tabId === undefined) {
        sendResponse({ error: "Tab ID is not available for full page screenshot." });
        return;
      }

      imageBase64 = await captureFullpage(tabId, deviceScaleFactor);

      if (imageBase64) {
        const tabInfos = await chrome.tabs.create({ url: "editor.html" });
        editorTabId = tabInfos.id;
        sendResponse({ message: "screenshot-done" });
      } else {
        sendResponse({ error: "Failed to capture full page." });
      }
      return;
    }
  } catch (error: any) {
    console.error(`Error in onMessages: ${error.message}`);
    sendResponse({ error: error.message || "An unknown error occurred." });
  }
};

chrome.runtime.onMessage.addListener(onMessages);
