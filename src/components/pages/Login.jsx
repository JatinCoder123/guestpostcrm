import { motion } from "framer-motion";
import { useState } from "react";
import { AUTH_URL } from "../../store/constants.js";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginWithGoogle = async () => {
    window.location.href = `${AUTH_URL}?controller=auth&action=googleLogin`;
  };

  const handleLoginWithMicrosoft = () => {
    window.location.href = `${AUTH_URL}?controller=auth&action=microsoftLogin`;
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "#0d0f12", color: "#ffffff" }}
    >
      {/* Left Side - Auth Form */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8 w-full min-h-screen"
      >
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold">
            {isLogin ? "Login to your account" : "Create your account"}
          </h1>

          <p className="mt-2 text-sm" style={{ color: "#b0b0b0" }}>
            {isLogin
              ? "Enter your email below to login to your account"
              : "Sign up with your email and password to get started"}
          </p>
        </div>

        <div className="mt-4 w-full max-w-sm">
          {/* Google Login */}
          <button
            className="mt-6 w-full flex items-center justify-center gap-3 rounded-full px-4 py-2 font-medium transition"
            onClick={handleLoginWithGoogle}
            style={{
              backgroundColor: "#0d0f12",
              border: "1px solid #2c2f34",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#25292e")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#0d0f12")
            }
          >
            <span className="flex items-center justify-center w-6 h-6 bg-white rounded-full">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-4 h-4"
              />
            </span>
            <span>
              {isLogin ? "Login With Google" : "Continue With Google"}
            </span>
          </button>

          {/* Microsoft Login */}
          <a
            className="mt-6 w-full flex items-center justify-center gap-3 rounded-full px-4 py-2 font-medium transition"
            onClick={handleLoginWithMicrosoft}
            style={{
              backgroundColor: "#0d0f12",
              border: "1px solid #2c2f34",
              opacity: 0.6,
            }}
          >
            <span className="flex items-center justify-center w-6 h-6 bg-white rounded-full">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                alt="Microsoft"
                className="w-4 h-4"
              />
            </span>
            <span>
              {isLogin ? "Login With Microsoft" : "Continue With Microsoft"}
            </span>
          </a>

          <p className="mt-6 text-center text-sm" style={{ color: "#b0b0b0" }}>
            {isLogin ? "Don’t have an account?" : "Already have an account?"}

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 hover:underline"
              style={{ color: "#7c5dfa" }}
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
      </motion.div>

      {/* Right Side - Image */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden flex-1 items-center justify-center lg:flex"
        style={{ backgroundColor: "#1a1d21" }}
      >
        <img src={`/logo.png`} alt="Auth" className="max-w-sm rounded-full" />
      </motion.div>
    </div>
  );
}
