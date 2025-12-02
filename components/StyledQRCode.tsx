'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';

type StyledQRCodeProps = {
  value: string;
  size?: number;
  image?: string | null; // data URL or remote URL (CORS permitting)
  onDataUrl?: (dataUrl: string) => void;
  options?: Partial<{
    dotsOptions: { color?: string; type?: string };
    cornersSquareOptions: { color?: string; type?: string };
    cornersDotOptions: { color?: string; type?: string };
    backgroundOptions: { color?: string };
    imageOptions: { imageSize?: number; margin?: number; hideBackgroundDots?: boolean };
    qrOptions: { errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' };
  }>;
};

export const StyledQRCode: React.FC<StyledQRCodeProps> = ({
  value,
  size = 360,
  image = null,
  onDataUrl,
  options = {},
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const qrRef = useRef<any | null>(null);
  const [hasImage, setHasImage] = useState<boolean>(Boolean(image));

  // default options
  const defaultOpts = {
    width: size,
    height: size,
    data: value,
    image: hasImage ? image : undefined,
    dotsOptions: {
      color: '#0f172a',
      type: 'rounded',
    },
    cornersSquareOptions: {
      color: '#0f172a',
      type: 'extra-rounded',
    },
    cornersDotOptions: {
      color: '#0f172a',
      type: 'dot',
    },
    backgroundOptions: {
      color: '#ffffff',
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 8,
      imageSize: 0.18,
      hideBackgroundDots: true,
    },
    qrOptions: {
      errorCorrectionLevel: 'H' as const,
    },
  };

  useEffect(() => {
    // Create instance once
    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling({
        ...defaultOpts,
        ...options,
        data: value,
        image: hasImage ? image : undefined,
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        qrRef.current.append(containerRef.current);
      }
    } else {
      // update values
      qrRef.current.update({
        data: value,
        image: hasImage ? image : undefined,
        width: size,
        height: size,
        ...options,
      });
    }

    // emit dataURL if callback provided
    const emitDataUrl = async () => {
      if (!qrRef.current || !onDataUrl) return;
      try {
        const blob: Blob = await qrRef.current.getRawData('png');
        const reader = new FileReader();
        reader.onloadend = () => {
          const d = reader.result as string;
          onDataUrl(d);
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        // ignore in case of environments where getRawData fails
        // console.warn('emitDataUrl failed', e);
      }
    };
    emitDataUrl();

    return () => {
      // optional cleanup: clear the DOM node
      // keep instance for performance (no heavy cleanup)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, image, hasImage, size, JSON.stringify(options)]); // conservative deps

  // download helper
  const downloadImage = async (filename = 'qr.png') => {
    if (!qrRef.current) return;
    try {
      const blob: Blob = await qrRef.current.getRawData('png');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  // When parent changes image prop, respect it and toggle hasImage
  useEffect(() => {
    setHasImage(Boolean(image));
  }, [image]);

  return (
    <div>
      <div ref={containerRef} />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => downloadImage('qr.png')}
          className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
        >
          Download PNG
        </button>

        <button
          type="button"
          onClick={() => {
            setHasImage(false);
            if (qrRef.current) {
              qrRef.current.update({ image: undefined });
            }
          }}
          className="px-3 py-2 bg-gray-200 rounded text-sm"
        >
          Remove Logo
        </button>
      </div>
    </div>
  );
};

export default StyledQRCode;
