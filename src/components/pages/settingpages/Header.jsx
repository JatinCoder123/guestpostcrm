import React from "react";
import { Link } from "react-router-dom";

const Header = ({ text, onCreate, create }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* LEFT: Back Button + Title */}
      <div className="flex gap-3 items-center">
        <Link to="/settings" className="hover:scale-110 transition">
          <img
            width="48"
            height="48"
            src="https://img.icons8.com/arcade/64/back.png"
            alt="back"
          />
        </Link>

        <h1 className="text-3xl font-semibold">{text}</h1>
      </div>

      {/* RIGHT: Create Button */}
      <button
        onClick={onCreate}
        className="p-5 cursor-pointer hover:scale-110 flex items-center justify-center  transition "
      >
        <img
          width="36"
          height="36"
          src="https://img.icons8.com/arcade/64/plus.png"
          alt="plus"
        />
      </button>
    </div>
  );
};

export default Header;
