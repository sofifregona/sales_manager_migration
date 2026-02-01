import { useCallback, useEffect, useRef, useState } from "react";
import {
  productSampleImages,
  type ProductSampleImage,
} from "../assets/sampleImages";

const clearPreviewUrl = (url: string | null) => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

type Props = {
  inputId?: string;
  name?: string;
  sampleFieldName?: string;
  sampleLabelFieldName?: string;
  url?: string | null;
};

export function ProductImageInput({
  inputId = "image",
  name = "image",
  sampleFieldName = "selectedSampleImage",
  sampleLabelFieldName,
  url = null,
}: Props) {
  const fallbackUrl = url ?? productSampleImages[0].url;
  const [imagePreview, setImagePreview] = useState<string | null>(fallbackUrl);
  const [selectedSample, setSelectedSample] = useState<{
    id: string;
    label: string;
    url: string;
  } | null>(null);
  const [isOverlayOpen, setOverlayOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const labelFieldName = sampleLabelFieldName ?? `${sampleFieldName}Label`;

  const setNewImagePreview = useCallback((next: string | null) => {
    setImagePreview((current) => {
      if (current && current !== next) {
        clearPreviewUrl(current);
      }
      return next;
    });
  }, []);

  const handleManualImageSelection = () => {
    setOverlayOpen(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      handleClearImage();
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setNewImagePreview(previewUrl);
    setSelectedSample(null);
    setOverlayOpen(false);
  };

  const handleSampleSelect = (sample: ProductSampleImage) => {
    setNewImagePreview(sample.url);
    setSelectedSample({ id: sample.id, label: sample.label, url: sample.url });
    setOverlayOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearImage = useCallback(() => {
    setNewImagePreview(null);
    setSelectedSample(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setNewImagePreview]);

  useEffect(() => {
    return () => {
      clearPreviewUrl(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    setNewImagePreview(url ?? productSampleImages[0].url);
  }, [url, setNewImagePreview]);

  return (
    <>
      <div className="form-pill-img">
        <div className="form-pill-img__image-field">
          <div className="form-pill-img__image-preview">
            <img src={imagePreview ?? undefined} alt="Previsualización" />
            <div className="form-pill-img__image-actions">
              {imagePreview && imagePreview !== url ? (
                <button
                  type="button"
                  className="form-pill-img__clear-image form-pill-img__ghost-button"
                  onClick={handleClearImage}
                >
                  Quitar
                </button>
              ) : (
                <p className="form-pill-img__image-hint-text">
                  Elija una imagen
                </p>
              )}
              <button
                type="button"
                className="secondary-btn select-img-btn"
                onClick={() => setOverlayOpen(true)}
              >
                Elegir imagen
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            id={inputId}
            name={name}
            type="file"
            accept="image/*"
            className="form-pill-img__file-input"
            onChange={handleFileChange}
          />
        </div>
        <input
          type="hidden"
          name={sampleFieldName}
          value={selectedSample?.url ?? ""}
        />
        <input
          type="hidden"
          name={labelFieldName}
          value={selectedSample?.label ?? ""}
        />
      </div>

      {isOverlayOpen && (
        <div
          className="form-pill-img__image-overlay"
          role="dialog"
          aria-modal="true"
        >
          <div className="form-pill-img__image-overlay-content">
            <header className="form-pill-img__image-overlay-header">
              <h3>Galería de imágenes</h3>
              <button
                type="button"
                className="form-pill-img__ghost-button"
                onClick={() => setOverlayOpen(false)}
                aria-label="Cerrar galería"
              >
                Cerrar
              </button>
            </header>
            <div className="form-pill-img__image-grid">
              {productSampleImages.slice(1).map((sample) => (
                <>
                  {console.log(sample)}
                  <button
                    type="button"
                    key={sample.id}
                    className="form-pill-img__image-option"
                    onClick={() => handleSampleSelect(sample)}
                  >
                    <img src={sample.url} alt={`Ejemplo ${sample.label}`} />
                    <p className="sample-label">{sample.label}</p>
                  </button>
                </>
              ))}
            </div>
            <div className="form-pill-img__image-overlay-footer">
              <button
                type="button"
                className="btn"
                onClick={handleManualImageSelection}
              >
                Subir imagen propia
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
