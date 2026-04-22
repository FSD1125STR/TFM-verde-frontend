import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FOLDERS, uploadImage } from "../services/cloudinary.js";
import { updateVehicle } from "../services/vehicleApi.js";

export default function VehicleStatusPage() {
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const vehicleId = location.state?.vehicleId;
  const clientId = location.state?.clientId;

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleContinue = async () => {
    if (!vehicleId) {
      setSubmitError("No se ha encontrado el vehículo creado.");
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const uploadedImages = await Promise.all(
        images.map(async (file) => {
          const uploadedFile = await uploadImage(file, "VEHICLE_RECEPTION");

          return {
            public_id: uploadedFile.public_id,
            url: uploadedFile.url,
          };
        }),
      );

      await updateVehicle(vehicleId, {
        observaciones: notes.trim(),
        reception_images: uploadedImages,
      });

      navigate("/vehicle-signature", {
        state: {
          vehicleId,
          clientId,
        },
      });
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Recepción de Vehículo
        </h1>
        <p className="text-white/60">
          Completa el flujo para formalizar el ingreso al taller.
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-6 max-w-3xl">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              step === 2
                ? "bg-blue-600 text-white"
                : step < 2
                ? "bg-blue-600/80 text-white"
                : "bg-[#1F2937] text-white/40"
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-[#111827] rounded-3xl p-8 shadow-xl space-y-8">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
            📄
          </div>
          <h2 className="text-sm font-bold tracking-widest text-white/80">
            ESTADO Y EVIDENCIAS
          </h2>
        </div>

        {submitError ? (
          <p className="text-sm text-red-400">{submitError}</p>
        ) : null}

        {/* Upload */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-[11px] uppercase tracking-widest text-white/40">
              Fotos de recepción
            </p>

            <span className="text-xs bg-blue-600/20 px-3 py-1 rounded-full">
              {images.length} archivos
            </span>
          </div>

          <label className="w-32 h-32 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
            <span className="text-2xl">📷</span>
            <span className="text-xs text-white/40 mt-1">
              Añadir foto
            </span>

            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleImages}
            />
          </label>
        </div>

        {/* Textarea */}
        <div>
          <p className="text-[11px] uppercase tracking-widest text-white/40 mb-2">
            Motivo del ingreso / observaciones
          </p>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-28 bg-[#1F2937] rounded-xl p-4 outline-none resize-none"
            placeholder="Detalle el motivo de la visita o daños observados..."
          />
        </div>

        {/* Warning */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex gap-3">
          <span>⚠️</span>
          <p className="text-xs text-orange-300">
            <span className="font-bold">
              Control de calidad inicial:
            </span>{" "}
            Es obligatorio documentar visualmente el estado del vehículo
            para evitar reclamaciones posteriores. El cliente deberá
            validar este registro al finalizar.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-6">
          <button
            onClick={() => navigate("/vehicle-reception")}
            className="text-white/60 hover:text-white"
          >
            Atrás
          </button>

          <button
            onClick={handleContinue}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-8 py-3 rounded-xl"
          >
            {isSubmitting ? "Guardando..." : "Continuar →"}
          </button>
        </div>
      </div>
    </div>
  );
}
