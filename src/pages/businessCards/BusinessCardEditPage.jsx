import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

import { fetchBusinessCardById, updateBusinessCard } from "../../services/businessCards.service.js";
import { businessCardEditSchema } from "../../utils/validators.js";
import { getErrorMessage } from "../../lib/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { Field, Input, Textarea } from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { ErrorState } from "../../components/ui/EmptyState.jsx";

/**
 * Converts a plain `{ key: value }` object (e.g. card.dynamicFields) into an
 * array of editable rows with a stable internal `id` used only for React
 * list keys — it is never sent to the backend.
 */
function dynamicFieldsObjectToRows(dynamicFields) {
  if (!dynamicFields || typeof dynamicFields !== "object") return [];
  return Object.entries(dynamicFields).map(([key, value], index) => ({
    id: `existing-${index}-${key}`,
    key,
    value: value ?? "",
  }));
}

/**
 * Converts editable rows back into a plain `{ key: value }` object for the
 * update payload. Rows with an empty/whitespace-only field name are dropped
 * (this also naturally covers the "no dynamic fields" case -> {}).
 */
function dynamicFieldRowsToObject(rows) {
  return rows.reduce((acc, row) => {
    const key = row.key.trim();
    if (key) acc[key] = row.value;
    return acc;
  }, {});
}

export default function BusinessCardEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [phones, setPhones] = useState([""]);
  const [dynamicFields, setDynamicFields] = useState([]);
  const dynamicFieldIdCounter = useRef(0);

  const { data: card, isLoading, isError } = useQuery({
    queryKey: ["business-card", id],
    queryFn: () => fetchBusinessCardById(id),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(businessCardEditSchema),
    defaultValues: { parsedData: {} },
  });

  useEffect(() => {
    if (card) {
      reset({
        parsedData: {
          name: card.parsedData?.name || "",
          designation: card.parsedData?.designation || "",
          company: card.parsedData?.company || "",
          email: card.parsedData?.email || "",
          website: card.parsedData?.website || "",
          address: card.parsedData?.address || "",
        },
      });
      setPhones(card.parsedData?.phones?.length ? card.parsedData.phones : [""]);
      setDynamicFields(dynamicFieldsObjectToRows(card.dynamicFields));
    }
  }, [card, reset]);

  const mutation = useMutation({
    mutationFn: (payload) => updateBusinessCard(id, payload),
    onSuccess: (res) => {
      toast.success(res.message || "Business card updated.");
      queryClient.invalidateQueries({ queryKey: ["business-card", id] });
      queryClient.invalidateQueries({ queryKey: ["business-cards"] });
      navigate(`/business-cards/${id}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (values) => {
    mutation.mutate({
      parsedData: {
        ...values.parsedData,
        phones: phones.map((p) => p.trim()).filter(Boolean),
      },
      dynamicFields: dynamicFieldRowsToObject(dynamicFields),
    });
  };

  const addDynamicField = () => {
    dynamicFieldIdCounter.current += 1;
    setDynamicFields((prev) => [
      ...prev,
      { id: `new-${dynamicFieldIdCounter.current}`, key: "", value: "" },
    ]);
  };

  const updateDynamicFieldKey = (rowId, newKey) => {
    setDynamicFields((prev) => prev.map((row) => (row.id === rowId ? { ...row, key: newKey } : row)));
  };

  const updateDynamicFieldValue = (rowId, newValue) => {
    setDynamicFields((prev) => prev.map((row) => (row.id === rowId ? { ...row, value: newValue } : row)));
  };

  const removeDynamicField = (rowId) => {
    setDynamicFields((prev) => prev.filter((row) => row.id !== rowId));
  };

  if (isLoading) return <PageLoader label="Loading card…" />;
  if (isError || !card) return <ErrorState description="This business card couldn't be found or you don't have access to it." />;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link to={`/business-cards/${id}`} className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="h-4 w-4" /> Back to card
      </Link>

      <Card>
        <CardHeader title="Edit business card" subtitle="Update the parsed contact details." />
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.parsedData?.name?.message}>
                <Input {...register("parsedData.name")} />
              </Field>
              <Field label="Designation" error={errors.parsedData?.designation?.message}>
                <Input {...register("parsedData.designation")} />
              </Field>
            </div>

            <Field label="Company" error={errors.parsedData?.company?.message}>
              <Input {...register("parsedData.company")} />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Email" error={errors.parsedData?.email?.message}>
                <Input type="email" {...register("parsedData.email")} />
              </Field>
              <Field label="Website" error={errors.parsedData?.website?.message}>
                <Input {...register("parsedData.website")} />
              </Field>
            </div>

            <Field label="Address" error={errors.parsedData?.address?.message}>
              <Textarea {...register("parsedData.address")} />
            </Field>

            <Field label="Phone numbers">
              <div className="space-y-2">
                {phones.map((phone, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={phone}
                      onChange={(e) => setPhones((prev) => prev.map((p, idx) => (idx === i ? e.target.value : p)))}
                      placeholder="+1 555 000 0000"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => setPhones((prev) => prev.filter((_, idx) => idx !== i))}
                      disabled={phones.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setPhones((prev) => [...prev, ""])}>
                  <Plus className="h-4 w-4" /> Add phone
                </Button>
              </div>
            </Field>

            {/* --- Additional Fields (dynamic key/value pairs) --- */}
            <Field label="Additional Fields">
              <div className="space-y-2">
                {dynamicFields.length === 0 && (
                  <p className="text-sm text-ink-400">No additional fields yet. Add one below.</p>
                )}
                {dynamicFields.map((row) => (
                  <div key={row.id} className="flex gap-2">
                    <Input
                      value={row.key}
                      onChange={(e) => updateDynamicFieldKey(row.id, e.target.value)}
                      placeholder="Field name (e.g. panNumber)"
                      className="w-2/5"
                    />
                    <Input
                      value={row.value}
                      onChange={(e) => updateDynamicFieldValue(row.id, e.target.value)}
                      placeholder="Field value"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => removeDynamicField(row.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addDynamicField}>
                  <Plus className="h-4 w-4" /> Add Field
                </Button>
              </div>
            </Field>
          </CardBody>

          <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-4">
            <Link to={`/business-cards/${id}`}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" isLoading={mutation.isPending}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
