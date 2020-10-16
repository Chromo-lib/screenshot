import * as ImageEditor from 'tui-image-editor';
import './tui.css';
import './editor.css';

// init
var params = new URL(document.location).searchParams;
var uri = params.get("uri"), host = params.get('host'), fileSize = params.get('size');

var imageEditor = new ImageEditor.default(document.querySelector('#tui-image-editor'), {
  includeUI: {
    loadImage: {
      path: uri,
      name: 'SampleImage'
    },
    menu: ["crop", "flip", "rotate", "draw", "shape", "text", "filter"],
    initMenu: '',
    menuBarPosition: 'bottom'
  },
  selectionStyle: {
    cornerSize: 20,
    rotatingPointOffset: 70
  },
  usageStatistics: false
});

let tuiEeditorEl = document.querySelector('.tui-image-editor');
let headerBtns = document.querySelector('.tui-image-editor-header-buttons');

handleSizes();
createBtnDownload();
createBtnOpenRaw();
createDivFileSize();

new MutationObserver(function (mutations) {
  handleSizes();
}).observe(tuiEeditorEl, { attributes: true });

// api
function openImgRaw () {
  let b64Data = imageEditor.toDataURL();
  fetch(b64Data)
    .then(res => res.blob())
    .then(blob => {
      const file = new File([blob], "File name", { type: "image/png" });
      window.open(URL.createObjectURL(file), '_blank').focus();
    });
}

function downloadImg () {
  let a = document.createElement("a");
  a.href = imageEditor.toDataURL();
  a.download = host + '-' + new Date().toISOString() + '.png';
  a.click();
}

function handleSizes () {
  let { width, height } = imageEditor.getCanvasSize();
  tuiEeditorEl.style.setProperty("width", (width - 160) + 'px', "important");
  tuiEeditorEl.style.setProperty("height", (height - 80) + 'px', "important");
  tuiEeditorEl.style.setProperty("left", '0px', "important");
}

function createDivFileSize () {

  fileSize = fileSize < 100000 ? (fileSize / 1000).toFixed(2) + ' Kb' : (fileSize / 1000 / 1024).toFixed(2) + ' Mb';
  const divFileSize = document.createElement('div');
  divFileSize.classList.add('btn', 'bg-rose');
  divFileSize.title = 'Click To Get New File Size';
  divFileSize.innerHTML = `<svg width="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>${fileSize}`;

  headerBtns.insertAdjacentElement('afterbegin', divFileSize);

  divFileSize.addEventListener('click', () => {
    let rawData = imageEditor.toDataURL();
    let fileSizeBytes = (rawData.length * (3 / 4)) - 22;

    fileSize = fileSizeBytes < 100000 ? (fileSizeBytes / 1000).toFixed(2) + ' Kb' : (fileSizeBytes / 1000 / 1024).toFixed(2) + ' Mb';
    divFileSize.innerHTML = `<svg width="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>${fileSize}`;
  }, false);
}

function createBtnOpenRaw () {
  const btnOpenRaw = document.createElement('button');
  btnOpenRaw.title = 'Open Image In Raw Page';
  btnOpenRaw.innerHTML = `<svg width="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>Open raw`;
  btnOpenRaw.classList.add('bg-green');
  btnOpenRaw.addEventListener('click', openImgRaw, false);
  headerBtns.insertAdjacentElement('afterbegin', btnOpenRaw);
}

function createBtnDownload () {
  const btnDwonload = document.createElement('button');
  btnDwonload.title = 'Download File';
  btnDwonload.innerHTML = `<svg width="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>Download`;
  btnDwonload.addEventListener('click', downloadImg, false);
  headerBtns.appendChild(btnDwonload);
}
