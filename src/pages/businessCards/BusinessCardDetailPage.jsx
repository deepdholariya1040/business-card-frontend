import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  QrCode,
  Barcode,
  User,
  Briefcase,
  Image as ImageIcon,
} from "lucide-react";

import {
  fetchBusinessCardById,
  deleteBusinessCard,
} from "../../services/businessCards.service.js";
import { getErrorMessage } from "../../lib/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDateTime } from "../../utils/format.js";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { ErrorState } from "../../components/ui/EmptyState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";

const DetailRow = ({ icon: Icon, label, value, mono }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" />
      <div className="min-w-0">
        <p className="text-xs text-ink-400">{label}</p>
        <p
          className={`break-words text-sm text-ink-800 ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

export default function BusinessCardDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    data: card,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["business-card", id],
    queryFn: () => fetchBusinessCardById(id),
  });

  const params = useParams();

  console.log("params:", params);
  console.log("id:", params.id);

  const deleteMutation = useMutation({
    mutationFn: () => deleteBusinessCard(id),
    onSuccess: (res) => {
      toast.success(res.message || "Business card deleted.");
      queryClient.invalidateQueries({ queryKey: ["business-cards"] });
      navigate("/business-cards");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <PageLoader label="Loading card details…" />;
  if (isError || !card)
    return (
      <ErrorState description="This business card couldn't be found or you don't have access to it." />
    );

  console.log("CARD DATA:", card);
  console.log("frontImage:", card?.frontImage);
  console.log("frontImageUrl:", card?.frontImageUrl);
  console.log("backImageUrl:", card?.backImageUrl);

  const {
    parsedData = {},
    dynamicFields = {},
    qrCodes = [],
    barcodes = [],
  } = card;
  const dynamicEntries = Object.entries(dynamicFields || {}).filter(
    ([, v]) => v && (!Array.isArray(v) || v.length),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          to="/business-cards"
          className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to cards
        </Link>
        <div className="flex gap-2">
          <Link to={`/business-cards/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader
              title={parsedData.name || "Unnamed contact"}
              subtitle={
                [parsedData.designation, parsedData.company]
                  .filter(Boolean)
                  .join(" · ") || "No title or company parsed"
              }
            />
            <CardBody className="divide-y divide-ink-50">
              <DetailRow
                icon={User}
                label="Full name"
                value={parsedData.name}
              />
              <DetailRow
                icon={Briefcase}
                label="Designation"
                value={parsedData.designation}
              />
              <DetailRow
                icon={Building2}
                label="Company"
                value={parsedData.company}
              />
              <DetailRow
                icon={Mail}
                label="Primary email"
                value={parsedData.email}
              />
              <DetailRow
                icon={Globe}
                label="Website"
                value={parsedData.website}
              />
              <DetailRow
                icon={MapPin}
                label="Address"
                value={parsedData.address}
              />
              {(parsedData.phones || []).map((phone, i) => (
                <DetailRow
                  key={i}
                  icon={Phone}
                  label={`Phone ${i + 1}`}
                  value={phone}
                  mono
                />
              ))}
            </CardBody>
          </Card>

          {(card.phones?.length > 0 ||
            card.emails?.length > 0 ||
            card.websites?.length > 0) && (
            <Card>
              <CardHeader
                title="Additional contact details"
                subtitle="Extracted separately from the OCR engine's richer parser."
              />
              <CardBody className="divide-y divide-ink-50">
                {(card.phones || []).map((v, i) => (
                  <DetailRow
                    key={`p${i}`}
                    icon={Phone}
                    label="Phone"
                    value={v}
                    mono
                  />
                ))}
                {(card.emails || []).map((v, i) => (
                  <DetailRow
                    key={`e${i}`}
                    icon={Mail}
                    label="Email"
                    value={v}
                  />
                ))}
                {(card.websites || []).map((v, i) => (
                  <DetailRow
                    key={`w${i}`}
                    icon={Globe}
                    label="Website"
                    value={v}
                  />
                ))}
              </CardBody>
            </Card>
          )}

          {dynamicEntries.length > 0 && (
            <Card>
              <CardHeader
                title="Additional fields"
                subtitle="PAN, GST, social handles, UPI, and other detected details."
              />
              <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {dynamicEntries.map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs capitalize text-ink-400">
                      {key.replace(/([A-Z])/g, " $1")}
                    </p>
                    <p className="break-words font-mono text-sm text-ink-800">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </p>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {(qrCodes.length > 0 || barcodes.length > 0) && (
            <Card>
              <CardHeader title="Codes detected" />
              <CardBody className="space-y-3">
                {qrCodes.map((qr, i) => (
                  <div
                    key={`qr${i}`}
                    className="flex items-start gap-3 rounded-lg bg-ink-50 p-3"
                  >
                    <QrCode className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                    <div className="min-w-0">
                      <div className="flex gap-1.5">
                        <Badge tone="signal">{qr.dataType}</Badge>
                      </div>
                      <p className="mt-1 break-words font-mono text-xs text-ink-700">
                        {qr.content}
                      </p>
                    </div>
                  </div>
                ))}
                {barcodes.map((bc, i) => (
                  <div
                    key={`bc${i}`}
                    className="flex items-start gap-3 rounded-lg bg-ink-50 p-3"
                  >
                    <Barcode className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                    <div className="min-w-0">
                      <Badge tone="neutral">{bc.type}</Badge>
                      <p className="mt-1 break-words font-mono text-xs text-ink-700">
                        {bc.content}
                      </p>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Card images" />
            <CardBody className="space-y-3">
              {card.frontImageUrl ? (
                <img
                  src={card.frontImageUrl}
                  alt="Front of card"
                  className="w-full rounded-lg border border-ink-100 object-cover"
                />
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-ink-200 text-ink-300">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
              {card.backImageUrl && (
                <img
                  src={card.backImageUrl}
                  alt="Back of card"
                  className="w-full rounded-lg border border-ink-100 object-cover"
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Metadata" />
            <CardBody className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-400">Scanned</span>
                <span className="text-ink-700">
                  {formatDateTime(card.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Last updated</span>
                <span className="text-ink-700">
                  {formatDateTime(card.updatedAt)}
                </span>
              </div>
              
              {card.createdBy?.name && (
                <div className="flex justify-between">
                  <span className="text-ink-400">Scanned by</span>
                  <span className="text-ink-700">{card.createdBy.name}</span>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        title="Delete this business card?"
        description="This permanently removes the card and its parsed data. This cannot be undone."
        confirmLabel="Delete permanently"
      />
    </div>
  );
}
