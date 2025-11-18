import React from "react";
import { Link } from "react-router-dom";

const Header = ({ text }) => {
  return (
    <div className="flex gap-2 items-center mb-6 ">
      <Link to="/settings" className="hover:scale-110 transition ">
        <img
          width="48"
          height="48"
          src="https://img.icons8.com/arcade/64/back.png"
          alt="back"
        />
      </Link>
      <h1 className="text-3xl font-bold">{text}</h1>
    </div>
  );
};

export default Header;
