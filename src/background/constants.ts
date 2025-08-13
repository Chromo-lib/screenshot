import { Options } from "./types";

export const DEBUGGER_PROTOCOL_VERSION = '1.3';
export const SCREENSHOT_SETTLE_DELAY_MS = 500;

export const defaultOptions: Options = {
  deviceScaleFactor: 2,
  format: "png",
  fromSurface: true,
  quality: 100,
  captureBeyondViewport: true,
  mobile: false
}