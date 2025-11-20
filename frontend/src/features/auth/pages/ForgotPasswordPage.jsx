import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@shared/contexts/LanguageContext';
import axios from 'axios';
import { env } from '@/config/env';

const ForgotPasswordPage = () => {
  const { t, language } = useLanguage();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = t('auth.requiredField');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('auth.invalidEmail');
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${env.apiBaseUrl}/password-reset/`, {
        email,
        language
      });
      setSuccessMessage(t('auth.passwordResetEmailSent'));
      setEmail('');
    } catch (error) {
      const message =
        error.response?.data?.email?.[0] ||
        error.response?.data?.detail ||
        t('auth.passwordResetError');
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Back button */}
        <div>
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium transition-colors text-pepper-orange hover:text-pepper-orange-dark"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            {t('auth.backToLogin')}
          </Link>
        </div>

        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900 dark:text-white">
            {t('auth.forgotPasswordTitle')}
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
            {t('auth.forgotPasswordDescription')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {successMessage && (
            <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/20">
              <p className="text-sm text-green-800 dark:text-green-400">
                {successMessage}
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20">
              <p className="text-sm text-red-800 dark:text-red-400">
                {errorMessage}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('auth.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors({});
                }
              }}
              className={`appearance-none w-full px-3 py-2 border ${
                errors.email
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white transition-colors`}
              placeholder={t('auth.emailPlaceholder')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="relative flex justify-center w-full px-4 py-3 text-sm font-semibold text-white transition-all border border-transparent rounded-lg group bg-pepper-orange hover:bg-opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-pepper-orange disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
                    />
                  </svg>
                  {t('auth.sending')}...
                </span>
              ) : (
                t('auth.sendResetLink')
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.rememberPassword')}{' '}
              <Link
                to="/login"
                className="font-medium transition-colors text-pepper-orange hover:text-pepper-orange-dark"
              >
                {t('auth.loginHere')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
