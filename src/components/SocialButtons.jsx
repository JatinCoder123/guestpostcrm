import React from "react";
import { images } from "../assets/assets";
import { useNavigate } from "react-router-dom"; // ✅ ADD THIS

const SocialButtons = () => {
   const navigate = useNavigate(); // ✅ ADD THIS
  return (
    <div className="flex gap-3 ml-6">
      <button className="cursor-pointer hover:scale-105">
        <img
          width="48"
          height="48"
          src="https://img.icons8.com/color/48/whatsapp--v1.png"
          alt="whatsapp"
        />
      </button>
      <button className="cursor-pointer hover:scale-105">
        <img
          width="48"
          height="48"
          src="https://img.icons8.com/color/48/apple-phone.png"
          alt="call"
        />
      </button>
      <button className="cursor-pointer hover:scale-105">
        <img
          width="48"
          height="48"
          src="https://img.icons8.com/stickers/100/speech-bubble-with-dots.png"
          alt="sms"
        />
      </button>

      <button className="cursor-pointer hover:scale-105">
        <img
          width="48"
          height="48"
          src="https://img.icons8.com/external-those-icons-flat-those-icons/48/external-Hangout-Logo-social-media-those-icons-flat-those-icons.png"
          alt="external-Hangout-Logo-social-media-those-icons-flat-those-icons"
        />
      </button>
      
      <button className="cursor-pointer hover:scale-105 rounded-full p-2">
        <img
          width="55"
          height="55"
          src={images.duplicateImg}
          alt="duplicate count"
          onClick={() => navigate("/Duplicate")}
        />
      </button>
    </div>
  );
};

export default SocialButtons;
