import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
const socket = io("http://172.191.89.81:5000");
export const SocketContext = createContext();
export const SocketContextProvider = (props) => {
  const [currentAvatar, setCurrentAvatar] = useState();
  useEffect(() => {
    const newAvatarHandler = (data) => {
      console.log("new avatar", data);
      setCurrentAvatar(data.avatar_url);
    };

    const latestAvatarHandler = (avatar) => {
      console.log("Most recent avatar:", avatar);
      setCurrentAvatar(avatar.avatar_url);
    };

    socket.on("new_avatar", newAvatarHandler);
    socket.on("latest_avatar", latestAvatarHandler);

    return () => {
      socket.off("new_avatar", newAvatarHandler);
      socket.off("latest_avatar", latestAvatarHandler);
    };
  }, []);

  const value = {
    currentAvatar,
    setCurrentAvatar,
  };

  return (
    <SocketContext.Provider value={value}>
      {props.children}
    </SocketContext.Provider>
  );
};
