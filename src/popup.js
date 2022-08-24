const onCaptureFullpage = async () => {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true, active: true });
    if (tabs) {
      const currentTab = tabs[0];
      await chrome.runtime.sendMessage({
        currentTabId: currentTab.id,
        currentTabTitle: currentTab.title,
        actionType: 'screenshot-fullpage'
      });
    }
  } catch (error) {
    document.querySelector('.alert').textContent = error.message;
  }
}

const onCaptureVisivlepage = async () => {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true, active: true });
    if (tabs) {
      const currentTab = tabs[0];
      await chrome.runtime.sendMessage({
        currentTabId: currentTab.id,
        currentTabTitle: currentTab.title,
        actionType: 'screenshot-visiblepage'
      });
    }
  } catch (error) {
    document.querySelector('.alert').textContent = error.message;
  }
}

document.getElementById('btn-partial').addEventListener('click', onCaptureVisivlepage);
document.getElementById('btn-fullpage').addEventListener('click', onCaptureFullpage);