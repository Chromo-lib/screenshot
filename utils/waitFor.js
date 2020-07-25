module.exports = function waitFor (ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}