import { createContext, useState } from "react";

export const PageContext = createContext();
export const PageContextProvider = (props) => {
  const [activePage, setActivePage] = useState("");
  const [displayIntro, setDisplayIntro] = useState(true);
  const value = {
    activePage,
    setActivePage,
    displayIntro,
    setDisplayIntro,
  };
  return (
    <PageContext.Provider value={value}>{props.children}</PageContext.Provider>
  );
};
