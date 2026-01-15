import { motion } from "framer-motion";
import logo from "../../assets/assets";

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-white flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-8">
        {/* Rotating Logo */}
        <motion.img
          src={logo}
          alt="logo"
          className="w-24 h-24 object-contain"
          animate={{ rotateY: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Text Content */}
        <div className="flex flex-col items-center gap-4">
          <motion.h2
            className="text-2xl font-semibold text-gray-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Please wait...
          </motion.h2>
          {/* Animated Dots */}
          <div className="flex gap-2 mt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-gray-300 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </div>
  );
}
