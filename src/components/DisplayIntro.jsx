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
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      key="loading-screen"
      className="flex flex-col items-center justify-center h-screen w-full gap-3 bg-[#F8FAFC]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ROTATING LOGO */}
      <motion.img
        src={logo}
        alt="App Logo"
        className="w-24 h-24 object-contain"
        initial={{
          rotateY: 0,
        }}
        animate={{
          rotateY: 360, // full rotation
        }}
        transition={{
          repeat: Infinity, // keeps rotating forever
          repeatType: "loop",
          duration: 1, // speed (smaller = faster)
          ease: "linear", // smooth infinite motion
        }}
      />

      {/* TITLE */}
      <AnimatePresence>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="font-bold font-mono text-5xl"
        >
          <span className="text-[#cf4d4d]">GuestPost</span>
          <span className="text-[#33A852]">CRM</span>
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
};

export default DisplayIntro;
