import { useContext, useEffect } from "react";
import { PageContext } from "../context/pageContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/assets.js";
const DisplayIntro = () => {
  const { setDisplayIntro } = useContext(PageContext);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayIntro(false);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  return (
    <motion.div
      key="loading-screen"
      className="flex flex-col items-center justify-center h-screen w-full gap-3 bg-[#F8FAFC]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.img
        src={logo}
        alt="App Logo"
        className="w-24 h-24 object-contain"
        initial={{
          opacity: 0,
          scale: 0.5,
          x: -200,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          x: 0,
          transition: {
            type: "spring",
            stiffness: 120,
            damping: 15,
            duration: 0.8,
          },
        }}
        exit={{
          opacity: 0,
          scale: 0.7,
          x: 200,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 1,
          },
        }}
      />
      <AnimatePresence>
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="font-bold font-mono  text-5xl  "
        >
          <span className="text-[#cf4d4d] ">GuestPost</span>
          <span className="text-[#33A852]">Crm</span>
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
};

export default DisplayIntro;
