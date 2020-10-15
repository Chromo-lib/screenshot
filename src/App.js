import React, { useEffect, useState, useRef } from 'react';
import ImageEditor from '@toast-ui/react-image-editor';

export default function App () {

  const [state, setState] = useState({ uri: null, host: null });
  const imgEeditor = useRef(null);

  useEffect(() => {
    let params = new URL(document.location).searchParams;
    setState({ uri: params.get("uri"), host: params.get('host') });
  }, []);

  useEffect(() => {
        
    let imgWidth = 0, imgHeight = 0;
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

    const btnDwonload = document.createElement("button");
    let downloadImg = () => {
      let a = document.createElement("a");
      a.href = imgEeditor.current.getInstance().toDataURL();
      a.download = state.host + '-' + new Date().toISOString() + '.png';
      a.click();
    }

    if (headerBtns) {
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
  }, [state.uri]);

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
  </div>);
}
