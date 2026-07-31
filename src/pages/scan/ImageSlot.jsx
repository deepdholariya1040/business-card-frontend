import { useRef } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import Button from "../../components/ui/Button.jsx";

export default function ImageSlot({ label, hint, previewUrl, onPick, onCamera, onClear }) {
  const fileInputRef = useRef(null);

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink-700">
        {label} {hint && <span className="font-normal text-ink-400">({hint})</span>}
      </p>

      {previewUrl ? (
        <div className="group relative overflow-hidden rounded-xl border border-ink-100">
          <img src={previewUrl} alt={label} className="aspect-video w-full object-cover" />
          <button
            onClick={onClear}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink-950/70 text-white hover:bg-ink-950"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/50 p-4">
          <p className="text-xs text-ink-400">No image selected</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onCamera}>
              <Camera className="h-4 w-4" /> Camera
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <ImagePlus className="h-4 w-4" /> Gallery
            </Button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
