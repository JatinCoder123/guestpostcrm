import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function GpcControllerPage() {
  const navigate = useNavigate();
  return (
    <div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft />
      </button>
      <h1 className="text-2xl font-bold text-left">GpcControllerPage</h1>
    </div>
  );
}
