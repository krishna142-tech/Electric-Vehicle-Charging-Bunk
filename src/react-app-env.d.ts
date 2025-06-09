/// <reference types="react-scripts" />

declare module 'html5-qrcode' {
  export class Html5Qrcode {
    constructor(elementId: string);
    start(
      cameraIdOrConfig: any,
      configuration: any,
      qrCodeSuccessCallback: (decodedText: string, decodedResult: any) => void,
      qrCodeErrorCallback?: (errorMessage: string) => void
    ): Promise<void>;
    stop(): Promise<void>;
    clear(): void;
  }

  export class Html5QrcodeScanner {
    constructor(elementId: string, config: any, verbose?: boolean);
    render(
      qrCodeSuccessCallback: (decodedText: string, decodedResult: any) => void,
      qrCodeErrorCallback?: (errorMessage: string) => void
    ): void;
    clear(): void;
    unbindAll(): void;
  }
}