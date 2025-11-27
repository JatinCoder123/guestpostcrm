import React, { useState, useEffect, useRef } from "react";

const UserDropdown = ({
  users = [
    {
      name: "ABC",
      email: "verm.jatin2004@gmail.com",
    },
    {
      name: "ashish",
      email: "ashish@outrightcrm.com",
    },
    {
      name: "Sales",
      email: "sales@outrightcrm.com",
    },
    {
      name: "Promotion",
      email: "promotion@outrightcrm.com",
    },
    {
      name: "OutrightCRM 7",
      email: "outrightcrm7@gmail.com",
    },
    {
      name: "Vikas",
      email: "vikas@outrightcrm.com",
    },
  ],
  forwardHandler,
  onClose,
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="absolute top-14 -right-8 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50"
    >
      <h3 className="font-semibold text-gray-700 mb-2">Forward To</h3>

      {/* User List */}
      <div className="max-h-52 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-300">
        {users.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">
            No users available
          </p>
        ) : (
          users.map((user, index) => (
            <div
              key={index}
              onClick={() => setSelectedUser(user)}
              className={`p-2 rounded-lg cursor-pointer border transition-all
              ${
                selectedUser?.email === user.email
                  ? "bg-blue-100 border-blue-400"
                  : "hover:bg-gray-100 border-transparent"
              }`}
            >
              <p className="font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          ))
        )}
      </div>

      {/* Forward Button */}
      <button
        onClick={() => selectedUser && forwardHandler(selectedUser)}
        disabled={!selectedUser}
        className={`w-full mt-3 py-2 rounded-lg text-sm text-white transition-all
          ${
            selectedUser
              ? "bg-blue-600 hover:bg-blue-700 active:scale-95"
              : "bg-gray-400 cursor-not-allowed"
          }
        `}
      >
        Forward Email
      </button>
    </div>
  );
};

export default UserDropdown;
