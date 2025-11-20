import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@shared/contexts/LanguageContext';
import axios from 'axios';
import { env } from '@/config/env';

const ResetPasswordPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    token: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Get token from URL on mount
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setFormData((prev) => ({ ...prev, token }));
    } else {
      setErrorMessage(t('auth.noTokenProvided'));
    }
  }, [searchParams, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.new_password) {
      newErrors.new_password = t('auth.requiredField');
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = t('auth.passwordTooShort');
    }

    if (!formData.new_password_confirm) {
      newErrors.new_password_confirm = t('auth.requiredField');
    } else if (formData.new_password !== formData.new_password_confirm) {
      newErrors.new_password_confirm = t('auth.passwordsDoNotMatch');
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

    if (!formData.token) {
      setErrorMessage(t('auth.noTokenProvided'));
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${env.apiBaseUrl}/password-reset/confirm/`, {
        token: formData.token,
        new_password: formData.new_password,
        new_password_confirm: formData.new_password_confirm,
      });

      setSuccessMessage(t('auth.passwordResetSuccess'));

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.new_password_confirm?.[0] ||
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
            {t('auth.resetPasswordTitle')}
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
            {t('auth.resetPasswordDescription')}
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

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label
                htmlFor="new_password"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('auth.newPassword')}
              </label>
              <input
                id="new_password"
                name="new_password"
                type="password"
                autoComplete="new-password"
                value={formData.new_password}
                onChange={handleChange}
                className={`appearance-none w-full px-3 py-2 border ${
                  errors.new_password
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white transition-colors`}
                placeholder={t('auth.passwordPlaceholder')}
              />
              {errors.new_password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.new_password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="new_password_confirm"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('auth.confirmPassword')}
              </label>
              <input
                id="new_password_confirm"
                name="new_password_confirm"
                type="password"
                autoComplete="new-password"
                value={formData.new_password_confirm}
                onChange={handleChange}
                className={`appearance-none w-full px-3 py-2 border ${
                  errors.new_password_confirm
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white transition-colors`}
                placeholder={t('auth.confirmPasswordPlaceholder')}
              />
              {errors.new_password_confirm && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.new_password_confirm}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !formData.token}
              className="relative flex justify-center w-full px-4 py-3 text-sm font-semibold text-white transition-all border border-transparent rounded-lg group bg-pepper-orange hover:bg-opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-pepper-orange disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {t('auth.resettingPassword')}...
                </span>
              ) : (
                t('auth.resetPassword')
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

export default ResetPasswordPage;
