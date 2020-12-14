export default class LocalData {

  static getAllUris () {
    let local = localStorage.getItem('image-uris');
    return local ? JSON.parse(local) : [];
  }

  static saveUri (uri) {
    let local = this.getAllUris();
    if(!local.some(u => u === uri)) {
      local.push(uri);
      localStorage.setItem('image-uris', JSON.stringify(local));
    }
  }

  static clearCache () {
    let local = this.getAllUris();
    if (local && local.length > 0) {
      local.forEach(uri => {
        URL.revokeObjectURL(uri);
      });
      localStorage.removeItem('image-uris');
    }
  }

  static isCacheEmpty (isCacheClear) {
    let btnClearCache = document.getElementById('clear-memory');
    btnClearCache.classList.remove(isCacheClear ? 'bg-red' : 'bg-green');
    btnClearCache.classList.add(isCacheClear ? 'bg-green' : 'bg-red');
    btnClearCache.innerHTML = isCacheClear ? '<svg width="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' : '<svg width="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>';
    btnClearCache.innerHTML += isCacheClear ? 'Cache is empty' : 'Clear Cache';
  }
}