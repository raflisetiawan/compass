import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuestionnaireStore } from "@/stores/questionnaireStore";
import BeSpokeLogo from "@/components/BeSpokeLogo";
import Footer from "@/components/Footer";

const SelectPatientPage = () => {
  const [patientId, setPatientId] = useState("");
  const navigate = useNavigate();
  const setPatientIdStore = useQuestionnaireStore(
    (state) => state.setPatientId
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (patientId.trim()) {
      setPatientIdStore(patientId.trim());
      navigate("/introduction");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#e0f2f7] p-4 sm:p-6 lg:p-8">
      <main className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center space-y-8 w-full ">
          <BeSpokeLogo />
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Card Header */}
            <div>
              <p className="text-gray-600">Clinican</p>
              <h2 className="text-3xl font-bold text-gray-800">Patient ID</h2>
              <p className="text-gray-500 mt-1">
                Please input your Patient ID to access
              </p>
            </div>

            <hr />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="access-code"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Patient ID
                </label>
                <input
                  id="access-code"
                  name="access-code"
                  type="text"
                  required
                  placeholder="Input your Patient ID..."
                  className="block w-full px-4 py-3 text-gray-700 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-8 py-2 text-sm font-semibold text-gray-700 bg-[#e0f2f7] border border-transparent rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SelectPatientPage;
