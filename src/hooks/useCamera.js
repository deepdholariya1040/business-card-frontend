import { useCallback, useRef, useState } from "react";

// Converts a base64 data URL (what Webcam.getScreenshot() returns)
// into a File so it can be appended to FormData identically to a
// gallery-picked file.
export const dataUrlToFile = (dataUrl, filename = "capture.jpg") => {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/data:(.*);base64/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
};

export const useCamera = () => {
  const webcamRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  const capture = useCallback((filename) => {
    const dataUrl = webcamRef.current?.getScreenshot();
    if (!dataUrl) return null;
    return { dataUrl, file: dataUrlToFile(dataUrl, filename) };
  }, []);

  return { webcamRef, isReady, setIsReady, error, setError, capture };
};
