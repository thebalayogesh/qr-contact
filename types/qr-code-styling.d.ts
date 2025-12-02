// types/qr-code-styling.d.ts
declare module 'qr-code-styling' {
  interface ImageOptions {
    crossOrigin?: string;
    margin?: number;
    imageSize?: number;
    hideBackgroundDots?: boolean;
  }
  interface DotsOptions {
    color?: string;
    type?: string;
  }
  interface CornersOptions {
    color?: string;
    type?: string;
  }
  interface BackgroundOptions {
    color?: string;
  }
  interface QRCodeStylingOptions {
    width?: number;
    height?: number;
    data?: string;
    image?: string | null | undefined;
    imageOptions?: ImageOptions;
    dotsOptions?: DotsOptions;
    cornersSquareOptions?: CornersOptions;
    cornersDotOptions?: CornersOptions;
    backgroundOptions?: BackgroundOptions;
    qrOptions?: { errorCorrectionLevel?: 'L'|'M'|'Q'|'H' };
  }
  export default class QRCodeStyling {
    constructor(opts?: QRCodeStylingOptions);
    append(node: HTMLElement): void;
    update(opts: Partial<QRCodeStylingOptions>): void;
    clear(): void;
    getRawData(format?: 'png'|'webp'|'jpeg'): Promise<Blob>;
  }
}
