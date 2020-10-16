import React, { useEffect, useState, useRef } from 'react';
import ImageEditor from '@toast-ui/react-image-editor';

function convertBytes (bytes) {
  if (bytes < 1000000) {
    return (bytes / 1024).toFixed(2) + ' kb';
  }
  else {
    return (bytes / 1e+6).toFixed(2) + ' mb';
  }
}

export default function App () {

  const [state, setState] = useState({ uri: null, host: null });
  const [fileSize, setFileSize] = useState(null);
  const imgEeditor = useRef(null);

  useEffect(() => {
    let params = new URL(document.location).searchParams;
    setState({ uri: params.get("uri"), host: params.get('host') });
  }, []);

  useEffect(() => {

    let imgWidth = 0, imgHeight = 0, dataIMG = null;
    let tuiEeditorEl = document.querySelector('.tui-image-editor');
    let headerBtns = document.querySelector('.tui-image-editor-header-buttons');

    const handleSizes = () => {
      if (tuiEeditorEl && imgWidth > 200) {
        tuiEeditorEl.style.setProperty("width", (imgWidth - 150) + 'px', "important");
        tuiEeditorEl.style.setProperty("height", (imgHeight - 70) + 'px', "important");
        tuiEeditorEl.style.setProperty("left", '0px', "important");
      }
    }

    if (tuiEeditorEl && state.uri) {
      let imgEl = document.createElement('img');

      imgEl.onload = () => {
        document.body.appendChild(imgEl);
        imgHeight = imgEl.clientHeight;
        imgWidth = imgEl.clientWidth;
        tuiEeditorEl.style.setProperty("width", (imgWidth - 150) + 'px', "important");
        tuiEeditorEl.style.setProperty("height", (imgHeight - 70) + 'px', "important");
        imgEl.style.display = 'none';
      }

      imgEl.src = state.uri;
    }

    // get image data as base 64
    if (imgEeditor && imgEeditor.current) {
      dataIMG = imgEeditor.current.getInstance().toDataURL();
      let base64str = dataIMG.substr(22);
      let decoded = atob(base64str);
      setFileSize(convertBytes(decoded.length));
    }

    const btnDwonload = document.createElement("button");
    let downloadImg = () => {
      let a = document.createElement("a");
      a.href = dataIMG;
      a.download = state.host + '-' + new Date().toISOString() + '.png';
      a.click();
    }

    if (headerBtns && dataIMG) {
      btnDwonload.textContent = 'Download';
      headerBtns.appendChild(btnDwonload);
    }

    btnDwonload.addEventListener('click', downloadImg, false);
    window.addEventListener('click', handleSizes, false);
    window.addEventListener('mousedown', handleSizes, false);

    return () => {
      btnDwonload.removeEventListener('click', downloadImg);
      window.removeEventListener('click', handleSizes);
      window.removeEventListener('mousedown', handleSizes);
    }
  }, [state.uri, imgEeditor]);

  const onAction = (actionType) => {
    switch (actionType) {
      case 'raw-page':
        window.open(state.uri, '_blank').focus();
        break;

      default:
        break;
    }
  }

  return (<div className="w-100 h-100">
    {state.uri && <ImageEditor
      ref={imgEeditor}
      includeUI={{
        loadImage: {
          path: state.uri,
          name: 'SampleImage'
        },
        cssMaxWidth: 2000,
        cssMaxHeight: 8540,
        menu: ["crop", "flip", "rotate", "draw", "shape", "text", "filter"],
        initMenu: '',
        menuBarPosition: 'left'
      }}
      usageStatistics={false}
    />}

    {fileSize && <div className="more-tools">
      <button onClick={() => { onAction('raw-page') }} className="bg-green"><svg width="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>open raw</button>
      <div className="button">
        <svg width="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        {fileSize}
      </div>
    </div>}
  </div>);
}
