import React, { useContext } from "react";
import Header from "./Header";
import { SocketContext } from "../../../context/SocketContext";

const UserActivity = () => {
  const { activeUsers } = useContext(SocketContext);

  return (
    <div className="p-8">
      <Header text={"User Activity"} />

      <div className="mt-6 bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Current Page</th>
              <th className="p-3">Last Active</th>
            </tr>
          </thead>

          <tbody>
            {activeUsers.map((user) => (
              <tr key={user.email} className="border-t hover:bg-gray-50 transition-colors">
                <td className="p-3">{user.name || "Unknown"}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <span
                    className={
                      user.status === "online"
                        ? "text-green-600 font-medium"
                        : "text-yellow-600 font-medium"
                    }
                  >
                    {user.status}
                  </span>
                </td>
                <td className="p-3">{user.page === "/" ? "/timeline" : user.page}</td>
                <td className="p-3">
  {user.lastActiveAt
    ? new Date(user.lastActiveAt).toLocaleString()
    : "-"}
</td>
              </tr>
            ))}

            {activeUsers.length === 0 && (
              <tr>
                <td className="p-4 text-gray-500" colSpan="5">
                  No active users right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserActivity;