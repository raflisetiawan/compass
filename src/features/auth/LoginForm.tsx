import { useLoginForm } from '../../hooks/useLoginForm';
import { isRecaptchaAvailable } from '../../services/recaptcha';

const LoginForm = () => {
  const {
    accessCode,
    error,
    loading,
    recaptchaReady,
    recaptchaToken,
    handleSubmit,
    handleInputChange,
  } = useLoginForm();

  const showRecaptcha = isRecaptchaAvailable();
  const isSubmitDisabled = loading || (showRecaptcha && !recaptchaToken);

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-6">
      {/* Card Header */}
      <div>
        <p className="text-gray-600">Hello,</p>
        <h2 className="text-3xl font-bold text-gray-800">Welcome back</h2>
        <p className="text-gray-500 mt-1">Please input your code in the field below to continue</p>
      </div>

      <hr />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="access-code" className="block text-sm font-medium text-gray-700 mb-1">
            Access Code
          </label>
          <input
            id="access-code"
            name="access-code"
            type="text"
            required
            placeholder="Input your access code here..."
            className="block w-full px-4 py-3 text-gray-700 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
            value={accessCode}
            onChange={handleInputChange}
          />
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>

        {/* reCAPTCHA v2 Checkbox Widget */}
        {showRecaptcha && (
          <div className="flex justify-center py-2">
            <div id="recaptcha-container">
              {!recaptchaReady && (
                <div className="text-sm text-gray-500">Loading security verification...</div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="px-8 py-2 text-sm font-semibold text-gray-700 bg-[#e0f2f7] border border-transparent rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>

      {/* reCAPTCHA Attribution - Required by Google ToS */}
      <p className="text-xs text-gray-400 text-center">
        This site is protected by reCAPTCHA and the Google{' '}
        <a 
          href="https://policies.google.com/privacy" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          Privacy Policy
        </a>{' '}
        and{' '}
        <a 
          href="https://policies.google.com/terms" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          Terms of Service
        </a>{' '}
        apply.
      </p>
    </div>
  );
};

export default LoginForm;
