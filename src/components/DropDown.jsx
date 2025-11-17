import { ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

const DropDown = ({ options, handleSelectOption }) => {
  const [open, setOpen] = useState(false);
  const dropRef = useRef();
  const { timeline } = useSelector((state) => state.ladger);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedTitle =
    options.find((option) => option.period === timeline)?.title || "Select";

  return (
    <div className="relative cursor-pointer" ref={dropRef}>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 
                   rounded-lg shadow-sm hover:shadow transition-all"
      >
        <span className="text-gray-900 text-sm font-medium whitespace-nowrap">
          {selectedTitle}
        </span>

        {/* Arrow Rotation Animation */}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm 
                       border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50"
          >
            {options.map((option) => (
              <motion.div
                key={option.period}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                onClick={() => {
                  setOpen(false);
                  handleSelectOption(option.period);
                }}
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer 
                           transition-colors whitespace-nowrap"
              >
                {option.title}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DropDown;
