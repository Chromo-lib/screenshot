import { defaultOptions, DEBUGGER_PROTOCOL_VERSION, SCREENSHOT_SETTLE_DELAY_MS } from './constants'
import { Options } from './types';

export async function captureFullpage(tabId: number, options?: Options): Promise<string> {
  const finalOptions = { ...defaultOptions, ...options };
  let debuggerAttached = false;

  const sendCommandAsync = (method: string, params: object = {}): Promise<object> => {
    return new Promise((cmdResolve, cmdReject) => {
      // @ts-ignore: Unreachable code error
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

    const scrollWidthResult = await sendCommandAsync('Runtime.evaluate', { expression: 'document.documentElement.scrollWidth', });
    const widthHeight = (scrollWidthResult as { result: { value: number } }).result.value || contentSize.width;

    const scrollHeightResult = await sendCommandAsync('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', });
    const scrollHeight = (scrollHeightResult as { result: { value: number } }).result.value || contentSize.height;

    await sendCommandAsync('Emulation.setDeviceMetricsOverride', {
      width: widthHeight,
      height: scrollHeight,
      deviceScaleFactor: finalOptions.deviceScaleFactor,
      mobile: finalOptions.mobile,
    });

    await new Promise<void>(resolve => setTimeout(resolve, SCREENSHOT_SETTLE_DELAY_MS));
    const screenshotResponse = await sendCommandAsync('Page.captureScreenshot', {
      format: defaultOptions.format,
      quality: defaultOptions.quality,
      fromSurface: defaultOptions.fromSurface,
      captureBeyondViewport: finalOptions.captureBeyondViewport,
    });
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
