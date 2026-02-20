import React, { useEffect, useState, useContext } from "react";
import { images } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { SocketContext } from "../context/SocketContext";
import {
  resetDuplicateCount,
  checkForDuplicates,
  enableDuplicateUpdates,
} from "../store/Slices/duplicateEmailSlice";

const SocialButtons = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [animate, setAnimate] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);
  const { contactInfo } = useSelector((state) => state.viewEmail);
  const { notificationCount, setNotificationCount } = useContext(SocketContext);

  // useEffect(() => {
  //   if (duplicateCount > 0) {
  //     setAnimate(true);
  //     const timer = setTimeout(() => setAnimate(false), 300);
  //     return () => clearTimeout(timer);
  //   }
  // }, [duplicateCount]);

  useEffect(() => {
    if (notificationCount.unreplied_email) {
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
    setHasBeenClicked(true);
    dispatch(resetDuplicateCount());
    navigate("/duplicates");
  };

  const displayCount = hasBeenClicked ? 0 : contactInfo?.duplicate_threads;

  return (
    <div className="flex gap-3 ml-1">
      {/* <button className="cursor-pointer hover:scale-105">
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
      </button> */}

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

        <div
          className={`
            absolute top-2 right-3
            bg-red-600 text-white text-xs font-medium
            rounded-full w-4 h-4
            flex items-center justify-center
            transition-all duration-300 ease-out
            ${animate ? "scale-125" : "scale-100"}
          `}
        >
          {contactInfo?.duplicate_threads}
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
    </div>
  );
};

export default SocialButtons;
