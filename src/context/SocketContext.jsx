import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
const socket = io("https://server.guestpostcrm.com");
export const SocketContext = createContext();
export const SocketContextProvider = (props) => {
  const [currentAvatar, setCurrentAvatar] = useState();
  const [notificationCount, setNotificationCount] = useState({
    outr_offer: null,
    outr_recent_activity: null,
    outr_el_process_audit: null,
    unreplied_email: null,
    outr_deal_fetch: null,
    outr_order_gp_list: null,
    outr_self_test: null,
    refresh_ladger: null

  });

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
      setNotificationCount((prev) => ({
        ...prev,
        [data.name]: Date.now(),
      }));
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
    notificationCount,
    setNotificationCount,
  };

  return (
    <SocketContext.Provider value={value}>
      {props.children}
    </SocketContext.Provider>
  );
};
