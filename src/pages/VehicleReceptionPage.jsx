import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFuelChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      cantidad_combustible: Number(e.target.value),
    }));
  };

  const isClientSelected = Boolean(formData.client_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      <div className='flex items-center gap-6 max-w-3xl'>
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
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
        className='bg-[#111827] rounded-3xl p-8 shadow-xl space-y-8'
      >
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center'>
            🚗
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
            <label className='block text-[11px] uppercase tracking-widest text-white/40 mb-2'>
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
                  className='bg-[#1F2937] p-3 rounded-xl w-full outline-none'
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
                    Debes seleccionar un cliente antes de introducir los datos del
                    vehículo.
                  </p>
                ) : null}
              </>
            )}
          </div>

          <div>
            <label className='block text-[11px] uppercase tracking-widest text-white/40 mb-2'>
              Matrícula
            </label>
            <input
              name='matricula'
              value={formData.matricula}
              onChange={handleChange}
              disabled={!isClientSelected}
              className='bg-[#1F2937] p-3 rounded-xl w-full outline-none'
              placeholder='1234ABC'
            />
          </div>

          <div>
            <label className='block text-[11px] uppercase tracking-widest text-white/40 mb-2'>
              Número de bastidor
            </label>
            <input
              name='n_bastidor'
              value={formData.n_bastidor}
              onChange={handleChange}
              disabled={!isClientSelected}
              className='bg-[#1F2937] p-3 rounded-xl w-full outline-none'
              placeholder='VF1ABC12345678901'
            />
          </div>

          <div>
            <label className='block text-[11px] uppercase tracking-widest text-white/40 mb-2'>
              Marca
            </label>
            <input
              name='marca'
              value={formData.marca}
              onChange={handleChange}
              disabled={!isClientSelected}
              className='bg-[#1F2937] p-3 rounded-xl w-full outline-none'
              placeholder='Toyota'
            />
          </div>

          <div>
            <label className='block text-[11px] uppercase tracking-widest text-white/40 mb-2'>
              Modelo
            </label>
            <input
              name='modelo'
              value={formData.modelo}
              onChange={handleChange}
              disabled={!isClientSelected}
              className='bg-[#1F2937] p-3 rounded-xl w-full outline-none'
              placeholder='Corolla'
            />
          </div>

          <div>
            <label className='block text-[11px] uppercase tracking-widest text-white/40 mb-2'>
              Tipo de combustible
            </label>
            <input
              name='tipo_combustible'
              value={formData.tipo_combustible}
              onChange={handleChange}
              disabled={!isClientSelected}
              className='bg-[#1F2937] p-3 rounded-xl w-full outline-none'
              placeholder='Gasolina'
            />
          </div>

          <div>
            <label className='block text-[11px] uppercase tracking-widest text-white/40 mb-2'>
              Año
            </label>
            <input
              type='number'
              min='1900'
              max='2099'
              name='year'
              value={formData.year}
              onChange={handleChange}
              disabled={!isClientSelected}
              className='bg-[#1F2937] p-3 rounded-xl w-full outline-none'
              placeholder='2020'
            />
          </div>

          <div className='md:col-span-2'>
            <label className='block text-[11px] uppercase tracking-widest text-white/40 mb-2'>
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

            <div className='flex justify-between text-xs text-white/40 mt-2'>
              {fuelLabels.map((label, index) => (
                <span
                  key={label}
                  className={
                    index === formData.cantidad_combustible
                      ? 'text-blue-300'
                      : ''
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
            className='px-6 py-3 rounded-xl text-white/60 hover:text-white'
          >
            Atrás
          </button>

          <button
            type='submit'
            disabled={isSubmitting || customersLoading || !isClientSelected}
            className='bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-8 py-3 rounded-xl'
          >
            {isSubmitting ? 'Guardando...' : 'Guardar vehículo'}
          </button>
        </div>
      </form>
    </div>
  );
}
