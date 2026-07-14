import React, { useContext } from "react";
import Header from "./Header";
import { SocketContext } from "../../../context/SocketContext";
import { useNavigate } from "react-router-dom";

const UserActivity = () => {
  const { activeUsers } = useContext(SocketContext);
  const navigateTo = useNavigate()

  const sortedUsers = [...activeUsers].sort((a, b) => {
    if (a.status === "online" && b.status !== "online") return -1;
    if (a.status !== "online" && b.status === "online") return 1;
    return 0;
  });
  const getTimeAgo = (date) => {
    if (!date) return "-";

    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "min", seconds: 60 },
      { label: "sec", seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);

      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
      }
    }

    return "Just now";
  };

  return (
    <div className="p-8">
      <Header text={"User Activity"} />

      <div className="mt-6 bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr
            >
              <th className="p-3">Last Active</th>

              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Current Page</th>
            </tr>
          </thead>

          <tbody>
            {sortedUsers.map((user) => (
              <tr onClick={() => navigateTo(`/view-reports?email=${encodeURIComponent(user.email)}`)} key={user.email} className="border-t hover:bg-gray-50 transition-colors">
                <td className="p-3 text-gray-600">
                  {getTimeAgo(user.lastActiveAt)}
                </td>
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
                    {user.status === "online" ? "online" : "idle"}
                  </span>
                </td>
                <td className="p-3">{user.page === "/" ? "/timeline" : user.page}</td>

              </tr>
            ))}

            {sortedUsers.length === 0 && (
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