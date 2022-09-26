let blobUrl;
let imgFilename;

chrome.runtime.sendMessage({ actionType: 'get-screenshot' }, (response) => {
  const { imageBase64, tabTitle } = response;
  if (imageBase64) {
    imgFilename = tabTitle;
    blobUrl = URL.createObjectURL(toBlob(imageBase64));
    document.getElementById('img').src = blobUrl;
  }
});

const onMessages = async (request, sender, sendResponse) => {
  console.log(request);
}

const onDownload = () => {
  download(blobUrl, imgFilename);
}

const onLeavePage = (e) => {
  try {
    const confirmationMessage = 'Are you sure you want to leave?';
    (e || window.event).returnValue = confirmationMessage;
    if (blobUrl) { window.URL.revokeObjectURL(blobUrl) }
    return confirmationMessage;
  } catch (error) {
    if (blobUrl) window.URL.revokeObjectURL(blobUrl);
  }
};

document.getElementById('btn-download').addEventListener('click', onDownload);
window.addEventListener('beforeunload', onLeavePage)
chrome.runtime.onMessage.addListener(onMessages);