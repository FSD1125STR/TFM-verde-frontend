import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import { getCustomers } from '../services/customerApi.js';
import { createVehicle } from '../services/vehicleApi.js';

const fuelLabels = ['Vacío', '1/4', '1/2', '3/4', 'Lleno'];

export default function VehicleReceptionPage() {
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    n_bastidor: '',
    marca: '',
    modelo: '',
    tipo_combustible: '',
    cantidad_combustible: 0,
    matricula: '',
    year: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      setCustomersLoading(true);
      setCustomersError('');

      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        setCustomersError(error.message);
      } finally {
        setCustomersLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFuelChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      cantidad_combustible: Number(event.target.value),
    }));
  };

  const isClientSelected = Boolean(formData.client_id);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setSuccessMessage('');

    if (
      !formData.client_id ||
      !formData.n_bastidor.trim() ||
      !formData.marca.trim() ||
      !formData.modelo.trim() ||
      !formData.tipo_combustible.trim() ||
      !formData.matricula.trim() ||
      !formData.year
    ) {
      setSubmitError('Completa todos los campos obligatorios.');
      return;
    }

    setIsSubmitting(true);

    try {
      const vehicle = await createVehicle({
        client_id: formData.client_id,
        n_bastidor: formData.n_bastidor.trim(),
        marca: formData.marca.trim(),
        modelo: formData.modelo.trim(),
        tipo_combustible: formData.tipo_combustible.trim(),
        cantidad_combustible: formData.cantidad_combustible,
        matricula: formData.matricula.trim().toUpperCase(),
        year: new Date(`${formData.year}-01-01`).toISOString(),
      });

      navigate('/vehicle-status', {
        state: {
          vehicleId: vehicle._id,
          clientId: formData.client_id,
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
              step === 1
                ? 'bg-blue-600 text-white'
                : 'bg-[#1F2937] text-white/40'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className='space-y-8 rounded-3xl bg-[#111827] p-8 shadow-xl'
      >
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white'>
            <Icon name='vehicles' />
          </div>
          <h2 className='text-sm font-bold tracking-widest text-white/80'>
            INFORMACIÓN DEL VEHÍCULO
          </h2>
        </div>

        {customersError ? (
          <p className='text-sm text-red-400'>{customersError}</p>
        ) : null}

        {submitError ? (
          <p className='text-sm text-red-400'>{submitError}</p>
        ) : null}

        {successMessage ? (
          <p className='text-sm text-emerald-400'>{successMessage}</p>
        ) : null}

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div className='md:col-span-2'>
            <label className='mb-2 block text-[11px] uppercase tracking-widest text-white/40'>
              Cliente
            </label>
            {customersLoading ? (
              <p className='text-sm text-white/50'>Cargando clientes...</p>
            ) : (
              <>
                <select
                  name='client_id'
                  value={formData.client_id}
                  onChange={handleChange}
                  className='w-full rounded-xl bg-[#1F2937] p-3 outline-none'
                >
                  <option value=''>Selecciona un cliente</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.displayName} - {customer.identifier}
                    </option>
                  ))}
                </select>

                {!isClientSelected ? (
                  <p className='mt-2 text-xs text-amber-300'>
                    Debes seleccionar un cliente antes de introducir los datos
                    del vehículo.
                  </p>
                ) : null}
              </>
            )}
          </div>

          <TextField
            label='Matrícula'
            name='matricula'
            value={formData.matricula}
            onChange={handleChange}
            disabled={!isClientSelected}
            placeholder='1234ABC'
          />

          <TextField
            label='Número de bastidor'
            name='n_bastidor'
            value={formData.n_bastidor}
            onChange={handleChange}
            disabled={!isClientSelected}
            placeholder='VF1ABC12345678901'
          />

          <TextField
            label='Marca'
            name='marca'
            value={formData.marca}
            onChange={handleChange}
            disabled={!isClientSelected}
            placeholder='Toyota'
          />

          <TextField
            label='Modelo'
            name='modelo'
            value={formData.modelo}
            onChange={handleChange}
            disabled={!isClientSelected}
            placeholder='Corolla'
          />

          <TextField
            label='Tipo de combustible'
            name='tipo_combustible'
            value={formData.tipo_combustible}
            onChange={handleChange}
            disabled={!isClientSelected}
            placeholder='Gasolina'
          />

          <TextField
            type='number'
            label='Año'
            name='year'
            value={formData.year}
            onChange={handleChange}
            disabled={!isClientSelected}
            min='1900'
            max='2099'
            placeholder='2020'
          />

          <div className='md:col-span-2'>
            <label className='mb-2 block text-[11px] uppercase tracking-widest text-white/40'>
              Cantidad de combustible
            </label>
            <input
              type='range'
              min='0'
              max='4'
              step='1'
              value={formData.cantidad_combustible}
              onChange={handleFuelChange}
              disabled={!isClientSelected}
              className='w-full accent-blue-600'
            />

            <div className='mt-2 flex justify-between text-xs text-white/40'>
              {fuelLabels.map((label, index) => (
                <span
                  key={label}
                  className={
                    index === formData.cantidad_combustible ? 'text-blue-300' : ''
                  }
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className='flex justify-between'>
          <button
            type='button'
            onClick={() => navigate('/client-info')}
            className='inline-flex items-center gap-2 rounded-xl px-4 py-3 text-white/60 transition hover:bg-white/10 hover:text-white'
          >
            <Icon name='arrowLeft' className='h-4 w-4' />
            Atrás
          </button>

          <button
            type='submit'
            disabled={isSubmitting || customersLoading || !isClientSelected}
            className='inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 disabled:opacity-50'
          >
            {isSubmitting ? 'Guardando...' : 'Guardar vehículo'}
            {!isSubmitting ? <Icon name='arrowRight' className='h-4 w-4' /> : null}
          </button>
        </div>
      </form>
    </div>
  );
}

function TextField({ label, ...props }) {
  return (
    <div>
      <label className='mb-2 block text-[11px] uppercase tracking-widest text-white/40'>
        {label}
      </label>
      <input
        {...props}
        className='w-full rounded-xl bg-[#1F2937] p-3 outline-none disabled:cursor-not-allowed disabled:opacity-50'
      />
    </div>
  );
}
