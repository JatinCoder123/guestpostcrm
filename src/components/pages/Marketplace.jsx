import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { extractEmail } from "../../assets/assets";
import { PageContext } from "../../context/pageContext";
import { ladgerAction } from "../../store/Slices/ladger";
import SearchComponent from "./SearchComponent";
import { useNavigate } from "react-router-dom";

import {
  Store,
  Gift,
  User,
  Calendar,
  Pencil,
  Pen,
  LinkIcon,
  ActivityIcon,
  BarChart4Icon,
  Trash,
} from "lucide-react";
import {
  deleteMarketPlace,
  getMarketplace,
  marketplaceActions,
} from "../../store/Slices/Marketplace"; // named import
import { LoadingChase } from "../Loading";

export function Marketplace() {
  const dispatch = useDispatch();
  const { handleDateClick } = useContext(PageContext)
  const { items, error, loading, deleting, message, deleteMarketPlaceId } =
    useSelector((state) => state.marketplace);
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(marketplaceActions.clearErrors());
    }
    if (message) {
      toast.success(message);
      dispatch(marketplaceActions.clearMessage());
    }
  }, [error, dispatch, message]);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 mr-5">
        <div className="flex items-center gap-3">
          <Store className="w-6 h-6 text-yellow-600" />
          <h2 className="text-xl text-gray-900 font-semibold">
            {" "}
            MARKETPLACE
          </h2>

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
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  CREATED AT
                </div>
              </th>

              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  EMAIL
                </div>
              </th>
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <BarChart4Icon className="w-4 h-4" />
                  TYPE
                </div>
              </th>

              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <ActivityIcon className="w-4 h-4" />
                  ACTIONS
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((row, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-pink-50 transition"
              >
                <td onClick={() => handleDateClick({ email: row?.name, navigate: "/" })}
                  className="px-6 py-4 text-gray-600 cursor-pointer">
                  {row.date_entered}
                </td>
                <td
                  className="px-6 py-4 text-blue-600 cursor-pointer"
                  onClick={() => handleDateClick({ email: row?.name, navigate: "/contacts" })}
                >
                  {row.name}
                </td>
                <td className="px-6 py-4 text-blue-600">
                  {row?.description !== null ? "Brand" : "Non Brand"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 item-center justify-center">
                    {/* Update Button */}
                    {deleting && deleteMarketPlaceId === row.id ? (
                      <LoadingChase size="20" color="red" />
                    ) : (
                      <button
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                        onClick={() => dispatch(deleteMarketPlace(row.id))}
                      >
                        <Trash className="w-5 h-5 text-red-600" />
                      </button>
                    )}
                  </div>
                </td>
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
