import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FOLDERS, uploadImage } from '../services/cloudinary.js';
import { updateVehicle } from '../services/vehicleApi.js';

export default function VehicleSignaturePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const vehicleId = location.state?.vehicleId;
  const clientId = location.state?.clientId;

  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const pointer = event.touches ? event.touches[0] : event;

    return {
      x: (pointer.clientX - rect.left) * scaleX,
      y: (pointer.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (event) => {
    event.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(event);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsDrawing(true);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    event.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(event);

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const canvasToBlob = () =>
    new Promise((resolve, reject) => {
      const canvas = canvasRef.current;

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('No se pudo generar la firma.'));
          return;
        }

        resolve(blob);
      }, 'image/png');
    });

  const handleFinish = async () => {
    if (!accepted || !hasSignature) return;
    if (!vehicleId) {
      setSubmitError('No se ha encontrado el vehículo del registro.');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const signatureBlob = await canvasToBlob();
      const signatureFile = new File([signatureBlob], 'signature.png', {
        type: 'image/png',
      });
      const uploadedSignature = await uploadImage(
        signatureFile,
        'VEHICLE_SIGNATURES',
      );

      await updateVehicle(vehicleId, {
        customer_signature: {
          public_id: uploadedSignature.public_id,
          url: uploadedSignature.url,
        },
      });

      alert('Registro finalizado correctamente');
      navigate('/', {
        replace: true,
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
    <div className='max-w-5xl space-y-8 text-white'>
      <div>
        <h1 className='text-3xl font-bold'>Recepción de Vehículo</h1>
        <p className='text-white/60'>
          Completa el flujo para formalizar el ingreso al taller.
        </p>
      </div>

      <div className='flex items-center gap-6 max-w-3xl'>
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              step === 3
                ? 'bg-blue-600 text-white'
                : step < 3
                  ? 'bg-blue-600/80 text-white'
                  : 'bg-[#1F2937] text-white/40'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      <div className='bg-[#111827] rounded-3xl p-8 shadow-xl space-y-8'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center'>
              ✍️
            </div>

            <h2 className='text-sm font-bold tracking-widest text-white/80'>
              CONFORMIDAD Y FIRMA
            </h2>
          </div>

          <button
            onClick={clearSignature}
            className='px-4 py-2 rounded-xl bg-[#1F2937] text-xs tracking-widest text-white/60 hover:text-white'
          >
            LIMPIAR FIRMA
          </button>
        </div>

        {submitError ? (
          <p className='text-sm text-red-400'>{submitError}</p>
        ) : null}

        <div className='rounded-3xl border-2 border-dashed border-white/10 bg-[#172033] p-4'>
          <canvas
            ref={canvasRef}
            width={900}
            height={260}
            className='w-full h-[260px] rounded-2xl cursor-crosshair'
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <label className='flex items-start gap-3 rounded-2xl bg-[#16213A] border border-blue-500/20 p-4 cursor-pointer'>
          <input
            type='checkbox'
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className='mt-1 accent-blue-600'
          />

          <span className='text-sm text-white/70 leading-relaxed'>
            Confirmo que he revisado el registro de entrada. Acepto los términos
            del servicio y autorizo el inicio de los trabajos de
            diagnóstico/reparación en el taller AutoSync.
          </span>
        </label>

        <div className='flex justify-between pt-6'>
          <button
            onClick={() =>
              navigate('/vehicle-status', { state: { vehicleId, clientId } })
            }
            className='px-6 py-3 rounded-xl text-white/60 hover:text-white'
          >
            Atrás
          </button>

          <button
            onClick={handleFinish}
            disabled={!accepted || !hasSignature || isSubmitting}
            className={`px-8 py-3 rounded-xl font-medium ${
              accepted && hasSignature && !isSubmitting
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-emerald-500/40 text-white/50 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Guardando...' : 'Finalizar registro'}
          </button>
        </div>
      </div>
    </div>
  );
}
