import React, { useState, useEffect, useRef } from "react";
import useModule from "../hooks/useModule";
import Loading, { LoadingChase } from "./Loading";
import { useSelector } from "react-redux";

const UserDropdown = ({ forwardHandler, onClose }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const dropdownRef = useRef(null);
  const { crmEndpoint } = useSelector(state => state.user)
  const domain = crmEndpoint.split("?")[0];
  const { loading, data: users } = useModule({
    url: `${domain}?entryPoint=fetch_gpc&type=get_users`,
    name: "USERS",
  });

  return (
    <div
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
      className="absolute top-14 -right-8 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-[999]"
    >
      <h3 className="font-semibold text-gray-700 mb-2">Forward To</h3>

      {/* User List */}
      {loading ? (
        <LoadingChase />
      ) : (
        <>
          {" "}
          <div className="max-h-52 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-300">
            {users?.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">
                No users available
              </p>
            ) : (
              users?.map((user, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedUser(user)}
                  className={`p-2 rounded-lg cursor-pointer border transition-all
              ${selectedUser?.email === user.email
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
            onClick={() => {
              onClose();
              selectedUser && forwardHandler(selectedUser.id);
            }}
            disabled={!selectedUser}
            className={`w-full mt-3 py-2 rounded-lg text-sm text-white transition-all
          ${selectedUser
                ? "bg-blue-600 hover:bg-blue-700 active:scale-95"
                : "bg-gray-400 cursor-not-allowed"
              }
        `}
          >
            Forward Email
          </button>
        </>
      )}
    </div>
  );
};

export default UserDropdown;
