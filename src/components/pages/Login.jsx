import { motion } from "framer-motion";
import { useState } from "react";
import { AUTH_URL } from "../../store/constants.js";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginWithGoogle = () => {
    window.location.href = `${AUTH_URL}?controller=auth&action=googleLogin`;
  };

  const handleLoginWithMicrosoft = () => {
    window.location.href = `${AUTH_URL}?controller=auth&action=microsoftLogin`;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-[#e8f0ff] via-[#f3fffa] to-[#f8fff5]">
      {/* LEFT SECTION */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-1 flex-col items-center justify-center px-6 md:px-10"
      >
        {/* Logo */}
        <img
          src="/logo.png"
          alt="GuestPostCRM"
          className="w-56 mb-10 select-none"
        />

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Login to your account
        </h1>

        {/* Google Login */}
        <button
          onClick={handleLoginWithGoogle}
          className="mt-8 w-full max-w-xs flex items-center justify-center gap-3 rounded-full px-4 py-3 border border-gray-300 bg-white shadow-sm hover:bg-gray-100 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="text-gray-800 font-medium">Login with Google</span>
        </button>

        {/* Microsoft Login */}
        <button
          onClick={handleLoginWithMicrosoft}
          className="mt-4 w-full max-w-xs flex items-center justify-center gap-3 rounded-full px-4 py-3 border border-gray-300 bg-black text-white shadow-sm hover:bg-gray-900 transition"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
            alt="Microsoft"
            className="w-5 h-5 bg-white rounded"
          />
          <span className="font-medium">Log in with Microsoft</span>
        </button>

        <p className="mt-6 text-gray-600 text-sm">
          Don’t have an account?
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 text-purple-600 font-medium hover:underline"
          >
            Sign Up
          </button>
        </p>
      </motion.div>

      {/* RIGHT SECTION (IMAGE / VIDEO) */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-1 items-center justify-center p-6"
      >
        <div className="w-full h-[88vh] rounded-[30px] overflow-hidden shadow-xl">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source
              src="https://dev.outrightcrm.in/dev/demokjl1/wp-content/nov20_test/Login%20G-Bot%20second%201.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </motion.div>
    </div>
  );
}
