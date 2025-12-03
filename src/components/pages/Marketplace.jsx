import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {Store, Gift, User, Calendar,Pencil } from "lucide-react";
import { getMarketplace } from "../../store/Slices/Marketplace"; // named import

export function Marketplace() {
  const dispatch = useDispatch();
  const { items, count, loading } = useSelector((state) => state.marketplace);

  const [showOffer, setShowOffer] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    dispatch(getMarketplace());
  }, [dispatch]);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Store className="w-6 h-6 text-yellow-600" />
          <h2 className="text-xl text-gray-900 font-semibold">Marketplace</h2>

          <a
            href="https://www.guestpostcrm.com/blog/offers-in-guestpostcrm/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              width="30"
              height="30"
              src="https://img.icons8.com/offices/30/info.png"
              alt="info"
            />
          </a>
        </div>
        <div className="px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          {items.length} Active
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </div>
              </th>

              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Name
                </div>
              </th>

              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((row, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-pink-50 transition"
              >
                <td className="px-6 py-4 text-gray-600">{row.date_entered}</td>
                <td className="px-6 py-4 text-blue-600">{row.name}</td>
                <td className="px-6 py-4">{/* Actions placeholder */} <Pencil className="w-7 h-7 text-blue-600 cursor-pointer" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && items.length === 0 && (
        <div className="p-12 text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No marketplace data found.</p>
        </div>
      )}
    </div>
  );
}
