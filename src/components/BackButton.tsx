import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center text-gray-400 hover:text-blue-500 transition-colors mb-6"
    >
      <ArrowLeft className="w-5 h-5 mr-2" />
      <span>Back</span>
    </button>
  );
};

export default BackButton; 