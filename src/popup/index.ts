import './popup.css'

function showAlert(text) {
  let alert = document.getElementById('alert');
  if (alert) alert.textContent = text;
  else {
    alert = document.createElement('pre');
    alert.classList.add('alert')
    alert.textContent = text;
    alert.id = 'alert';
    document.body.appendChild(alert);
  }
}

const sendMessage = async (msg) => {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true, active: true });
    const currentTab = tabs[0];

    if (currentTab?.url?.includes('chrome://')) {
      throw new Error('This page is not supported...')
    }
    else return await chrome.runtime.sendMessage({ currentTabId: currentTab.id, currentTabTitle: currentTab.title, ...msg });
  } catch (error) {
    if (!error.message.includes('message port')) showAlert(error.message);
  }
}

const onCaptureFullpage = async (e) => {
  e.preventDefault();
  const elements = e.target.elements;
  const deviceScaleFactor = +elements[0].value;
  const quality = +elements[1].value;
  const format = elements[2].value;
  const captureBeyondViewport = Boolean(elements[3].value);
  await sendMessage({ actionType: 'screenshot-fullpage', options: { deviceScaleFactor, quality, format, captureBeyondViewport } });
}

const onCaptureVisivlepage = async () => {
  await sendMessage({ actionType: 'screenshot-visiblepage' });
}

const onOpenEditor = async () => {
  await chrome.tabs.create({ url: "editor.html" });
}

document.getElementById('btn-partial')!.addEventListener('click', onCaptureVisivlepage);
document.getElementById('form-fullpage')!.addEventListener('submit', onCaptureFullpage);
document.getElementById('btn-open-editor')!.addEventListener('click', onOpenEditor);