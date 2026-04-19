import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VehicleSignaturePage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (event.touches) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    }

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(event);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    setIsDrawing(true);
  };

  const draw = (event) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(event);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleFinish = () => {
    if (!accepted) return;
    alert("Registro finalizado correctamente");
  };

  return (
    <div className="max-w-5xl space-y-8 text-white">
      <div>
        <h1 className="text-3xl font-bold">Recepción de Vehículo</h1>
        <p className="text-white/60">
          Completa el flujo para formalizar el ingreso al taller.
        </p>
      </div>

      <div className="flex items-center gap-6 max-w-3xl">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              step === 4
                ? "bg-blue-600 text-white"
                : step < 4
                ? "bg-blue-600/80 text-white"
                : "bg-[#1F2937] text-white/40"
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      <div className="bg-[#111827] rounded-3xl p-8 shadow-xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
              ✍️
            </div>

            <h2 className="text-sm font-bold tracking-widest text-white/80">
              CONFORMIDAD Y FIRMA
            </h2>
          </div>

          <button
            onClick={clearSignature}
            className="px-4 py-2 rounded-xl bg-[#1F2937] text-xs tracking-widest text-white/60 hover:text-white"
          >
            LIMPIAR FIRMA
          </button>
        </div>

        <div className="rounded-3xl border-2 border-dashed border-white/10 bg-[#172033] p-4">
          <canvas
            ref={canvasRef}
            width={900}
            height={260}
            className="w-full h-[260px] rounded-2xl cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <label className="flex items-start gap-3 rounded-2xl bg-[#16213A] border border-blue-500/20 p-4 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 accent-blue-600"
          />

          <span className="text-sm text-white/70 leading-relaxed">
            Confirmo que he revisado el registro de entrada. Acepto los términos
            del servicio y autorizo el inicio de los trabajos de
            diagnóstico/reparación en el taller AutoSync.
          </span>
        </label>

        <div className="flex justify-between pt-6">
          <button
            onClick={() => navigate("/vehicle-status")}
            className="px-6 py-3 rounded-xl text-white/60 hover:text-white"
          >
            Atrás
          </button>

          <button
            onClick={handleFinish}
            disabled={!accepted}
            className={`px-8 py-3 rounded-xl font-medium ${
              accepted
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-emerald-500/40 text-white/50 cursor-not-allowed"
            }`}
          >
            Finalizar registro 
          </button>
        </div>
      </div>
    </div>
  );
}