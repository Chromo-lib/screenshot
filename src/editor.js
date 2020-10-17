import * as ImageEditor from 'tui-image-editor';
import './tui.css';
import './editor.css';

// init
var params = new URL(document.location).searchParams;
var uri = params.get("uri"), host = params.get('host') || '', fileSize = params.get('size') || 0;

var imageEditor = new ImageEditor.default('#tui-image-editor', {
  includeUI: {
    loadImage: {
      path: uri || 'https://i.ibb.co/7vxKhYM/Above-the-clouds-1.jpg',
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

new MutationObserver(function (mutations) {
  handleSizes();
}).observe(tuiEeditorEl, { attributes: true });

// api
function handleSizes () {
  let { width, height } = imageEditor.getCanvasSize();
  tuiEeditorEl.style.setProperty("width", (width - 160) + 'px', "important");
  tuiEeditorEl.style.setProperty("height", (height - 72) + 'px', "important");
  tuiEeditorEl.style.setProperty("top", '0px', "important");
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

    case 'clear-memory':
      URL.revokeObjectURL(uri);
      e.target.classList.remove('bg-red');
      e.target.classList.add('bg-green');
      e.target.innerHTML = '<svg width="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Cache is clear';
      break;

    default:
      break;
  }
});

function createBtnFileSize () {
  fileSize = fileSize < 100000 ? (fileSize / 1000).toFixed(2) + ' Kb' : (fileSize / 1000 / 1024).toFixed(2) + ' Mb';

  btnFileSize.title = 'Click To Get New File Size';
  btnFileSize.innerHTML = `<svg width="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>`;
  btnFileSize.innerHTML += fileSize;

  btnFileSize.addEventListener('click', () => {
    let rawData = imageEditor.toDataURL();
    let fileSizeBytes = (rawData.length * (3 / 4)) - 22;

    fileSize = fileSizeBytes < 100000 ? (fileSizeBytes / 1000).toFixed(2) + ' Kb' : (fileSizeBytes / 1000 / 1024).toFixed(2) + ' Mb';
    btnFileSize.innerHTML = `<svg width="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>`;
    btnFileSize.innerHTML += fileSize;
  }, false);
}

btnNavToggle.addEventListener('click', () => {
  document.querySelector('.nav').classList.toggle('nav-open');
}, false);