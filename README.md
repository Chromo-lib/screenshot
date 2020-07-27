# Wshot
Online webpage screenshot service that takes a full page snapshot (Beta)

### API
URL parameters:
- url: The URL of the website to screenshot
- width: The viewport width (in pixels), defaults to document.documentElement.offsetWidth
- height: The viewport height (in pixels), defaults to document.documentElement.offsetHeight

```
Example: ?url=https://reactjs.org&width=1280&height=800
```

![](example.png)

### Running the server locally
```npm run start```
Open in your browser at http://localhost:3131/?url=https://reactjs.org
