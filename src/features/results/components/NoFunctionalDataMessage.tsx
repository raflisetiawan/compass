import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const NoFunctionalDataMessage = () => {
  return (
    <div className="border-2 border-amber-200 bg-amber-50 rounded-lg p-6 text-center">
      <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
      <p className="text-gray-700 mb-4">
        No information has been entered for these parameters and as a result no
        personalised prediction is available. If you would like to have a
        personalised prediction, you can{" "}
        <Link to="/questionnaire" className="text-blue-600 hover:underline font-medium">
          answer the questionnaire again
        </Link>
        .
      </p>
    </div>
  );
};

export default NoFunctionalDataMessage;
