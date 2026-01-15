import { createContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://server.guestpostcrm.com");
export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const [currentAvatar, setCurrentAvatar] = useState();
  const [crm, setCrm] = useState("");

  const crmRef = useRef(""); // ✅ IMPORTANT

  const [notificationCount, setNotificationCount] = useState({
    outr_offer: null,
    outr_recent_activity: null,
    outr_el_process_audit: null,
    unreplied_email: null,
    outr_deal_fetch: null,
    outr_order_gp_li: null,
    outr_self_test: null,
    refresh_ladger: null,
    refreshUnreplied: null,
  });
  const getMoveOptions = async () => {
    try {
      const response = await axios.get(`${crm}/index.php?entryPoint=move`);
      return response.data;
    } catch (error) {
      console.error('Error fetching move options:', error);
      throw error;
    }
  };


  const moveData = async (threadId, labelId) => {
    try {
      const response = await axios.post(
        `${crm}/index.php?entryPoint=move&threadid=${threadId}&lblid=${labelId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error moving data:', error);
      throw error;
    }
  };
  // ✅ Keep ref always updated
  useEffect(() => {
    crmRef.current = crm;
    console.log("CRM updated:", crm);
  }, [crm]);

  useEffect(() => {
    const newAvatarHandler = (data) => {
      setCurrentAvatar({
        url: data.avatar_url.split("html/")[1],
        mute: false,
      });
    };


    const latestAvatarHandler = (avatar) => {
      setCurrentAvatar({
        url: avatar.avatar_url.split("html/")[1],
        mute: true,
      });
    };

    const newMailHandler = (data) => {
      console.log("OUR CRM:", crmRef.current);
      console.log("Mail site:", data.site_url);
      console.log("new mail", data);

      if (data?.site_url === crmRef.current) {
        setNotificationCount((prev) => ({
          ...prev,
          [data.name]: Date.now(),
        }));
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

  return (
    <SocketContext.Provider
      value={{
        currentAvatar,
        setCurrentAvatar,
        crm,
        setCrm,
        getMoveOptions,
        moveData,
        notificationCount,
        setNotificationCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
