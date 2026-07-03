import {
  createContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { showConsole } from "../assets/assets.js";
import { eventActions } from "../store/Slices/eventSlice.js";
import { unrepliedAction } from "../store/Slices/unrepliedEmails.js";
import { apiRequest } from "../services/api.js";
import { queryClient } from "../lib/queryClient.js";
import { recentKeys } from "../queries/recentAct.queries.js";

const socket = io("https://socket.guestpostcrm.com");

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const [currentAvatar, setCurrentAvatar] = useState();
  const [crm, setCrm] = useState("");
  const [invoiceOrderId, setInvoiceOrderId] = useState(null);
  const [userIdle, setUserIdle] = useState(true);
  const [eventQueue, setEventQueue] = useState({});
  const [activeUsers, setActiveUsers] = useState([]);

  const dispatch = useDispatch();
  const location = useLocation();

  const {
    user,
    id,
    isAuthenticated,
  } = useSelector((state) => state.user);

  const eventQueueRef = useRef({});
  const currentEventThreadId = useRef(null);
  const crmRef = useRef("");
  const userRef = useRef(userIdle);

  const [notificationCount, setNotificationCount] = useState({
    outr_offer: null,
    outr_recent_activity: null,
    outr_el_process_audit: null,
    unreplied_email: null,
    outr_deal_fetch: null,
    outr_order_gp_li: null,
    outr_self_test: null,
    outr_paypal_invoice_links: null,
    error_log_created: null,
  });

  useEffect(() => {
    eventQueueRef.current = eventQueue;
  }, [eventQueue]);

  useEffect(() => {
    crmRef.current = crm;
    userRef.current = userIdle;
  }, [crm, userIdle]);

  useEffect(() => {
    console.log(eventQueue);
  }, [eventQueue]);

  useEffect(() => {
    const presenceListHandler = (users) => {
  const list = Array.isArray(users) ? users : [];

  const uniqueUsers = Array.from(
    list.reduce((map, user) => {
      const key = user.email?.toLowerCase();

      if (!key) return map;

      const existing = map.get(key);

      if (
        !existing ||
        user.status === "online" ||
        new Date(user.lastActiveAt || 0) > new Date(existing.lastActiveAt || 0)
      ) {
        map.set(key, user);
      }

      return map;
    }, new Map()).values()
  );

  setActiveUsers(uniqueUsers);
};

    socket.on("presence:list", presenceListHandler);

    return () => {
      socket.off("presence:list", presenceListHandler);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.email || !crm) return;

    const emitJoin = () => {
      socket.emit("presence:join", {
        userId: id || user.id || user.email,
        name: user.name,
        email: user.email,
        crm,
        page: location.pathname,
      });
    };

    const handleVisibility = () => {
      socket.emit("presence:update", {
        page: location.pathname,
        status: document.hidden ? "away" : "online",
      });
    };

    emitJoin();

    socket.on("connect", emitJoin);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      socket.emit("presence:leave");
      socket.off("connect", emitJoin);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isAuthenticated, user?.email, user?.name, user?.id, id, crm]);

  useEffect(() => {
    if (!isAuthenticated || !user?.email || !crm) return;

    socket.emit("presence:update", {
      page: location.pathname,
      status: document.hidden ? "away" : "online",
    });
  }, [location.pathname, isAuthenticated, user?.email, crm]);

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
      showConsole &&
        crmRef.current == data.site_url &&
        console.log("Mail site:", data.site_url);

      showConsole &&
        crmRef.current == data.site_url &&
        console.log("new mail", data);

      currentEventThreadId.current = data?.thread_id;

      if (data?.site_url == crmRef.current) {
        if (data.name === "paypal_status_sent") {
          setInvoiceOrderId(data.order_id);
        } else if (data.name === "outr_recent_activity") {
          queryClient.invalidateQueries({ queryKey: recentKeys.all });
          dispatch(eventActions.updateCount(1));
        } else {
          if (data.name === "unreplied_email") {
            dispatch(unrepliedAction.setShowNewEmailBanner(true));
          }

          if (userRef.current) {
            setNotificationCount((prev) => ({
              ...prev,
              [data.name]: Date.now(),
            }));
          } else {
            console.log("ADDING TO QUEUE");

            setEventQueue((prev) => ({
              ...prev,
              [data.name]: prev[data.name] ? prev[data.name] + 1 : 1,
            }));
          }
        }
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
  }, [dispatch]);

  const getMoveOptions = async () => {
    try {
      const data = await apiRequest({
        endpoint: `${crm}/index.php?entryPoint=move`,
      });

      return data;
    } catch (error) {
      console.error("Error fetching move options:", error);
      throw error;
    }
  };

  const moveData = async (threadId, labelId) => {
    try {
      const data = await apiRequest({
        endpoint: `${crm}/index.php?entryPoint=move`,
        params: {
          threadid: threadId,
          lblid: labelId,
        },
      });

      return data;
    } catch (error) {
      console.error("Error moving data:", error);
      throw error;
    }
  };

  return (
    <SocketContext.Provider
      value={{
        currentAvatar,
        setCurrentAvatar,
        crm,
        setCrm,
        setUserIdle,
        userIdle,
        eventQueue,
        currentEventThreadId,
        setEventQueue,
        eventQueueRef,
        invoiceOrderId,
        setInvoiceOrderId,
        getMoveOptions,
        moveData,
        notificationCount,
        setNotificationCount,
        activeUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};