import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "./settingpages/Header";
import {
  fetchGpcController,
  updateGpcController,
} from "../../store/Slices/gpcControllerSlice";

export default function GpcControllerPage() {
  const dispatch = useDispatch();

  const { checkboxes, loading, updating } = useSelector(
    (state) => state.gpcController,
  );

  useEffect(() => {
    dispatch(fetchGpcController());
  }, [dispatch]);

  const handleToggle = (key) => {
    const currentValue = checkboxes[key] === "1";
    dispatch(updateGpcController(key, !currentValue));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Header text={"Gpc Controller"} />

      {loading ? (
        <p className="text-center text-gray-500 mt-6">Loading settings...</p>
      ) : (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
          {Object.keys(checkboxes).length === 0 && (
            <p className="text-center text-gray-500 py-6">
              No settings available
            </p>
          )}

          {Object.entries(checkboxes).map(([key, value], index) => (
            <div
              key={key}
              className={`flex items-center justify-between px-6 py-4 ${
                index !== Object.keys(checkboxes).length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              <span className="text-sm font-medium text-gray-700 capitalize">
                {key.replace(/_/g, " ")}
              </span>

              {/* Toggle */}
              <button
                type="button"
                disabled={updating}
                onClick={() => handleToggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  value === "1" ? "bg-indigo-600" : "bg-gray-300"
                } ${updating ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    value === "1" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
