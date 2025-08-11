const DEBUGGER_PROTOCOL_VERSION = '1.3';
const SCREENSHOT_SETTLE_DELAY_MS = 500;

export async function captureFullpage(tabId: number, deviceScaleFactor:number = 2): Promise<string> {
  let debuggerAttached: boolean = false;

  const sendCommandAsync = (method: string, params: object = {}): Promise<object> => {
    return new Promise((cmdResolve, cmdReject) => {
      chrome.debugger.sendCommand({ tabId }, method, params, (response: any) => {
        if (chrome.runtime.lastError) {
          return cmdReject(new Error(`${method} failed: ${chrome.runtime.lastError.message}`));
        }
        cmdResolve(response);
      });
    });
  };

  try {
    await new Promise<void>((attachResolve, attachReject) => {
      chrome.debugger.attach({ tabId }, DEBUGGER_PROTOCOL_VERSION, () => {
        if (chrome.runtime.lastError) {
          return attachReject(new Error(`Debugger attach failed: ${chrome.runtime.lastError.message}`));
        }
        debuggerAttached = true;
        attachResolve();
      });
    });

    await sendCommandAsync('Page.enable');
    await sendCommandAsync('Emulation.setEmulatedMedia', { media: 'screen' }); 
    await sendCommandAsync('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });

    const layoutMetrics = await sendCommandAsync('Page.getLayoutMetrics');
    const { contentSize } = layoutMetrics as { contentSize: { width: number; height: number } };

    await sendCommandAsync('Emulation.setDeviceMetricsOverride', {
      width: contentSize.width,
      height: contentSize.height,
      deviceScaleFactor,
      mobile: false,
    });

    await new Promise<void>(resolve => setTimeout(resolve, SCREENSHOT_SETTLE_DELAY_MS));
    const screenshotResponse = await sendCommandAsync('Page.captureScreenshot', { format: 'png', quality: 100, fromSurface: true, });
    await sendCommandAsync('Emulation.clearDeviceMetricsOverride');
    await sendCommandAsync('Emulation.setEmulatedMedia', { media: '' });
    
    return `data:image/png;base64,${(screenshotResponse as { data: string }).data}`;
  } catch (error: any) {
    console.error(`Error capturing full page screenshot: ${error.message}`);
    throw error;
  } finally {
    if (debuggerAttached) {
      chrome.debugger.detach({ tabId }, () => {
        if (chrome.runtime.lastError) {
          console.error(`Debugger detach failed: ${chrome.runtime.lastError.message}`);
        }
      });
    }
  }
}
