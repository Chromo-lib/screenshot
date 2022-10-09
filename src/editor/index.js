const btnShowCropCanvas = document.getElementById('btn-crop');
const btnDownloadCrop = document.getElementById('btn-download-crop');
const btnDownload = document.getElementById('btn-download');
const fileInput = document.getElementById('file-input');
const canvasContainer = document.getElementById('container');
const imgElement = document.getElementById('img');
const alertElement = document.querySelector('.alert');

btnShowCropCanvas.style.display = 'none';
btnDownloadCrop.style.display = 'none';
btnDownload.style.display = 'none';

let blobUrl;
let imgFilename;
let cropper = null;

let imgWidth;
let imgHeight;

chrome.runtime.sendMessage({ actionType: 'get-screenshot' }, (response) => {
  const { imageBase64, tabTitle } = response;
  if (imageBase64) {
    imgFilename = tabTitle;
    blobUrl = URL.createObjectURL(toBlob(imageBase64));

    imgElement.style.display = 'block';
    imgElement.src = blobUrl;

    btnShowCropCanvas.style.display = 'flex';
    btnDownload.style.display = 'flex';
  }
});

const onCropEnded = ({ _, data }) => {
  const { image, cropBox } = data;
  alertElement.innerHTML = `<strong>Original Image: </strong> 
  width ${imgWidth || image.width} | height: ${imgHeight || image.height} 
  / <strong>Crop Box: </strong> ${cropBox.width} | height: ${cropBox.height}`;
}

fileInput.addEventListener("change", handleFiles, false);
function handleFiles() {

  const file = this.files[0];

  if (file) {
    if (cropper) cropper.reset();

    imgFilename = file.name;
    btnDownloadCrop.style.display = 'flex';
    btnDownload.style.display = 'none';

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = function () {
      let diff = img.width > document.body.clientWidth ? img.width - document.body.clientWidth : 0;
      imgWidth = img.width;
      imgHeight = img.height;
      canvasContainer.style.width = `calc(${img.width}px - ${diff}px)`;
      canvasContainer.style.height = `calc(${img.height}px - ${diff}px)`;
      canvasContainer.style.maxWidth = '100%';
    };

    img.src = url;
    cropper = new Cropnow(canvasContainer, { url, onCropEnded });
  }
}

const onShowCropCanvas = () => {
  if (cropper) return;

  btnDownloadCrop.style.display = 'flex';
  imgElement.style.display = 'none';
  btnShowCropCanvas.style.display = 'none';

  const img = new Image();

  img.onload = function () {
    let diff = img.width > document.body.clientWidth ? img.width - document.body.clientWidth : 0;

    canvasContainer.style.width = (img.width - diff) + 'px';
    canvasContainer.style.height = (img.height - diff) + 'px';
    canvasContainer.style.maxWidth = '100%';
    alertElement.textContent = `Image: width ${img.width} | height: ${img.height}`;
  };

  img.src = blobUrl;
  cropper = new Cropnow(canvasContainer, { url: blobUrl, onCropEnded });
}

const onDownload = () => {
  download(blobUrl, new Date().toISOString());
}

const onDownloadCroppedImage = () => {
  cropper.toPng(imgFilename)
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

const onMessages = async (request, sender, sendResponse) => {
  sendResponse({ from: 'editor' });
}

btnDownloadCrop.addEventListener('click', onDownloadCroppedImage);
btnShowCropCanvas.addEventListener('click', onShowCropCanvas);
document.getElementById('btn-download').addEventListener('click', onDownload);
document.getElementById('btn-load-img').addEventListener('click', () => { fileInput.click(); });
window.addEventListener('beforeunload', onLeavePage);
chrome.runtime.onMessage.addListener(onMessages);