import {
  ShoppingCart,
  DollarSign,
  User,
  Flame,
  User2Icon,
  Sparkle,
  ChevronDown,
} from "lucide-react";

import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import Pagination from "../Pagination";

export function AiCreditsPage() {
  const [openPeriod, setOpenPeriod] = useState(false);
  const [type, setType] = useState("Credit");
  const periodOptions = ["Credit", "Debit", "Both"];

  const dropDownRef = useRef(null);

  const openPeriodRef = useRef(openPeriod);

  useEffect(() => {
    openPeriodRef.current = openPeriod;
  }, [openPeriod]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openPeriodRef.current && // always latest value
        dropDownRef.current &&
        !dropDownRef.current.contains(event.target)
      ) {
        setOpenPeriod(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Orders Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Sparkle className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl text-gray-900">CREDITS</h2>
          </div>

          {/* Dropdown */}
          <div className="relative" ref={dropDownRef}>
            <button
              onClick={() => setOpenPeriod(!openPeriod)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-gray-900">{type}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {openPeriod && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {periodOptions.map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setType(option);
                      setOpenPeriod(false);
                    }}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>EMAIL</span>
                  </div>
                </th>

                {(type === "Credit" || type === "Both") && (
                  <th className="px-6 py-4 text-left">CREDIT</th>
                )}

                {(type === "Debit" || type === "Both") && (
                  <th className="px-6 py-4 text-left">DEBIT</th>
                )}

                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>BALANCE</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
            
            </tbody>
          </table>
        </div>
     

        {[].length === 0 && (
          <div className="p-12 text-center">
            <Sparkle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No Credits yet.</p>
          </div>
        )}
      </div>
    </>
  );
}
