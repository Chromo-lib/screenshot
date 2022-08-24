function toBlob(dataURI) {
  var byteString = atob(dataURI.split(',')[1]);
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  var blob = new Blob([ab], { type: mimeString });
  return blob;
}

function download(blobUrl, imgFilename) {
  const link = document.createElement("a");
  link.download = imgFilename || 'Screenshot.png';
  link.href = blobUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

let blobUrl;
let imgFilename

chrome.runtime.sendMessage({ actionType: 'get-image' }, (response) => {
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