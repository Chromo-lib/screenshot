import * as ImageEditor from 'tui-image-editor';
import './tui.css';
import './editor.css';

// init
var params = new URL(document.location).searchParams,
  uri = params.get("uri") || 'https://i.ibb.co/7vxKhYM/Above-the-clouds-1.jpg',
  host = params.get('host') || 'screeno',
  fileSize = params.get('size') || 0;

var imageEditor = new ImageEditor.default('#tui-image-editor', {
  includeUI: {
    loadImage: {
      path: uri,
      name: 'SampleImage'
    },
    menu: ["crop", "flip", "rotate", "draw", "shape", "text", "filter", "mask"],
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
let btnNavToggle = document.querySelector('.nav__toggle');
let btnFileSize = document.querySelector('.btn-file-size');

handleSizes();
createBtnFileSize();

new MutationObserver((mutations) => {
  handleSizes();
}).observe(tuiEeditorEl, { attributes: true });

// api
function handleSizes () {
  if (uri) {
    let img = new Image();
    img.onload = () => {
      img.style.setProperty("max-width", '90%');
      document.body.appendChild(img)

      tuiEeditorEl.style.setProperty("width", img.clientWidth + 'px', "important");
      tuiEeditorEl.style.setProperty("height", img.clientHeight + 'px', "important");
      tuiEeditorEl.style.setProperty("top", '0px', "important");

      setCache(false);
      img.style.display = 'none';
    }
    img.src = uri;
  }
}
// ui
document.getElementById('editor-controls').addEventListener('click', (e) => {
  switch (e.target.dataset.action) {
    case 'download':
      let inputFileName = document.getElementById('filename').value;
      let a = document.createElement("a");
      a.href = imageEditor.toDataURL();
      a.download = inputFileName.length > 0 ? inputFileName : host + '-' + new Date().toISOString() + '.png';
      a.click();
      inputFileName = '';
      break;

    case 'open-raw':
      let b64Data = imageEditor.toDataURL();
      fetch(b64Data)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "File name", { type: "image/png" });
          window.open(URL.createObjectURL(file), '_blank').focus();
          URL.revokeObjectURL(file);
        });
      break;

    case 'load-new-image':
      document.querySelector('.tui-image-editor-load-btn').click();
      break;

    case 'clear-memory':
      URL.revokeObjectURL(uri);
      uri = null;
      setCache(true);
      break;

    default:
      break;
  }
});

function createBtnFileSize () {
  btnFileSize.title = 'Click To Get New File Size';
  setFileSizeEL(fileSize);

  btnFileSize.addEventListener('click', () => {
    let rawData = imageEditor.toDataURL();
    let fileSizeBytes = (rawData.length * (3 / 4)) - 22;

    fileSize = fileSizeBytes < 100000 ? (fileSizeBytes / 1000).toFixed(2) + ' Kb' : (fileSizeBytes / 1000 / 1024).toFixed(2) + ' Mb';
    btnFileSize.innerHTML = `<svg width="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>`;
    btnFileSize.innerHTML += fileSize;
  }, false);
}

function setFileSizeEL (fileSize) {
  fileSize = fileSize < 100000 ? (fileSize / 1000).toFixed(2) + ' Kb' : (fileSize / 1000 / 1024).toFixed(2) + ' Mb';
  btnFileSize.innerHTML = `<svg width="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>`;
  btnFileSize.innerHTML += fileSize;
}

function setCache (isCacheClear) {
  let btnClearCache = document.getElementById('clear-memory');
  btnClearCache.classList.remove(isCacheClear ? 'bg-red' : 'bg-green');
  btnClearCache.classList.add(isCacheClear ? 'bg-green' : 'bg-red');
  btnClearCache.innerHTML = isCacheClear ? '<svg width="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' : '<svg width="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>';
  btnClearCache.innerHTML += isCacheClear ? 'Cache is empty' : 'Clear Cache';
}

document.querySelector('.tui-image-editor-load-btn').addEventListener('change', async (e) => {
  let files = e.target.files;
  if (files && files.length > 0) {
    setFileSizeEL(files[0].size);
    uri = URL.createObjectURL(files[0]);
    setCache(false);
  }
}, false);

btnNavToggle.addEventListener('click', () => {
  document.querySelector('.nav').classList.toggle('nav-open');
}, false);