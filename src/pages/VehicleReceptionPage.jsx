import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VehicleReceptionPage() {
  const [plate, setPlate] = useState("");
  const [brandModel, setBrandModel] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuel, setFuel] = useState(50);

  const navigate = useNavigate();

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
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              step === 1
                ? "bg-blue-600 text-white"
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
            🚗
          </div>
          <h2 className="text-sm font-bold tracking-widest text-white/80">
            INFORMACIÓN DEL VEHÍCULO
          </h2>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-6">
          {/* Placa */}
          <input
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            className="bg-[#1F2937] p-3 rounded-xl w-full outline-none"
            placeholder="ABC-123"
          />

          {/* Marca */}
          <input
            value={brandModel}
            onChange={(e) => setBrandModel(e.target.value)}
            className="bg-[#1F2937] p-3 rounded-xl w-full outline-none"
            placeholder="Toyota Corolla"
          />

          {/* Kilometraje */}
          <input
            type="number"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            className="bg-[#1F2937] p-3 rounded-xl w-full outline-none"
            placeholder="45000"
          />

          {/* Combustible */}
          <div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={fuel}
              onChange={(e) => setFuel(Number(e.target.value))}
              className="w-full accent-blue-600"
            />

            <div className="flex justify-between text-xs text-white/40 mt-2">
              <span>Vacío</span>
              <span>1/4</span>
              <span>1/2</span>
              <span>3/4</span>
              <span>Lleno</span>
            </div>
          </div>
        </div>

        {/* Botón */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate("/client-info")}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl"
          >
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
}