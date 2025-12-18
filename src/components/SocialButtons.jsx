import React, { useEffect, useState, useContext } from "react";
import { images } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { SocketContext } from "../context/SocketContext";
import { resetDuplicateCount, checkForDuplicates, enableDuplicateUpdates } from "../store/Slices/duplicateEmailSlice";

const SocialButtons = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [animate, setAnimate] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false); 
  
  
  const duplicateCount = useSelector((state) => state.duplicateEmails?.count || 0);
  
  
  const { notificationCount, setNotificationCount } = useContext(SocketContext);

  
  useEffect(() => {
    if (duplicateCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [duplicateCount]);

  
useEffect(() => {
  if (notificationCount.unreplied_email) {
    console.log("📧 New email arrived, checking for duplicates...");
    
    
    dispatch(enableDuplicateUpdates());
    
    
    dispatch(checkForDuplicates());
    
    
    setHasBeenClicked(false);
    
    
    setNotificationCount((prev) => ({
      ...prev,
      unreplied_email: null,
    }));
  }
}, [notificationCount.unreplied_email, dispatch, setNotificationCount]);


  const handleDuplicateClick = () => {
    console.log("📌 Duplicate button clicked - Resetting count to 0");
    
    
    setHasBeenClicked(true);
    
    
    dispatch(resetDuplicateCount());
    
    
    navigate("/Duplicate");
  };

  
  const displayCount = hasBeenClicked ? 0 : duplicateCount;

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
      
      {/* DUPLICATE BUTTON WITH BADGE */}
      <button 
        className="cursor-pointer hover:scale-105 rounded-full p-2 relative"
        onClick={handleDuplicateClick}
      >
        <img
          width="55"
          height="55"
          src={images.duplicateImg}
          alt="duplicate count"
        />
        
        
        {displayCount > 0 && (
          <div className={`
            absolute top-0 right-0 transform -translate-x-1/2 -translate-y-1/2
            bg-red-600 text-white text-xs font-semibold
            rounded-full w-6 h-6
            flex items-center justify-center
            shadow-md border-2 border-white
            transition-all duration-300 ease-out
            ${animate ? "scale-125" : "scale-100"}
          `}>
            {displayCount > 99 ? "99+" : displayCount}
          </div>
        )}
        
        
        {displayCount === 0 && (
          <div className="
            absolute top-0 right-0 transform -translate-x-1/2 -translate-y-1/2
            bg-gray-300 text-gray-700 text-xs font-semibold
            rounded-full w-6 h-6
            flex items-center justify-center
            shadow-md border-2 border-white
          ">
            0
          </div>
        )}
      </button>
    </div>
  );
};

export default SocialButtons;