import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const PageContext = createContext();
const socket = io("http://localhost:5000");
export const PageContextProvider = (props) => {
  const [activePage, setActivePage] = useState("");
  const [displayIntro, setDisplayIntro] = useState(true);
  const [enteredEmail, setEnteredEmail] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Receive messages from server
    socket.on("receive_message", (data) => {
      console.log("DATA FROM SERVER: " + JSON.stringify(data));
    });
    socket.on("latest_avatar", (avatar) => {
      console.log("Most recent avatar:", avatar);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  // Set activePage based on current URL
  useEffect(() => {
    const path = window.location.pathname;

    const firstPart = path.split("/")[1];
    setActivePage(firstPart || "");
  }, []);

  const value = {
    activePage,
    setActivePage,
    displayIntro,
    setDisplayIntro,
    enteredEmail,
    setEnteredEmail,
    search,
    setSearch,
  };

  return (
    <PageContext.Provider value={value}>{props.children}</PageContext.Provider>
  );
};
