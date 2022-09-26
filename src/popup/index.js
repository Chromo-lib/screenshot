const alertEl = document.querySelector('.alert');

const sendMessage = async (msg) => {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true, active: true });
    const currentTab = tabs[0];

    if (currentTab.url.includes('chrome://')) {
      throw new Error('This page is not supported...')
    }
    else return await chrome.runtime.sendMessage({ currentTabId: currentTab.id, currentTabTitle: currentTab.title, ...msg });
  } catch (error) {
    if(!error.message.includes('message port')) alertEl.textContent = error.message;
  }
}

const onCaptureFullpage = async () => {
  await sendMessage({ actionType: 'screenshot-fullpage' });
}

const onCaptureVisivlepage = async () => {
  await sendMessage({ actionType: 'screenshot-visiblepage' });
}

const onGetVersion = async () => {
  await sendMessage({ actionType: 'getVersion' });
}

const onMessages = async (request, sender, sendResponse) => {
  alertEl.textContent = request.data ? JSON.stringify(request, null, 2) : request.message;
  sendResponse(request);
}

document.getElementById('btn-partial').addEventListener('click', onCaptureVisivlepage);
document.getElementById('btn-fullpage').addEventListener('click', onCaptureFullpage);
document.getElementById('btn-getVersion').addEventListener('click', onGetVersion);
chrome.runtime.onMessage.addListener(onMessages);