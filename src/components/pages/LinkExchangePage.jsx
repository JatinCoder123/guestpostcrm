import { useState } from "react";
import { Gift, User, Calendar, DollarSign, Tag, Pen } from "lucide-react";

export function LinkExchangePage() {
  const [showPopup, setShowPopup] = useState(false);
  const [editData, setEditData] = useState(null);

  // ⭐ Static Dummy Data
  const links = [
    {
      date: "2025-01-30",
      id: "LE001",
      partner: "example.com",
      give: "Link From Blog",
      take: "Homepage Link",
      status: "Pending",
    },
    {
      date: "2025-01-28",
      id: "LE002",
      partner: "mysite.org",
      give: "Guest Post Link",
      take: "Sidebar Link",
      status: "Accepted",
    },
    {
      date: "2025-01-22",
      id: "LE003",
      partner: "seo-site.net",
      give: "Footer Link",
      take: "Guest Post",
      status: "Pending",
    },
  ];

  const total = links.length;
  const pending = links.filter((l) => l.status === "Pending").length;
  const accepted = links.filter((l) => l.status === "Accepted").length;

  // ⭐ Show popup like CreateOffer
  if (showPopup) {
    return (
      <div className="p-10 bg-white rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {editData ? "Edit Link Exchange" : "Create Link Exchange"}
        </h2>

        <button
          onClick={() => {
            setEditData(null);
            setShowPopup(false);
          }}
          className="px-4 py-2 rounded-lg bg-red-500 text-white"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ⭐ Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        
        {/* Total Exchanges */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Exchanges</p>
              <p className="text-2xl text-gray-900 mt-1">{total}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl text-gray-900 mt-1">{pending}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Accepted */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Accepted</p>
              <p className="text-2xl text-gray-900 mt-1">{accepted}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-green-700">✓</span>
            </div>
          </div>
        </div>

        {/* Total Value (Static for UI only) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Value</p>
              <p className="text-2xl text-gray-900 mt-1">$0</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ Header + Create Button */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl text-gray-900 font-semibold">
              LINK EXCHANGE
            </h2>
          </div>

          {/* Create Button + Tooltip */}
          <div className="relative group">
            <button
              onClick={() => setShowPopup(true)}
              className="p-5 cursor-pointer hover:scale-110 flex items-center justify-center transition"
            >
              <img
                width="40"
                height="40"
                src="https://img.icons8.com/arcade/64/plus.png"
                alt="plus"
              />
            </button>

            <span className="absolute left-1/5 -bottom-3 -translate-x-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow-md">
              Create Link Exchange
            </span>
          </div>
        </div>

        {/* ⭐ Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    DATE
                  </div>
                </th>
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    PARTNER
                  </div>
                </th>
                <th className="px-6 py-4 text-left">YOU GIVE</th>
                <th className="px-6 py-4 text-left">YOU TAKE</th>
                <th className="px-6 py-4 text-left">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {links.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 hover:bg-pink-50 transition"
                >
                  <td className="px-6 py-4 text-gray-600">{row.date}</td>
                  <td className="px-6 py-4 text-blue-600">{row.id}</td>
                  <td className="px-6 py-4 text-gray-700">{row.partner}</td>
                  <td className="px-6 py-4 text-green-600">{row.give}</td>
                  <td className="px-6 py-4 text-gray-600">{row.take}</td>

                  <td className="px-6 py-4">
                    <button
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      onClick={() => {
                        setEditData(row);
                        setShowPopup(true);
                      }}
                    >
                      <Pen className="w-5 h-5 text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {links.length === 0 && (
          <div className="p-12 text-center">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No link exchanges yet. Create your first one to begin.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
