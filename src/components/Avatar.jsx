import { X } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

const Avatar = ({ setShowAvatar }) => {
  const [hover, setHover] = useState(false);
  const avatarRef = useRef(null);
  
  const avatar = {
    "avatar_url": "https://errika.guestpostcrm.com/custom/outright_products/Rightee/LogicHooks/avatar_cache/guestpostcrm.mp4"
  };

  // Click anywhere outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setShowAvatar(false);
      }
    };

    // Add event listener when component mounts
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowAvatar]);

  const handleClose = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setShowAvatar(false);
  };

  return (
    <div className="fixed bottom-10 right-5 z-50">
      <div 
        ref={avatarRef}
        className="relative inline-block"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <video
          src={avatar.avatar_url}
          autoPlay
          loop
          muted={false}
          playsInline
          className="w-52 h-52 rounded-full object-cover shadow-2xl border-4 border-white"
        />
        
        {hover && (
          <button 
            onClick={handleClose}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors"
          >
            <X size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Avatar;