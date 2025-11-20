import React, { useState, useEffect } from 'react';
import { Moon, Sun, Globe } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const translations = {
  es: {
    welcome: 'Bienvenido a',
    title: 'Juan el Porra',
    subtitle: 'Cada día preparamos comida casera diferente, hecha con cariño y sabor auténtico. ¡Escríbenos por WhatsApp y descubre la variedad del día de hoy!',
    homemadeFood: 'COMIDAS',
    homemadeFoodHighlight: 'CASERAS',
    roastedChickens: 'POLLOS',
    roastedChickensHighlight: 'ASADOS',
    sundaysOrder: 'LOS DOMINGOS',
    sundaysOrderHighlight: 'POR ENCARGO',
    orderLabel: ' Por Encargo',
    consultLabel: 'Consultar',
    paellaDesc: 'Receta tradicional preparada con amor',
    paellaNegraDesc: 'Receta de siempre elaborada con dedicación.',
    codilloDesc: 'Tierno, jugoso y delicioso',
    conejoDesc: 'Receta casera auténtica',
    chickensSchedule: 'Viernes, Sábados y Domingos',
    traditionalRecipes: 'Preparados con nuestras recetas tradicionales',
    available: 'Disponibles:',
    chooseFavorite: 'Elige tu especialidad favorita:',
    delivery: 'DOMICILIO',
    location: 'Ubicación:',
    locationValue: 'Ardales ',
    holidays: 'DÍAS FESTIVOS',
    openWithReservation: 'Consulte los días de apertura',
    checkAvailability: 'Verifique disponibilidad',
    contactUs: 'Contáctanos',
    callForOrders: 'Llámenos al teléfono',
    phoneNumber: '+34652411939',
    phoneDisplay: '+34 652 41 19 39',
    callForOrdersExtra: 'para pedidos especiales y más información',
    addressLabel: 'Dirección:',
    location2: 'Calle Huelva 7, Ardales',
    whatsappMessage: 'Hola, me gustaría recibir la variedad de los platos del día'
  },
  en: {
    welcome: 'Welcome to',
    title: 'Juan el Porra',
    subtitle: 'Every day we prepare different homemade food, made with love and authentic flavor. Write to us on WhatsApp and discover today’s variety!',
    homemadeFood: 'HOMEMADE',
    homemadeFoodHighlight: 'FOOD',
    roastedChickens: 'ROASTED',
    roastedChickensHighlight: 'CHICKENS',
    sundaysOrder: 'SUNDAYS',
    sundaysOrderHighlight: 'BY ORDER',
    orderLabel: 'By Order',
    consultLabel: 'Inquire',
    paellaDesc: 'Traditional recipe prepared with love',
    paellaNegraDesc: 'Traditional recipe crafted with care.”',
    codilloDesc: 'Tender, juicy and delicious',
    conejoDesc: 'Authentic homemade recipe',
    chickensSchedule: 'Friday, Saturday and Sunday',
    traditionalRecipes: 'Prepared with our traditional recipes',
    available: 'Available:',
    chooseFavorite: 'Choose your favorite specialty:',
    delivery: 'DELIVERY',
    location: 'Location:',
    locationValue: 'Ardales ',
    holidays: 'HOLIDAYS',
    openWithReservation: 'Check the opening days.',
    checkAvailability: 'Check availability',
    contactUs: 'Contact Us',
    callForOrders: 'Call us at',
    phoneNumber: '+34652411939',
    phoneDisplay: '+34 652 41 19 39',
    callForOrdersExtra: 'for special orders and more information',
    addressLabel: 'Address:',
    location2: '7 Huelva Street, Ardales',
    whatsappMessage: "Hi, I'd like to receive today's selection of dishes."
  }
};

const JuanPorras = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('es');
  const [whatsappNumber, setWhatsappNumber] = useState('34652411939');

  useEffect(() => {
    // Load WhatsApp number from localStorage
    const savedNumber = localStorage.getItem('juanPorrasWhatsapp');
    if (savedNumber) {
      // Remove the + sign if present
      setWhatsappNumber(savedNumber.replace('+', ''));
    }

    // Load language preference
    const savedLanguage = localStorage.getItem('juanPorrasLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'es' ? 'en' : 'es';
    setLanguage(newLanguage);
    localStorage.setItem('juanPorrasLanguage', newLanguage);
  };

  const t = translations[language];

  const menuItems = [
    {
      section: 'todos',
      name: 'PAELLA',
      price: t.orderLabel,
      description: t.paellaDesc,
      image: '/paella.jpeg'
    },
    {
      section: 'todos',
      name: 'PAELLA NEGRA',
      price: t.orderLabel,
      description: t.paellaNegraDesc,
      image: '/paella_negra.jpeg'
    },
    {
      section: 'todos',
      name: 'CODILLO',
      price: t.orderLabel,
      description: t.codilloDesc,
      image: '/codillo.jpeg'
    },
    {
      section: 'todos',
      name: 'PIERNA DE CORDERO',
      price: t.orderLabel,
      description: t.conejoDesc,
      image: '/pierna_de_cordero.jpeg'
    },
    {
      section: 'pollos',
      name: language === 'es' ? 'POLLOS ASADOS' : 'ROASTED CHICKENS',
      price: t.consultLabel,
      description: t.chickensSchedule,
      image: '/pollo.jpeg'
    }
  ];

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t.whatsappMessage)}`;

  return (
    <div className={`min-h-screen overflow-hidden transition-colors duration-300 ${
      darkMode 
        ? 'text-white' 
        : 'text-gray-900 bg-white'
    }`}
    style={darkMode ? { backgroundColor: '#1B1A1F' } : {}}
    >

      {/* Toggle Dark Mode and Language */}
      <div className="fixed z-50 flex gap-3 top-6 right-6">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className={`p-3 rounded-full transition-all duration-300 ${
            darkMode
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          }`}
          title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        >
          <Globe className="w-6 h-6" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-full transition-all duration-300 ${
            darkMode
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          }`}
        >
          {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed z-40 flex items-center justify-center w-12 h-12 text-white transition-all duration-300 bg-green-500 rounded-full shadow-lg hover:bg-green-600 bottom-8 right-8 hover:shadow-xl animate-pulse"
      >
        <FontAwesomeIcon icon={faWhatsapp} className="w-6 h-6" />
      </a>
      
      {/* Header Decorativo */}
      <div className="relative px-4 pt-16 pb-12 text-center">
        <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl ${
          darkMode ? 'bg-orange-500/10' : 'bg-orange-500/5'
        }`}></div>
        <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl ${
          darkMode ? 'bg-orange-500/5' : 'bg-orange-500/3'
        }`}></div>
        <img className='w-auto mx-auto h-96' src="/logoJuanPorra.png" alt="" />

        <div className="relative z-10">
          {/* <p className={`mb-2 text-lg font-bold tracking-widest ${
            darkMode ? 'text-orange-500' : 'text-orange-600'
          }`}>{t.welcome}</p> */}
          {/* <h1 className="mb-2 font-black tracking-tight text-7xl">
            {t.title}
          </h1> */}
          <p className={`text-xl font-light ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>{t.subtitle}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20 mx-auto mt-8 max-w-7xl">
        
        {/* Sección Comidas Caseras */}
        <div className="relative mb-32">
          <div className={`absolute w-64 h-64 rounded-full -top-20 -right-20 blur-3xl ${
            darkMode ? 'bg-orange-500/5' : 'bg-orange-500/3'
          }`}></div>
          
          <div className="relative z-10">
            <div className="inline-block mb-12">
              <h2 className="text-5xl font-black tracking-tight">
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>{t.homemadeFood}</span>
                <span className={darkMode ? 'text-orange-500' : 'text-orange-600'}> {t.homemadeFoodHighlight}</span>
              </h2>
              <div className={`w-32 h-1 mt-4 ${
                darkMode ? 'bg-orange-500' : 'bg-orange-600'
              }`}></div>
            </div>

            {/* Grid de Items */}
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
              {menuItems.filter(item => item.section === 'todos').map((item, index) => (
                <div key={index} className="relative group">
                  {/* Fondo flotante con hover */}
                  <div className={`absolute w-40 h-40 transition-all duration-500 -top-6 -right-6 rounded-3xl group-hover:-top-10 group-hover:-right-10 group-hover:w-56 group-hover:h-56 blur-xl ${
                    darkMode
                      ? 'bg-orange-500/20 group-hover:bg-orange-500/40'
                      : 'bg-orange-500/10 group-hover:bg-orange-500/25'
                  }`}></div>
                  
                  {/* Card */}
                  <div className={`relative h-full p-8 transition-all duration-500 border rounded-3xl backdrop-blur-sm transform group-hover:scale-105 group-hover:-translate-y-2 flex flex-col ${
                    darkMode
                      ? 'bg-gray-800/80 border-orange-500/20 group-hover:border-orange-500/60 group-hover:shadow-2xl group-hover:shadow-orange-500/20'
                      : 'bg-white border-orange-500/30 group-hover:border-orange-500/60 shadow-md group-hover:shadow-2xl group-hover:shadow-orange-500/15'
                  }`}>
                    {/* Imagen cuadrada decorativa */}
                    <div className="relative mb-8">
                      <div className={`absolute w-48 h-48 rounded-3xl -top-4 -right-4 blur-2xl transition-all duration-500 group-hover:scale-125 ${
                        darkMode ? 'bg-orange-500/10' : 'bg-orange-500/5'
                      }`}></div>
                      <div className={`relative flex items-center justify-center mx-auto transition-all duration-500 border-4 rounded-3xl w-48 h-48 transform group-hover:scale-110 overflow-hidden ${
                        darkMode
                          ? 'bg-orange-500/20 border-orange-500/30 group-hover:bg-orange-500/40 group-hover:border-orange-500/80'
                          : 'bg-orange-500/10 border-orange-500/40 group-hover:bg-orange-500/20 group-hover:border-orange-500/80'
                      }`}>
                        {/* <span className="text-6xl">{item.image}</span> */}
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-2xl" />
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="flex flex-col flex-grow text-center">
                      <h3 className={`mb-1 text-3xl font-black tracking-tight transition-colors duration-300 group-hover:text-orange-500 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.name}
                      </h3>
                      <p className={`mb-4 font-bold transition-colors duration-300 ${
                        darkMode ? 'text-orange-500 group-hover:text-orange-400' : 'text-orange-600 group-hover:text-orange-500'
                      }`}>{item.price}</p>
                      <p className={`text-sm leading-relaxed transition-colors duration-300 mt-auto ${
                        darkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-700'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sección Pollos Asados */}
        <div className="relative mb-32">
          <div className={`absolute rounded-full -left-20 w-80 h-80 blur-3xl ${
            darkMode ? 'bg-orange-500/5' : 'bg-orange-500/3'
          }`}></div>
          
          <div className="relative z-10">
            <div className="inline-block mb-12">
              <h2 className="text-5xl font-black tracking-tight">
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>{t.roastedChickens}</span>
                <span className={darkMode ? 'text-orange-500' : 'text-orange-600'}> {t.roastedChickensHighlight}</span>
              </h2>
              <div className={`w-32 h-1 mt-4 ${
                darkMode ? 'bg-orange-500' : 'bg-orange-600'
              }`}></div>
            </div>

            <div className="relative group">
              {/* Fondo flotante grande */}
              <div className={`absolute transition-all duration-500 rounded-full -top-10 -left-10 w-96 h-96 group-hover:-top-20 group-hover:-left-20 group-hover:w-96 group-hover:h-96 blur-3xl ${
                darkMode
                  ? 'bg-orange-500/15 group-hover:bg-orange-500/35'
                  : 'bg-orange-500/10 group-hover:bg-orange-500/25'
              }`}></div>
              
              {/* Card Principal */}
              <div className={`relative p-12 transition-all duration-500 border rounded-3xl backdrop-blur-sm transform group-hover:scale-105 ${
                darkMode
                  ? 'bg-gray-800/80 border-orange-500/30 group-hover:border-orange-500/80 group-hover:shadow-2xl group-hover:shadow-orange-500/20'
                  : 'bg-white border-orange-500/30 group-hover:border-orange-500/80 shadow-md group-hover:shadow-2xl group-hover:shadow-orange-500/15'
              }`}>
                <div className="grid items-center gap-12 md:grid-cols-2">
                  
                  {/* Imagen Izquierda */}
                  <div className="relative order-2 md:order-1">
                    <div className={`absolute rounded-3xl -top-8 -left-8 w-80 h-80 blur-3xl transition-all duration-500 group-hover:scale-125 ${
                      darkMode ? 'bg-orange-500/10' : 'bg-orange-500/5'
                    }`}></div>
                    <div className={`relative flex items-center justify-center w-64 h-64 mx-auto transition-all duration-500 border-4 rounded-3xl transform group-hover:scale-110 overflow-hidden ${
                      darkMode
                        ? 'bg-orange-500/30 border-orange-500/40 group-hover:bg-orange-500/50 group-hover:border-orange-500/80'
                        : 'bg-orange-500/10 border-orange-500/40 group-hover:bg-orange-500/20 group-hover:border-orange-500/80'
                    }`}>
                      {/* <span className="text-8xl">🐔</span> */}
                      <img src="/pollo.jpeg" alt="Pollo Asado" className="w-full h-full object-cover rounded-2xl" />
                    </div>
                  </div>

                  {/* Contenido Derecha */}
                  <div className="order-1 md:order-2">
                    <h3 className={`mb-4 text-5xl font-black tracking-tight transition-colors duration-300 ${
                      darkMode ? 'text-white group-hover:text-orange-400' : 'text-gray-900 group-hover:text-orange-600'
                    }`}>
                      {t.roastedChickens}<br/>
                      <span className={darkMode ? 'text-orange-500' : 'text-orange-600'}>{t.roastedChickensHighlight}</span>
                    </h3>
                    <div className="space-y-4">
                      <p className={`text-lg leading-relaxed transition-colors duration-300 ${
                        darkMode ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-700 group-hover:text-gray-800'
                      }`}>
                        {t.traditionalRecipes}
                      </p>
                      <div className={`p-4 border rounded-xl backdrop-blur-sm transition-all duration-300 ${
                        darkMode
                          ? 'bg-orange-500/10 border-orange-500/30 group-hover:bg-orange-500/20 group-hover:border-orange-500/60'
                          : 'bg-orange-500/10 border-orange-500/40 group-hover:bg-orange-500/20 group-hover:border-orange-500/60'
                      }`}>
                        <p className={`mb-1 text-lg font-bold transition-colors duration-300 ${
                          darkMode ? 'text-orange-400 group-hover:text-orange-300' : 'text-orange-600 group-hover:text-orange-500'
                        }`}>{t.available}</p>
                        <p className={`transition-colors duration-300 ${
                          darkMode ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-700 group-hover:text-gray-800'
                        }`}>{t.chickensSchedule}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Domingos por Encargo */}
        <div className="relative mb-32">
          <div className={`absolute rounded-full -top-20 -right-20 w-72 h-72 blur-3xl ${
            darkMode ? 'bg-orange-500/5' : 'bg-orange-500/3'
          }`}></div>
          
          <div className="relative z-10">
            <div className="inline-block mb-12">
              <h2 className="text-5xl font-black tracking-tight">
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>{t.sundaysOrder}</span>
                <span className={darkMode ? 'text-orange-500' : 'text-orange-600'}> {t.sundaysOrderHighlight}</span>
              </h2>
              <div className={`w-48 h-1 mt-4 ${
                darkMode ? 'bg-orange-500' : 'bg-orange-600'
              }`}></div>
            </div>

            <div className={`p-12 text-center rounded-3xl shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
              darkMode
                ? 'bg-orange-500 shadow-orange-500/20 hover:shadow-orange-500/40'
                : 'bg-orange-600 shadow-orange-600/20 hover:shadow-orange-600/40'
            }`}>
              {/* <p className="mb-6 text-lg font-semibold text-white/90">{t.chooseFavorite}</p> */}
              <div className="flex flex-wrap justify-center gap-4">
                {['PAELLA', 'CODILLO', 'PIERNA DE CORDERO'].map((item, idx) => (
                  <div key={idx} className="px-8 py-3 transition-all duration-300 transform border rounded-full cursor-pointer bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/60 hover:bg-white/30 hover:scale-110">
                    <span className="text-lg font-bold text-white">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sección Contact */}
        <div className="relative">
          <div className={`absolute rounded-full -bottom-20 -left-20 w-80 h-80 blur-3xl ${
            darkMode ? 'bg-orange-500/5' : 'bg-orange-500/3'
          }`}></div>
          
          <div className="relative z-10 grid gap-8 md:grid-cols-2">
            
            {/* Domicilio */}
            <div className="relative group">
              <div className={`absolute w-48 h-48 transition-all duration-500 -top-6 -right-6 rounded-3xl group-hover:-top-10 group-hover:-right-10 group-hover:w-64 group-hover:h-64 blur-xl ${
                darkMode
                  ? 'bg-orange-500/10 group-hover:bg-orange-500/25'
                  : 'bg-orange-500/5 group-hover:bg-orange-500/15'
              }`}></div>
              
              <div className={`relative p-8 transition-all duration-500 border rounded-3xl backdrop-blur-sm transform group-hover:scale-105 group-hover:-translate-y-2 ${
                darkMode
                  ? 'bg-gray-800/80 border-orange-500/20 group-hover:border-orange-500/60 group-hover:shadow-2xl group-hover:shadow-orange-500/20'
                  : 'bg-white border-orange-500/30 group-hover:border-orange-500/60 shadow-md group-hover:shadow-2xl group-hover:shadow-orange-500/15'
              }`}>
                <h3 className={`mb-6 text-3xl font-black transition-colors duration-300 ${
                  darkMode ? 'text-white group-hover:text-orange-400' : 'text-gray-900 group-hover:text-orange-600'
                }`}>{t.delivery}</h3>

                <div className="space-y-4">
                  <div>
                    <p className={`mb-1 text-lg font-bold transition-colors duration-300 ${
                      darkMode ? 'text-orange-500 group-hover:text-orange-400' : 'text-orange-600 group-hover:text-orange-500'
                    }`}>{t.location}</p>
                    <p className={`text-lg transition-colors duration-300 ${
                      darkMode ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-700 group-hover:text-gray-800'
                    }`}>{t.locationValue}</p>
                  </div>

                  {/* <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-3 px-6 py-3 font-bold text-white transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-110 ${
                      darkMode
                        ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30'
                        : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/30'
                    }`}
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="w-5 h-5" />
                    WhatsApp
                  </a> */}
                </div>
              </div>
            </div>

            {/* Días Festivos */}
            <div className="relative group">
              <div className={`absolute w-48 h-48 transition-all duration-500 -top-6 -left-6 rounded-3xl group-hover:-top-10 group-hover:-left-10 group-hover:w-64 group-hover:h-64 blur-xl ${
                darkMode
                  ? 'bg-orange-500/10 group-hover:bg-orange-500/25'
                  : 'bg-orange-500/5 group-hover:bg-orange-500/15'
              }`}></div>
              
              <div className={`relative p-8 transition-all duration-500 border rounded-3xl backdrop-blur-sm transform group-hover:scale-105 group-hover:-translate-y-2 ${
                darkMode
                  ? 'bg-gray-800/80 border-orange-500/20 group-hover:border-orange-500/60 group-hover:shadow-2xl group-hover:shadow-orange-500/20'
                  : 'bg-white border-orange-500/30 group-hover:border-orange-500/60 shadow-md group-hover:shadow-2xl group-hover:shadow-orange-500/15'
              }`}>
                <h3 className={`mb-6 text-3xl font-black transition-colors duration-300 ${
                  darkMode ? 'text-white group-hover:text-orange-400' : 'text-gray-900 group-hover:text-orange-600'
                }`}>{t.holidays}</h3>

                <div className="space-y-4">
                  <p className={`text-lg font-bold transition-colors duration-300 ${
                    darkMode ? 'text-orange-400 group-hover:text-orange-300' : 'text-orange-600 group-hover:text-orange-500'
                  }`}>{t.openWithReservation}</p>
                  <p className={`transition-colors duration-300 ${
                    darkMode ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-700 group-hover:text-gray-800'
                  }`}>{t.checkAvailability}</p>
                  
                  {/* <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-3 px-6 py-3 font-bold text-white transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-110 ${
                      darkMode
                        ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30'
                        : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/30'
                    }`}
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="w-5 h-5" />
                    WhatsApp
                  </a> */}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className={`px-4 pt-16 mt-32 transition-colors duration-300 ${
        darkMode
          ? 'border-t border-orange-500/10'
          : 'border-t border-orange-500/20 bg-gray-50'
      }`}>
        <div className="pb-12 mx-auto text-center max-w-7xl">
          <h3 className={`mb-4 text-2xl font-bold ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>{t.contactUs}</h3>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 text-4xl font-black transition-colors hover:opacity-80 ${
              darkMode ? 'text-orange-500' : 'text-orange-600'
            }`}
          >
            <FontAwesomeIcon icon={faWhatsapp} className="w-10 h-10" />
            WhatsApp
          </a>
          <p className={`mt-4 text-sm ${
            darkMode ? 'text-gray-500' : 'text-gray-600'
          }`}>
            {t.callForOrders}{' '}
            <a
              href={`tel:${t.phoneNumber}`}
              className={`font-bold transition-colors hover:opacity-80 ${
                darkMode ? 'text-orange-500' : 'text-orange-600'
              }`}
            >
              {t.phoneDisplay}
            </a>{' '}
            {t.callForOrdersExtra}
          </p>
          <p className={`mt-4 text-sm ${
            darkMode ? 'text-gray-500' : 'text-gray-600'
          }`}>
            {t.addressLabel}{' '}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.location2)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-bold transition-colors hover:underline ${
                darkMode ? 'text-orange-500' : 'text-orange-600'
              }`}
            >
              {t.location2}
            </a>
          </p>
        </div>
      </footer>

    </div>
  );
};

export default JuanPorras;
