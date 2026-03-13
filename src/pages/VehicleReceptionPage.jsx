import { useState } from "react";

export default function VehicleReceptionPage() {
  const [plate, setPlate] = useState("");
  const [brandModel, setBrandModel] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuelLevel, setFuelLevel] = useState(50);

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">
          Recepción de Vehículo
        </h1>
        <p className="text-base-content/60 mt-1">
          Complete el flujo para formalizar el ingreso al taller.
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between max-w-3xl mb-10">
        {[1, 2, 3, 4].map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm ${
                step === 1
                  ? "bg-primary text-white"
                  : "bg-base-100 text-base-content/40 border border-base-300"
              }`}
            >
              {step}
            </div>

            {index < 3 && (
              <div className="flex-1 h-[2px] bg-base-300 mx-4 rounded-full"></div>
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="card bg-base-100 shadow-xl rounded-3xl border border-base-300/50">
        <div className="card-body p-8 lg:p-10">
          {/* Section title */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow">
              🚗
            </div>

            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-base-content">
              Información del vehículo
            </h2>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plate */}
            <div>
              <label className="label">
                <span className="label-text text-xs uppercase font-semibold tracking-wide text-base-content/60">
                  Patente / Placa
                </span>
              </label>
              <input
                type="text"
                placeholder="ABC-123"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="input input-bordered w-full rounded-2xl text-lg"
              />
            </div>

            {/* Brand model */}
            <div>
              <label className="label">
                <span className="label-text text-xs uppercase font-semibold tracking-wide text-base-content/60">
                  Marca y modelo
                </span>
              </label>
              <input
                type="text"
                placeholder="Toyota Corolla"
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
                className="input input-bordered w-full rounded-2xl"
              />
            </div>

            {/* Mileage */}
            <div>
              <label className="label">
                <span className="label-text text-xs uppercase font-semibold tracking-wide text-base-content/60">
                  Kilometraje actual
                </span>
              </label>
              <input
                type="number"
                placeholder="45000"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="input input-bordered w-full rounded-2xl"
              />
            </div>

            {/* Fuel level */}
            <div>
              <label className="label">
                <span className="label-text text-xs uppercase font-semibold tracking-wide text-base-content/60">
                  Nivel de combustible
                </span>
              </label>

              <div className="bg-base-100 rounded-2xl pt-4 px-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(Number(e.target.value))}
                  className="range range-primary range-sm"
                />

                <div className="flex justify-between text-[11px] text-base-content/50 mt-3 px-1">
                  <span>Vacío</span>
                  <span>1/4</span>
                  <span>1/2</span>
                  <span>3/4</span>
                  <span>Lleno</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer button */}
        <div className="border-t border-base-300 px-8 lg:px-10 py-6 flex justify-end">
          <button className="btn btn-primary rounded-2xl px-10">
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
}