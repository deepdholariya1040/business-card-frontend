import Webcam from "react-webcam";
import { Camera, RotateCcw, Check } from "lucide-react";
import { useState } from "react";
import Modal from "../../components/ui/Modal.jsx";
import Button from "../../components/ui/Button.jsx";
import { useCamera } from "../../hooks/useCamera.js";

const videoConstraints = { facingMode: "environment" };

export default function CameraCapture({ open, onClose, onCapture, label }) {
  const { webcamRef, capture } = useCamera();
  const [preview, setPreview] = useState(null);

  const handleCapture = () => {
    const result = capture(`${label.toLowerCase()}-${Date.now()}.jpg`);
    if (result) setPreview(result);
  };

  const handleConfirm = () => {
    if (preview) {
      onCapture(preview.file, preview.dataUrl);
      setPreview(null);
      onClose();
    }
  };

  const handleClose = () => {
    setPreview(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={`Capture ${label} of card`} size="lg">
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-xl bg-ink-950">
          {preview ? (
            <img src={preview.dataUrl} alt="Preview" className="w-full" />
          ) : (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full"
            />
          )}
          {!preview && (
            <div className="pointer-events-none absolute inset-8 rounded-lg border-2 border-dashed border-signal/60" />
          )}
        </div>

        <div className="flex justify-center gap-3">
          {preview ? (
            <>
              <Button variant="outline" onClick={() => setPreview(null)}>
                <RotateCcw className="h-4 w-4" /> Retake
              </Button>
              <Button variant="signal" onClick={handleConfirm}>
                <Check className="h-4 w-4" /> Use this photo
              </Button>
            </>
          ) : (
            <Button variant="signal" onClick={handleCapture}>
              <Camera className="h-4 w-4" /> Capture
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
