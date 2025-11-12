import { createContext, useState } from "react";

export const pageContext = createContext();
export const PageContextProvider = (props) => {
  const [activePage, setActivePage] = useState("");
  const value = {
    activePage,
    setActivePage,
  };
  return (
    <pageContext.Provider value={value}>{props.children}</pageContext.Provider>
  );
};
