import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebook,
  faInstagram,
} from '@fortawesome/free-brands-svg-icons';
import {
  faEnvelope,
  faPhone,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { useLanguage } from '@shared/contexts/LanguageContext';

const Footer = ({ company }) => {
  const currentYear = new Date().getFullYear();
  const { getTranslation, t } = useLanguage();

  // Extract company data
  const companyName = getTranslation(company?.translations, 'name') || 'Digital Letter';
  const companyAddress = getTranslation(company?.translations, 'address') || '123 Food Street, Restaurant City, RC 12345';
  const companyEmail = company?.email || 'hello@digitalletter.com';
  const companyPhone = company?.phone || '+1 (555) 123-4567';

  // Generate interactive links
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyAddress)}`;
  const whatsappUrl = `https://wa.me/${String(companyPhone).replace(/[^0-9+]/g, '')}`;
  const mailtoUrl = `mailto:${companyEmail}`;

  // Get business hours
  const businessHours = company?.business_hours || 'Consultar horarios';

  return (
    <footer className="text-white bg-pepper-charcoal">
      <div className="py-12 container-pepper">
        <div className="grid max-w-5xl grid-cols-1 gap-8 mx-auto md:grid-cols-3">
          {/* Horario Section */}
          <div className="flex flex-col items-center justify-start">
            <h4 className="mb-4 text-lg font-bold font-gabarito text-pepper-orange">
              {t('footer.businessHours')}
            </h4>
            <div className="text-sm leading-relaxed text-center text-gray-300 whitespace-pre-line">
              {businessHours}
            </div>
          </div>

          {/* Contactanos Section */}
          <div className="flex flex-col items-center justify-start">
            <h4 className="mb-4 text-lg font-bold font-gabarito text-pepper-orange">
              {t('footer.contactUs')}
            </h4>
            <ul className="flex flex-col items-center space-y-3">
              <li className="flex items-center space-x-3">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-pepper-orange"
                />
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 transition-colors cursor-pointer hover:text-pepper-orange"
                >
                  {companyAddress}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faPhone} className="text-pepper-orange" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 transition-colors cursor-pointer hover:text-pepper-orange"
                >
                  {companyPhone}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faEnvelope} className="text-pepper-orange" />
                <a
                  href={mailtoUrl}
                  className="text-sm text-gray-300 transition-colors cursor-pointer hover:text-pepper-orange"
                >
                  {companyEmail}
                </a>
              </li>
            </ul>
          </div>

          {/* Siguenos Section */}
          <div className="flex flex-col items-center justify-start">
            <h4 className="mb-4 text-lg font-bold font-gabarito text-pepper-orange">
              {t('footer.followUs')}
            </h4>
            <div className="flex space-x-4">
              <Link
                to="https://www.facebook.com/equus.ardales/?locale=es_ES"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 transition-colors duration-200 rounded-full bg-pepper-orange hover:bg-pepper-yellow"
                aria-label="Facebook"
              >
                <FontAwesomeIcon icon={faFacebook} size="lg" />
              </Link>
              <Link
                to="https://www.instagram.com/equuspubardales/?hl=es"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 transition-colors duration-200 rounded-full bg-pepper-orange hover:bg-pepper-yellow"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 text-center border-t border-gray-700">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} {companyName}. {t('footer.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  company: PropTypes.shape({
    translations: PropTypes.shape({
      es: PropTypes.shape({
        name: PropTypes.string,
        address: PropTypes.string,
      }),
      en: PropTypes.shape({
        name: PropTypes.string,
        address: PropTypes.string,
      }),
    }),
    email: PropTypes.string,
    phone: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    business_hours: PropTypes.string,
  }),
};

export default Footer;
