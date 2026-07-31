import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ScanLine, ArrowRight, RefreshCcw, CheckCircle2 } from "lucide-react";

import { scanBusinessCard } from "../../services/ocr.service.js";
import { getErrorMessage } from "../../lib/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import ImageSlot from "./ImageSlot.jsx";
import CameraCapture from "./CameraCapture.jsx";

export default function ScanPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [front, setFront] = useState(null); // { file, url }
  const [back, setBack] = useState(null);
  const [cameraTarget, setCameraTarget] = useState(null); // "front" | "back" | null
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const setImage = (target, file) => {
    const url = URL.createObjectURL(file);
    if (target === "front") setFront({ file, url });
    else setBack({ file, url });
  };

  const mutation = useMutation({
    mutationFn: () =>
      scanBusinessCard(
        { frontImage: front?.file, backImage: back?.file },
        {
          onUploadProgress: (evt) => {
            if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
          },
        }
      ),
    onSuccess: (res) => {
      console.log("FULL RESPONSE:", res);
  console.log("DATA:", res.data);
  console.log("DATA._ID:", res.data?._id);
  console.log("TYPE:", typeof res.data?._id);
  
      toast.success(res.message || "Card scanned successfully.");
      setResult(res.data);
      queryClient.invalidateQueries({ queryKey: ["business-cards"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
    onSettled: () => setProgress(0),
  });

  const reset = () => {
    setFront(null);
    setBack(null);
    setResult(null);
  };

  if (result) {
    return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardBody className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink-900">Card scanned successfully</h2>
              <p className="mt-1 text-sm text-ink-500">
                {result.parsedData?.name || "This contact"} has been added to your business cards.
              </p>
            </div>

            <div className="w-full space-y-1.5 rounded-lg bg-ink-50 p-4 text-left text-sm">
              <div className="flex justify-between"><span className="text-ink-400">Name</span><span className="font-medium text-ink-800">{result.parsedData?.name || "—"}</span></div>
              <div className="flex justify-between"><span className="text-ink-400">Company</span><span className="font-medium text-ink-800">{result.parsedData?.company || "—"}</span></div>
              <div className="flex justify-between"><span className="text-ink-400">Email</span><span className="font-medium text-ink-800">{result.parsedData?.email || "—"}</span></div>
            </div>

            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1" onClick={reset}>
                <RefreshCcw className="h-4 w-4" /> Scan another
              </Button>
              <Button
  className="flex-1"
  onClick={() => {
    console.log("RESULT =", result);
    console.log("RESULT._ID =", result._id);
    console.log("TYPE =", typeof result._id);
    console.log("JSON =", JSON.stringify(result._id, null, 2));

    navigate(`/business-cards/${result._id}`);
  }}
>
  View card <ArrowRight className="h-4 w-4" />
</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Scan a business card</h2>
        <p className="mt-1 text-sm text-ink-400">
          Capture or upload the front (required) and back (optional) of the card. We'll extract contact
          details, QR codes, and barcodes automatically.
        </p>
      </div>

      <Card>
        <CardHeader title="Card images" />
        <CardBody className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ImageSlot
            label="Front"
            hint="required"
            previewUrl={front?.url}
            onPick={(file) => setImage("front", file)}
            onCamera={() => setCameraTarget("front")}
            onClear={() => setFront(null)}
          />
          <ImageSlot
            label="Back"
            hint="optional"
            previewUrl={back?.url}
            onPick={(file) => setImage("back", file)}
            onCamera={() => setCameraTarget("back")}
            onClear={() => setBack(null)}
          />
        </CardBody>

        <div className="border-t border-ink-100 px-5 py-4">
          {mutation.isPending && progress > 0 && (
            <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full bg-signal transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          <Button
            variant="signal"
            className="w-full"
            disabled={!front && !back}
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            <ScanLine className="h-4 w-4" /> Run OCR scan
          </Button>
        </div>
      </Card>

      <CameraCapture
        open={cameraTarget !== null}
        label={cameraTarget === "front" ? "Front" : "Back"}
        onClose={() => setCameraTarget(null)}
        onCapture={(file) => setImage(cameraTarget, file)}
      />
    </div>
  );
}
