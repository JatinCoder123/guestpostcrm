import { images } from "../assets/assets";
import { useNavigate } from "react-router-dom";


const SocialButtons = ({ displayCount, trust_score }) => {
  const navigate = useNavigate();
  return (
    <div className="flex gap-3 ml-1">

      {/* DUPLICATE BUTTON WITH BADGE */}
      {displayCount > 0 && (
        <button
          className="cursor-pointer hover:scale-105 rounded-full p-2 relative"
          onClick={() => navigate("/duplicates")}
        >
          <img
            width="48"
            height="48"
            src={images.duplicateImg}
            alt="duplicate count"
          />

          <div
            className={`
            absolute top-1 right-3
            bg-red-500 text-white text-xs font-medium
            rounded-full w-4 h-4 p-1
            flex items-center justify-center
            transition-all duration-300 ease-out
           
          `}
          >
            {displayCount > 99
              ? "99+"
              : displayCount}
          </div>

          {displayCount === 0 && (
            <div
              className="
            absolute top-2 right-3
            bg-gray-300 text-gray-700 text-xs font-medium
            rounded-full w-4 h-4
            flex items-center justify-center
          "
            >
              0
            </div>
          )}
        </button>
      )}

      <button className="group cursor-pointer flex items-center justify-center gap-2 px-4 py-2 mt-3 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200">
        <span className="text-sm font-semibold tracking-wide">Trust Score</span>

        <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm font-bold backdrop-blur-sm">
          {trust_score == "unverified"
            ? "50%"
            : trust_score}
        </span>
      </button>
    </div>
  );
};

export default SocialButtons;
