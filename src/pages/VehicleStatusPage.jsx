import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import { uploadImage } from '../services/cloudinary.js';
import { updateVehicle } from '../services/vehicleApi.js';

export default function VehicleStatusPage() {
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const vehicleId = location.state?.vehicleId;
  const clientId = location.state?.clientId;

  const handleImages = (event) => {
    const files = Array.from(event.target.files);
    setImages(files);
  };

  const handleContinue = async () => {
    if (!vehicleId) {
      setSubmitError('No se ha encontrado el vehículo creado.');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const uploadedImages = await Promise.all(
        images.map(async (file) => {
          const uploadedFile = await uploadImage(file, 'VEHICLE_RECEPTION');

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

      navigate('/vehicle-signature', {
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

      <div className='flex max-w-3xl items-center gap-6'>
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${
              step === 2
                ? 'bg-blue-600 text-white'
                : step < 2
                  ? 'bg-blue-600/80 text-white'
                  : 'bg-[#1F2937] text-white/40'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      <div className='space-y-8 rounded-3xl bg-[#111827] p-8 shadow-xl'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white'>
            <Icon name='camera' />
          </div>
          <h2 className='text-sm font-bold tracking-widest text-white/80'>
            ESTADO Y EVIDENCIAS
          </h2>
        </div>

        {submitError ? (
          <p className='text-sm text-red-400'>{submitError}</p>
        ) : null}

        <div>
          <div className='mb-3 flex items-center justify-between'>
            <p className='text-[11px] uppercase tracking-widest text-white/40'>
              Fotos de recepción
            </p>

            <span className='rounded-full bg-blue-600/20 px-3 py-1 text-xs'>
              {images.length} archivos
            </span>
          </div>

          <label className='flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 transition hover:border-blue-500 hover:text-blue-300'>
            <Icon name='camera' className='h-7 w-7' />
            <span className='mt-2 text-xs text-white/50'>Añadir foto</span>

            <input
              type='file'
              multiple
              accept='image/*'
              className='hidden'
              onChange={handleImages}
            />
          </label>
        </div>

        <div>
          <p className='mb-2 text-[11px] uppercase tracking-widest text-white/40'>
            Motivo del ingreso / observaciones
          </p>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className='h-28 w-full resize-none rounded-xl bg-[#1F2937] p-4 outline-none'
            placeholder='Detalle el motivo de la visita o daños observados...'
          />
        </div>

        <div className='flex gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4'>
          <Icon name='alert' className='h-5 w-5 shrink-0 text-orange-300' />
          <p className='text-xs text-orange-300'>
            <span className='font-bold'>Control de calidad inicial:</span> Es
            obligatorio documentar visualmente el estado del vehículo para
            evitar reclamaciones posteriores. El cliente deberá validar este
            registro al finalizar.
          </p>
        </div>

        <div className='flex justify-between pt-6'>
          <button
            onClick={() => navigate('/vehicle-reception')}
            className='inline-flex items-center gap-2 rounded-xl px-4 py-3 text-white/60 transition hover:bg-white/10 hover:text-white'
          >
            <Icon name='arrowLeft' className='h-4 w-4' />
            Atrás
          </button>

          <button
            onClick={handleContinue}
            disabled={isSubmitting}
            className='inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 disabled:opacity-50'
          >
            {isSubmitting ? 'Guardando...' : 'Continuar'}
            {!isSubmitting ? <Icon name='arrowRight' className='h-4 w-4' /> : null}
          </button>
        </div>
      </div>
    </div>
  );
}
