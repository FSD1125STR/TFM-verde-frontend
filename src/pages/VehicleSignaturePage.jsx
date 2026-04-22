import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import { uploadImage } from '../services/cloudinary.js';
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

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
    ctx.strokeStyle = '#0f172a';
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
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    <div className='w-full space-y-8 text-white'>
      <div>
        <h1 className='text-3xl font-bold'>Recepción de Vehículo</h1>
        <p className='text-white/60'>
          Completa el flujo para formalizar el ingreso al taller.
        </p>
      </div>

      <div className='flex w-full max-w-4xl flex-wrap items-center gap-4 sm:gap-6'>
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${
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

      <div className='space-y-8 rounded-3xl bg-[#111827] p-5 shadow-xl sm:p-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white'>
              <Icon name='signature' />
            </div>

            <h2 className='text-sm font-bold tracking-widest text-white/80'>
              CONFORMIDAD Y FIRMA
            </h2>
          </div>

          <button
            type='button'
            onClick={clearSignature}
            className='inline-flex items-center gap-2 rounded-xl bg-[#1F2937] px-4 py-2 text-xs tracking-widest text-white/60 transition hover:text-white'
          >
            <Icon name='trash' className='h-4 w-4' />
            LIMPIAR FIRMA
          </button>
        </div>

        {submitError ? (
          <p className='text-sm text-red-400'>{submitError}</p>
        ) : null}

        <div className='rounded-3xl border-2 border-dashed border-slate-300/70 bg-slate-100 p-4'>
          <canvas
            ref={canvasRef}
            width={900}
            height={260}
            className='h-[260px] w-full cursor-crosshair rounded-2xl bg-white'
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <label className='flex cursor-pointer items-start gap-3 rounded-2xl border border-blue-500/20 bg-[#16213A] p-4'>
          <input
            type='checkbox'
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className='mt-1 accent-blue-600'
          />

          <span className='text-sm leading-relaxed text-white/70'>
            Confirmo que he revisado el registro de entrada. Acepto los términos
            del servicio y autorizo el inicio de los trabajos de
            diagnóstico/reparación en el taller.
          </span>
        </label>

        <div className='flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-between'>
          <button
            onClick={() =>
              navigate('/vehicle-status', { state: { vehicleId, clientId } })
            }
            className='inline-flex items-center gap-2 rounded-xl px-4 py-3 text-white/60 transition hover:bg-white/10 hover:text-white'
          >
            <Icon name='arrowLeft' className='h-4 w-4' />
            Atrás
          </button>

          <button
            onClick={handleFinish}
            disabled={!accepted || !hasSignature || isSubmitting}
            className={`inline-flex items-center gap-2 rounded-xl px-8 py-3 font-medium ${
              accepted && hasSignature && !isSubmitting
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'cursor-not-allowed bg-emerald-500/40 text-white/50'
            }`}
          >
            {isSubmitting ? 'Guardando...' : 'Finalizar registro'}
            {!isSubmitting ? <Icon name='arrowRight' className='h-4 w-4' /> : null}
          </button>
        </div>
      </div>
    </div>
  );
}
