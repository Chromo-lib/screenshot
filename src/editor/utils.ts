export function toBlob(dataURI) {
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

export function download(imageBase64: string) {
  chrome.downloads.download({
    url: imageBase64,
    filename: `screenshot-${Date.now()}.png`,
    saveAs: true,
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error(`Download failed: ${chrome.runtime.lastError.message}`);
    } else {
      console.log(`Download started with ID: ${downloadId}`);
    }
  });
}