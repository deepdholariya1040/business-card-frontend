import api from "../lib/axios.js";

// POST /ocr/scan — multipart/form-data, fields: frontImage, backImage
// (at least one required). Returns the newly created BusinessCard,
// enriched with frontImageUrl/backImageUrl by responseMapper.middleware.js.
export const scanBusinessCard = ({ frontImage, backImage }, { onUploadProgress } = {}) => {
  const formData = new FormData();
  if (frontImage) formData.append("frontImage", frontImage);
  if (backImage) formData.append("backImage", backImage);

  return api
    .post("/ocr/scan", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    })
    .then((r) => r.data);
};
