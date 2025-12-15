import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
const socket = io("https://server.guestpostcrm.com");
export const SocketContext = createContext();
export const SocketContextProvider = (props) => {
  const [currentAvatar, setCurrentAvatar] = useState();
  const [currentMail, setCurrentMail] = useState(null);
  const [currentHot, setCurrentHot] = useState(null);
  const [currentHotCount, setCurrentHotCount] = useState(null);
  const [recentCount, setRecentCount] = useState(null);

  useEffect(() => {
    const newAvatarHandler = (data) => {
      console.log("new avatar", data);
      setCurrentAvatar({ url: data.avatar_url.split("html/")[1], mute: false });
    };

    const latestAvatarHandler = (avatar) => {
      console.log("Most recent avatar:", avatar);
      setCurrentAvatar({
        url: avatar.avatar_url.split("html/")[1],
        mute: true,
      });
    };

    const newMailHandler = (data) => {
      console.log("new mail", data);
      if (data.name !== "outr_el_process_audit" && data.name !== "outr_recent_activity") {
        setCurrentHotCount(Date.now());
      }
      else if (data.name === "outr_recent_activity") {
        setRecentCount(Date.now());
      }
      else {
        setCurrentHot(Date.now())
        setCurrentMail(Date.now());
      }
    };

    socket.on("new_avatar", newAvatarHandler);
    socket.on("latest_avatar", latestAvatarHandler);
    socket.on("new-mail", newMailHandler);

    return () => {
      socket.off("new_avatar", newAvatarHandler);
      socket.off("latest_avatar", latestAvatarHandler);
      socket.off("new-mail", newMailHandler);
    };
  }, []);

  const value = {
    currentAvatar,
    setCurrentAvatar,
    currentMail,
    setCurrentMail,
    currentHot,
    currentHotCount,
    recentCount,
  };

  return (
    <SocketContext.Provider value={value}>
      {props.children}
    </SocketContext.Provider>
  );
};
