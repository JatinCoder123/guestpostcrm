import { Mail } from "lucide-react";

const WelcomeHeader = () => {
  return (
    <>
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-6 text-white flex justify-between items-center">
        {/* Left Side - Welcome Text */}
        <h1 className="text-2xl font-semibold">Welcome GuestPostCRM</h1>

        {/* Right Side - Email Box */}
        <div className="flex items-center bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm border border-white/20">
          <Mail className="w-4 h-4 text-white mr-2" />
          <span className="bg-white text-gray-800 rounded-full px-3 py-1 text-sm font-medium">
            quietfluence@gmail.com
          </span>
        </div>
      </div>
    </>
  );
};

export default WelcomeHeader;
