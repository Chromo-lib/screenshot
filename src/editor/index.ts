import * as cropLib from 'cropnow';
import { toBlob, download } from './utils.js';
import './editor.css';
import '../../node_modules/cropnow/index.css';

interface CropnowInstance {
  reset: () => void;
  toPng: (filename: string) => void;
}

interface CropnowOnCropEndedData {
  image: {
    width: number;
    height: number;
  };
  cropBox: {
    width: number;
    height: number;
  };
}

interface BackgroundMessageRequest {
  actionType: 'get-screenshot';
}

interface BackgroundMessageResponse {
  imageBase64?: string;
  editorTabId?: number | null;
  tabTitle?: string;
  message?: string;
  error?: string;
}

const Cropnow = (cropLib.default || cropLib) as {
  new(element: HTMLElement, options: { url: string; onCropEnded: (data: any) => void }): CropnowInstance;
};

const btnShowCropCanvas = document.getElementById('btn-crop') as HTMLButtonElement;
const btnDownloadCrop = document.getElementById('btn-download-crop') as HTMLButtonElement;
const btnDownload = document.getElementById('btn-download') as HTMLButtonElement;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const canvasContainer = document.getElementById('container') as HTMLDivElement;
const imgElement = document.getElementById('img') as HTMLImageElement;
const alertElement = document.querySelector('.alert') as HTMLDivElement;

if (!btnShowCropCanvas || !btnDownloadCrop || !btnDownload || !fileInput || !canvasContainer || !imgElement || !alertElement) {
  console.error("One or more essential DOM elements are missing. Please check your HTML.");
  throw new Error("Missing essential DOM elements.");
}

btnShowCropCanvas.style.display = 'none';
btnDownloadCrop.style.display = 'none';
btnDownload.style.display = 'none';

let blobUrl: string | undefined;
let cropper: CropnowInstance | undefined;
let imageBase64Data: string | undefined;

let imgUrl: string | undefined;
let imgWidth: number | undefined;
let imgHeight: number | undefined;

const initializeEditor = () => {
  chrome.runtime.sendMessage<BackgroundMessageRequest, BackgroundMessageResponse>({ actionType: 'get-screenshot' }, (response) => {
    const { imageBase64 } = response;
    if (imageBase64) {
      imageBase64Data = imageBase64;
      blobUrl = URL.createObjectURL(toBlob(imageBase64));

      imgElement.style.display = 'block';
      imgElement.src = blobUrl;

      btnShowCropCanvas.style.display = 'flex';
      btnDownload.style.display = 'flex';
    } else {
      console.warn("No screenshot image data received from background script.");
      alertElement.textContent = "No screenshot available. Upload an image or capture one.";
    }
  });
};

document.addEventListener('DOMContentLoaded', initializeEditor);

const onCropEnded = ({ _, data }: { _: any, data: CropnowOnCropEndedData }) => {
  const { image, cropBox } = data;
  alertElement.innerHTML = `<strong>Original Image: </strong> 
  width ${imgWidth || image.width} | height: ${imgHeight || image.height} 
  / <strong>Crop Box: </strong> width ${cropBox.width} | height: ${cropBox.height}`;
};

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    if (cropper) cropper.reset();
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    if (blobUrl) URL.revokeObjectURL(blobUrl);

    imgElement.style.display = 'none';
    btnDownloadCrop.style.display = 'flex';
    btnDownload.style.display = 'none';

    imgUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      imgWidth = img.width;
      imgHeight = img.height;
      const clientWidth = document.body.clientWidth;
      const diff = img.width > clientWidth ? img.width - clientWidth : 0;
      canvasContainer.style.width = `calc(${img.width}px - ${diff}px)`;
      canvasContainer.style.height = `calc(${img.height}px - ${diff}px)`;
      canvasContainer.style.maxWidth = '100%';
      alertElement.textContent = `Image: width ${img.width} | height: ${img.height}`;

      cropper = new Cropnow(canvasContainer, { url: imgUrl!, onCropEnded });
    };

    img.onerror = () => {
      console.error("Failed to load image from file input.");
      alertElement.textContent = "Error loading image from file.";
      if (imgUrl) URL.revokeObjectURL(imgUrl);
      imgUrl = undefined;
    };

    img.src = imgUrl;
  }
};

const onShowCropCanvas = () => {
  if (cropper) {
    console.warn("Cropper already initialized.");
    return;
  }
  if (!blobUrl) {
    alertElement.textContent = "No image available to crop. Please capture a screenshot or upload an image.";
    return;
  }

  btnDownloadCrop.style.display = 'flex';
  imgElement.style.display = 'none';
  btnShowCropCanvas.style.display = 'none';

  const img = new Image();
  img.onload = () => {
    imgWidth = img.width;
    imgHeight = img.height;
    const clientWidth = document.body.clientWidth;
    const diff = img.width > clientWidth ? img.width - clientWidth : 0;

    canvasContainer.style.width = `${img.width - diff}px`;
    canvasContainer.style.height = `${img.height - diff}px`;
    canvasContainer.style.maxWidth = '100%';
    alertElement.textContent = `Image: width ${img.width} | height: ${img.height}`;

    cropper = new Cropnow(canvasContainer, { url: blobUrl!, onCropEnded });
  };
  img.onerror = () => {
    console.error("Failed to load image from blob URL for cropping.");
    alertElement.textContent = "Error preparing image for cropping.";
  };
  img.src = blobUrl;
};

const onDownload = () => {
  if (blobUrl) {
    download(blobUrl);
  } else {
    alertElement.textContent = "No image to download.";
  }
};

const onDownloadCroppedImage = () => {
  if (cropper) {
    cropper.toPng(`cropped_image_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`);
  } else {
    alertElement.textContent = "No cropped image to download. Please crop an image first.";
  }
};

const onLeavePage = (e: BeforeUnloadEvent) => {
  try {
    const confirmationMessage = 'Are you sure you want to leave?';
    e.returnValue = confirmationMessage;
    if (blobUrl) {
      window.URL.revokeObjectURL(blobUrl);
      blobUrl = undefined;
    }
    if (imgUrl) {
      window.URL.revokeObjectURL(imgUrl);
      imgUrl = undefined;
    }
  } catch (error) {
    console.error("Error during page unload cleanup:", error);
    if (blobUrl) window.URL.revokeObjectURL(blobUrl);
    if (imgUrl) window.URL.revokeObjectURL(imgUrl);
  }
};

const onMessagesFromBackground = async (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): Promise<void> => {
  sendResponse({ from: 'editor' });
};

btnDownloadCrop.addEventListener('click', onDownloadCroppedImage);
btnShowCropCanvas.addEventListener('click', onShowCropCanvas);
btnDownload.addEventListener('click', onDownload);
document.getElementById('btn-load-img')!.addEventListener('click', () => { fileInput.click(); });
window.addEventListener('beforeunload', onLeavePage);
fileInput.addEventListener("change", onFileChange, false);
chrome.runtime.onMessage.addListener(onMessagesFromBackground);