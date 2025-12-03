import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
// const socket = io("https://server.guestpostcrm.com");
export const SocketContext = createContext();
export const SocketContextProvider = (props) => {
  const [currentAvatar, setCurrentAvatar] = useState();
  // useEffect(() => {
  //   const newAvatarHandler = (data) => {
  //     console.log("new avatar", data);
  //     setCurrentAvatar({ url: data.avatar_url.split("html/")[1], mute: false });
  //   };

  //   const latestAvatarHandler = (avatar) => {
  //     console.log("Most recent avatar:", avatar);
  //     setCurrentAvatar({
  //       url: avatar.avatar_url.split("html/")[1],
  //       mute: true,
  //     });
  //   };

  //   socket.on("new_avatar", newAvatarHandler);
  //   socket.on("latest_avatar", latestAvatarHandler);

  //   return () => {
  //     socket.off("new_avatar", newAvatarHandler);
  //     socket.off("latest_avatar", latestAvatarHandler);
  //   };
  // }, []);

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
