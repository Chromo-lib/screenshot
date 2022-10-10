mkdir -p dist \
&& cp manifest.json dist \
&& cp LICENSE dist \
&& cp -r icons dist \
&& cp -r src/popup/popup.html dist \
&& cp node_modules/cropnow/index.css dist/cropnow.css \
&& cp -r src/editor/editor.html dist