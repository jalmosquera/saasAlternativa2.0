import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSave, faPlus, faTrash, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import api from '@shared/services/api';

const COUNTRY_CODES = [
  { code: '+34', country: 'España' },
  { code: '+1', country: 'USA/Canadá' },
  { code: '+52', country: 'México' },
  { code: '+54', country: 'Argentina' },
  { code: '+56', country: 'Chile' },
  { code: '+57', country: 'Colombia' },
  { code: '+58', country: 'Venezuela' },
];

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const SettingsPage = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState(null);

  // Company Information
  const [companyNameEs, setCompanyNameEs] = useState('');
  const [companyNameEn, setCompanyNameEn] = useState('');
  const [companyAddressEs, setCompanyAddressEs] = useState('');
  const [companyAddressEn, setCompanyAddressEn] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  // WhatsApp Phone (for orders)
  const [countryCode, setCountryCode] = useState('+34');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Business Hours
  const [schedule, setSchedule] = useState(
    DAYS.map(day => ({ day, open: '08:00', close: '23:00', closed: false, deliveryEnabled: true }))
  );

  // Juan Porras WhatsApp (frontend only)
  const [juanCountryCode, setJuanCountryCode] = useState('+34');
  const [juanPhoneNumber, setJuanPhoneNumber] = useState('');

  // Delivery locations (frontend only)
  const [deliveryLocations, setDeliveryLocations] = useState([
    { id: 1, name: 'Ardales', value: 'ardales', enabled: true },
    { id: 2, name: 'Carratraca', value: 'carratraca', enabled: true },
  ]);
  const [newLocationName, setNewLocationName] = useState('');

  useEffect(() => {
    fetchCompanyData();
    // Load Juan Porras phone from localStorage
    const savedJuanPhone = localStorage.getItem('juanPorrasWhatsapp');
    if (savedJuanPhone) {
      const matchedCode = COUNTRY_CODES.find(c => savedJuanPhone.startsWith(c.code));
      if (matchedCode) {
        setJuanCountryCode(matchedCode.code);
        setJuanPhoneNumber(savedJuanPhone.substring(matchedCode.code.length));
      }
    } else {
      // Default value
      setJuanCountryCode('+34');
      setJuanPhoneNumber('652411939');
    }

    // Load delivery locations from localStorage
    const savedLocations = localStorage.getItem('deliveryLocations');
    if (savedLocations) {
      try {
        setDeliveryLocations(JSON.parse(savedLocations));
      } catch (error) {
        console.error('Error parsing delivery locations:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to section when hash changes
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && !loading) {
      const element = document.getElementById(hash);
      if (element) {
        // Wait a bit for the page to render
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash, loading]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/company/');
      if (response.data.results && response.data.results.length > 0) {
        const company = response.data.results[0];
        setCompanyId(company.id);

        // Parse Company Information
        if (company.translations) {
          setCompanyNameEs(company.translations.es?.name || '');
          setCompanyNameEn(company.translations.en?.name || '');
          setCompanyAddressEs(company.translations.es?.address || '');
          setCompanyAddressEn(company.translations.en?.address || '');
        }
        setCompanyEmail(company.email || '');
        setCompanyPhone(company.phone?.toString() || '');

        // Parse WhatsApp phone
        const phone = company.whatsapp_phone || '+34623736566';
        const matchedCode = COUNTRY_CODES.find(c => phone.startsWith(c.code));
        if (matchedCode) {
          setCountryCode(matchedCode.code);
          setPhoneNumber(phone.substring(matchedCode.code.length));
        }

        // Parse business hours
        if (company.business_hours) {
          const parsedSchedule = parseBusinessHours(company.business_hours, company.delivery_enabled_days || {});
          setSchedule(parsedSchedule);
        }

        // Load delivery locations from backend
        if (company.delivery_locations && company.delivery_locations.length > 0) {
          setDeliveryLocations(company.delivery_locations);
          // Sync with localStorage
          localStorage.setItem('deliveryLocations', JSON.stringify(company.delivery_locations));
        }
      }
    } catch (err) {
      console.error('Error fetching company data:', err);
      toast.error('Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const parseBusinessHours = (hoursString, deliveryEnabledDays = {}) => {
    // Simple parser: "Lun: 08:00 - 23:00" per day
    const lines = hoursString.split('\n');
    const newSchedule = DAYS.map(day => ({
      day,
      open: '08:00',
      close: '23:00',
      closed: false,
      deliveryEnabled: deliveryEnabledDays[day] !== undefined ? deliveryEnabledDays[day] : true
    }));

    lines.forEach(line => {
      DAYS.forEach((day, idx) => {
        if (line.includes(day)) {
          const timeMatch = line.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
          const deliveryEnabled = deliveryEnabledDays[day] !== undefined ? deliveryEnabledDays[day] : true;
          if (timeMatch) {
            newSchedule[idx] = { day, open: timeMatch[1], close: timeMatch[2], closed: false, deliveryEnabled };
          } else if (line.toLowerCase().includes('cerrado')) {
            newSchedule[idx] = { day, open: '08:00', close: '23:00', closed: true, deliveryEnabled };
          }
        }
      });
    });

    return newSchedule;
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const handleAddLocation = () => {
    if (!newLocationName.trim()) return;

    const newLocation = {
      id: Date.now(),
      name: newLocationName.trim(),
      value: newLocationName.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_'),
      enabled: true,
    };

    setDeliveryLocations([...deliveryLocations, newLocation]);
    setNewLocationName('');
  };

  const handleToggleLocation = (id) => {
    setDeliveryLocations(deliveryLocations.map(loc =>
      loc.id === id ? { ...loc, enabled: !loc.enabled } : loc
    ));
  };

  const handleDeleteLocation = (id) => {
    if (deliveryLocations.filter(loc => loc.enabled).length <= 1) {
      toast.error('Debe haber al menos una ubicación habilitada');
      return;
    }
    setDeliveryLocations(deliveryLocations.filter(loc => loc.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyId) {
      toast.error('No se encontró la configuración de la empresa. Por favor, contacta al administrador.');
      return;
    }

    try {
      setSaving(true);

      // Generate business_hours string
      const businessHours = schedule
        .map(({ day, open, close, closed }) =>
          closed ? `${day}: Cerrado` : `${day}: ${open} - ${close}`
        )
        .join('\n');

      // Generate delivery_enabled_days object
      const deliveryEnabledDays = schedule.reduce((acc, { day, deliveryEnabled }) => {
        acc[day] = deliveryEnabled;
        return acc;
      }, {});

      // Generate whatsapp_phone
      const whatsappPhone = `${countryCode}${phoneNumber}`;

      // Save Juan Porras phone to localStorage (frontend only)
      const juanWhatsappPhone = `${juanCountryCode}${juanPhoneNumber}`;
      localStorage.setItem('juanPorrasWhatsapp', juanWhatsappPhone);

      // Save to backend (delivery locations and enabled days included)
      await api.patch(`/company/${companyId}/`, {
        translations: {
          es: {
            name: companyNameEs,
            address: companyAddressEs,
          },
          en: {
            name: companyNameEn,
            address: companyAddressEn,
          },
        },
        email: companyEmail,
        phone: parseInt(companyPhone) || 0,
        whatsapp_phone: whatsappPhone,
        business_hours: businessHours,
        delivery_locations: deliveryLocations,
        delivery_enabled_days: deliveryEnabledDays,
      });

      // Also save to localStorage as backup
      localStorage.setItem('deliveryLocations', JSON.stringify(deliveryLocations));

      toast.success('Configuraciones guardadas correctamente', {
        icon: '✅',
        duration: 3000,
      });
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Error al guardar configuraciones');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-text-secondary">Cargando configuraciones...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 mb-2 text-3xl font-bold text-gray-900 dark:text-text-primary">
          <FontAwesomeIcon icon={faCog} />
          Configuraciones
        </h1>
        <p className="text-gray-600 dark:text-text-secondary">
          Configura la información de la empresa, números de WhatsApp, horarios de atención y ubicaciones de entrega
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-md dark:bg-dark-card md:p-6">
          {/* ========== SECTION 1: GENERAL INFORMATION ========== */}
          <div id="general" className="pb-6 mb-6 border-b border-gray-200 dark:border-dark-border scroll-mt-20">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-text-primary">
              Información General
            </h2>

            {/* Company Name ES */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-text-secondary">
                Nombre de la Empresa (Español)
              </label>
              <input
                type="text"
                value={companyNameEs}
                onChange={(e) => setCompanyNameEs(e.target.value)}
                placeholder="Restaurante Delicioso"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-dark-border focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-dark-bg dark:text-text-primary"
                required
              />
            </div>

            {/* Company Name EN */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-text-secondary">
                Nombre de la Empresa (Inglés)
              </label>
              <input
                type="text"
                value={companyNameEn}
                onChange={(e) => setCompanyNameEn(e.target.value)}
                placeholder="Delicious Restaurant"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-dark-border focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-dark-bg dark:text-text-primary"
                required
              />
            </div>

            {/* Company Address ES */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-text-secondary">
                Dirección (Español)
              </label>
              <input
                type="text"
                value={companyAddressEs}
                onChange={(e) => setCompanyAddressEs(e.target.value)}
                placeholder="Calle Principal 123, Madrid"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-dark-border focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-dark-bg dark:text-text-primary"
                required
              />
            </div>

            {/* Company Address EN */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-text-secondary">
                Dirección (Inglés)
              </label>
              <input
                type="text"
                value={companyAddressEn}
                onChange={(e) => setCompanyAddressEn(e.target.value)}
                placeholder="123 Main Street, Madrid"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-dark-border focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-dark-bg dark:text-text-primary"
                required
              />
            </div>

            {/* Company Email */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-text-secondary">
                Email
              </label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="info@restaurant.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-dark-border focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-dark-bg dark:text-text-primary"
                required
              />
            </div>

            {/* Company Phone */}
            <div className="mb-0">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-text-secondary">
                Teléfono
              </label>
              <input
                type="tel"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-dark-border focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-dark-bg dark:text-text-primary"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-text-secondary">
                Número de teléfono principal de contacto
              </p>
            </div>
          </div>

          {/* ========== SECTION 2: WHATSAPP NUMBERS ========== */}
          <div id="whatsapp" className="pb-6 mb-6 border-b border-gray-200 dark:border-dark-border scroll-mt-20">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-text-primary">
              Números de WhatsApp
            </h2>

            {/* WhatsApp Phone (Orders) */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-text-secondary">
                Número de WhatsApp (Pedidos)
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 dark:border-dark-border focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-dark-bg dark:text-text-primary sm:text-base"
                  required
                >
                  {COUNTRY_CODES.map(({ code, country }) => (
                    <option key={code} value={code}>
                      {code} ({country})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="623736566"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 dark:border-dark-border focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-dark-bg dark:text-text-primary sm:text-base"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-text-secondary">
                Número que recibirá los pedidos por WhatsApp
              </p>
            </div>

            {/* Juan Porras WhatsApp Phone (Frontend only) */}
            <div className="mb-0">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-text-secondary">
                Número de WhatsApp (Juan Porras)
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={juanCountryCode}
                  onChange={(e) => setJuanCountryCode(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 dark:border-dark-border focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-dark-bg dark:text-text-primary sm:text-base"
                >
                  {COUNTRY_CODES.map(({ code, country }) => (
                    <option key={code} value={code}>
                      {code} ({country})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={juanPhoneNumber}
                  onChange={(e) => setJuanPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="652411939"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 dark:border-dark-border focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-dark-bg dark:text-text-primary sm:text-base"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-text-secondary">
                Número para la página de Juan Porras
              </p>
            </div>
          </div>

          {/* ========== SECTION 3: BUSINESS HOURS ========== */}
          <div id="horarios" className="pb-6 mb-6 border-b border-gray-200 dark:border-dark-border scroll-mt-20">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-text-primary">
              Horarios de Atención
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {schedule.map((item, index) => (
                <div key={item.day} className="flex flex-col gap-2 p-2 rounded-lg sm:flex-row sm:items-center sm:gap-4 sm:p-2 bg-gray-50 dark:bg-dark-bg sm:bg-transparent">
                  <div className="flex items-center gap-3 sm:gap-3">
                    <div className="w-10 text-sm font-semibold text-gray-700 sm:w-12 dark:text-text-secondary">
                      {item.day}
                    </div>
                    <input
                      type="checkbox"
                      checked={!item.closed}
                      onChange={(e) => handleScheduleChange(index, 'closed', !e.target.checked)}
                      className="w-4 h-4 text-pepper-orange focus:ring-pepper-orange"
                    />
                    <span className="text-xs text-gray-600 sm:text-sm dark:text-text-secondary w-14 sm:w-16">
                      {item.closed ? 'Cerrado' : 'Abierto'}
                    </span>
                  </div>
                  {!item.closed && (
                    <>
                      <div className="flex items-center gap-2 pl-0 sm:gap-3 sm:pl-2">
                        <input
                          type="time"
                          value={item.open}
                          onChange={(e) => handleScheduleChange(index, 'open', e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded-lg sm:px-3 dark:border-dark-border focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-dark-bg dark:text-text-primary"
                        />
                        <span className="text-sm text-gray-500">-</span>
                        <input
                          type="time"
                          value={item.close}
                          onChange={(e) => handleScheduleChange(index, 'close', e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded-lg sm:px-3 dark:border-dark-border focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-dark-bg dark:text-text-primary"
                        />
                      </div>
                      {/* Delivery Enabled Checkbox */}
                      <div className="flex items-center gap-2 pl-0 sm:gap-2 sm:pl-4">
                        <input
                          type="checkbox"
                          checked={item.deliveryEnabled}
                          onChange={(e) => handleScheduleChange(index, 'deliveryEnabled', e.target.checked)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-xs font-medium text-gray-600 sm:text-sm dark:text-text-secondary whitespace-nowrap">
                          Habilitar pedidos
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-text-secondary">
              Selecciona los días abiertos y configura los horarios
            </p>
          </div>

          {/* ========== SECTION 4: DELIVERY LOCATIONS ========== */}
          <div id="ubicaciones" className="mb-6 scroll-mt-20">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-text-primary">
              Ubicaciones de Entrega
            </h2>

            {/* Add new location */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
                placeholder="Nombre del pueblo..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-dark-border focus:ring-2 focus:ring-pepper-orange focus:border-transparent dark:bg-dark-bg dark:text-text-primary"
              />
              <button
                type="button"
                onClick={handleAddLocation}
                className="px-4 py-2 text-white transition-colors rounded-lg bg-pepper-orange hover:bg-pepper-orange-dark"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Agregar
              </button>
            </div>

            {/* List of locations */}
            <div className="space-y-2">
              {deliveryLocations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-dark-border bg-gray-50 dark:bg-dark-bg"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleLocation(location.id)}
                      className={`transition-colors ${
                        location.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'
                      }`}
                      title={location.enabled ? 'Deshabilitar' : 'Habilitar'}
                    >
                      <FontAwesomeIcon icon={location.enabled ? faToggleOn : faToggleOff} size="lg" />
                    </button>
                    <span className={`font-medium ${location.enabled ? 'text-gray-900 dark:text-text-primary' : 'text-gray-400 dark:text-gray-600'}`}>
                      {location.name}
                    </span>
                    {!location.enabled && (
                      <span className="px-2 py-1 text-xs text-gray-600 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-400">
                        Deshabilitado
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteLocation(location.id)}
                    className="text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Eliminar"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-lg" />
                  </button>
                </div>
              ))}
            </div>

            <p className="mt-2 text-sm text-gray-500 dark:text-text-secondary">
              Agrega pueblos y habilítalos/deshabilítalos según disponibilidad de reparto
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 text-white transition-colors rounded-lg bg-pepper-orange hover:bg-pepper-orange-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faSave} />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
