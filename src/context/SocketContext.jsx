import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
<<<<<<< HEAD
const socket = io("http://172.191.89.81:5000");
=======
const socket = io("https://server.guestpostcrm.com");
>>>>>>> a61bbcd2afdc3a117db2d529935599502099c448
export const SocketContext = createContext();
export const SocketContextProvider = (props) => {
  const [currentAvatar, setCurrentAvatar] = useState();
  useEffect(() => {
    const newAvatarHandler = (data) => {
      console.log("new avatar", data);
<<<<<<< HEAD
      setCurrentAvatar(data.avatar_url);
=======
      setCurrentAvatar({ url: data.avatar_url, mute: false });
>>>>>>> a61bbcd2afdc3a117db2d529935599502099c448
    };

    const latestAvatarHandler = (avatar) => {
      console.log("Most recent avatar:", avatar);
<<<<<<< HEAD
      setCurrentAvatar(avatar.avatar_url);
=======
      setCurrentAvatar({ url: avatar.avatar_url, mute: true });
>>>>>>> a61bbcd2afdc3a117db2d529935599502099c448
    };

    socket.on("new_avatar", newAvatarHandler);
    socket.on("latest_avatar", latestAvatarHandler);
    socket.on("greet", (data) => {
      console.log("GREET", data);
    });

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
