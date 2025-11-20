import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faPhone,
  faLocationDot,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import useFetch from '@/shared/hooks/useFetch';
import { useLanguage } from '@shared/contexts/LanguageContext';

const ContactPage = () => {
  const { getTranslation, t } = useLanguage();

  // Fetch company data
  const { data: companyData } = useFetch('/company/');
  const company = companyData?.results?.[0];

  // Extract company information with fallbacks
  const companyAddress = getTranslation(company?.translations, 'address') || '123 Food Street, Restaurant City, RC 12345';
  const companyEmail = company?.email || 'hello@digitalletter.com';
  const companyPhone = company?.phone || '+1 (555) 123-4567';

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  // Generate interactive links
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyAddress)}`;
  const whatsappUrl = `https://wa.me/${String(companyPhone).replace(/[^0-9+]/g, '')}`;
  const mailtoUrl = `mailto:${companyEmail}`;

  // Handle form input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error(t('checkout.fillAllFields'));
      return;
    }

    // Show success message
    toast.success('¡Mensaje enviado correctamente!', {
      icon: '✉️',
      duration: 4000,
    });

    // Clear form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  return (
    <div className="min-h-screen py-12 lg:py-20 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="container-pepper">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-gabarito font-black text-4xl md:text-5xl lg:text-6xl text-pepper-charcoal dark:text-white mb-4">
            {t('contact.title')}
          </h1>
          <p className="font-inter text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('contact.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="font-gabarito font-bold text-2xl md:text-3xl text-pepper-charcoal dark:text-white mb-6">
              {t('contact.contactInfo')}
            </h2>
            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-pepper-orange rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="text-white"
                    size="lg"
                  />
                </div>
                <div>
                  <h3 className="font-gabarito font-semibold text-lg text-pepper-charcoal dark:text-white mb-1">
                    {t('contact.address')}
                  </h3>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-300 hover:text-pepper-orange dark:hover:text-pepper-orange transition-colors cursor-pointer"
                  >
                    {companyAddress}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-pepper-yellow rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="text-white"
                    size="lg"
                  />
                </div>
                <div>
                  <h3 className="font-gabarito font-semibold text-lg text-pepper-charcoal dark:text-white mb-1">
                    {t('contact.phone')}
                  </h3>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-300 hover:text-pepper-orange dark:hover:text-pepper-orange transition-colors cursor-pointer"
                  >
                    {companyPhone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-pepper-green rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-white"
                    size="lg"
                  />
                </div>
                <div>
                  <h3 className="font-gabarito font-semibold text-lg text-pepper-charcoal dark:text-white mb-1">
                    {t('contact.email')}
                  </h3>
                  <a
                    href={mailtoUrl}
                    className="text-gray-600 dark:text-gray-300 hover:text-pepper-orange dark:hover:text-pepper-orange transition-colors cursor-pointer"
                  >
                    {companyEmail}
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-pepper-blue rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="text-white"
                    size="lg"
                  />
                </div>
                <div>
                  <h3 className="font-gabarito font-semibold text-lg text-pepper-charcoal dark:text-white mb-1">
                    {t('contact.hours')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('contact.weekdays')}</p>
                  <p className="text-gray-600 dark:text-gray-300">{t('contact.weekends')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card-pepper p-8 dark:bg-gray-800">
            <h2 className="font-gabarito font-bold text-2xl md:text-3xl text-pepper-charcoal dark:text-white mb-6">
              {t('contact.formTitle')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block font-inter font-medium text-pepper-charcoal dark:text-gray-200 mb-2"
                >
                  {t('contact.yourName')}
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-pepper dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder={t('contact.namePlaceholder')}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block font-inter font-medium text-pepper-charcoal dark:text-gray-200 mb-2"
                >
                  {t('contact.emailAddress')}
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-pepper dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder={t('contact.emailPlaceholder')}
                />
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block font-inter font-medium text-pepper-charcoal dark:text-gray-200 mb-2"
                >
                  {t('contact.subject')}
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input-pepper dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder={t('contact.subjectPlaceholder')}
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block font-inter font-medium text-pepper-charcoal dark:text-gray-200 mb-2"
                >
                  {t('contact.message')}
                </label>
                <textarea
                  id="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="input-pepper resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder={t('contact.messagePlaceholder')}
                ></textarea>
              </div>

              {/* Submit Button */}
              <button type="submit" className="w-full btn-pepper-primary">
                {t('contact.sendMessage')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
