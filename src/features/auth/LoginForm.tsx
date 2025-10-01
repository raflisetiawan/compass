import { useLoginForm } from '../../hooks/useLoginForm';

const LoginForm = () => {
  const {
    accessCode,
    error,
    loading,
    handleSubmit,
    handleInputChange,
  } = useLoginForm();

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
        
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2 text-sm font-semibold text-gray-700 bg-[#e0f2f7] border border-transparent rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
