import {
  Mail,
  ShoppingCart,
  DollarSign,
  Calendar,
  User,
  Flame,
  User2Icon,
  Sparkle,
  ChevronDown,
} from "lucide-react";

import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import Pagination from "../Pagination";
import { aiCreditsAction, updateIndex } from "../../store/Slices/aiCredits";

export function AiCreditsPage() {
  const { aiCredits, balance, count } = useSelector((state) => state.aiCredits);
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Balance</p>
              <p className="text-2xl text-gray-900 mt-1">{balance}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Flame className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Count</p>
              <p className="text-2xl text-gray-900 mt-1">{count}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User2Icon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

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
              {aiCredits.map((credit) => (
                <tr
                  key={credit.id}
                  className="border-b border-gray-100 hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-gray-900">{credit.email}</td>

                  {(type === "Credit" || type === "Both") && (
                    <td className="px-6 py-4 text-indigo-600">
                      {credit.credit}
                    </td>
                  )}

                  {(type === "Debit" || type === "Both") && (
                    <td className="px-6 py-4 text-indigo-600">
                      {credit.debit}
                    </td>
                  )}

                  <td className="px-6 py-4 text-indigo-600">
                    {credit.balance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination slice={"aiCredits"} fn={updateIndex} />

        {aiCredits.length === 0 && (
          <div className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No orders yet. Create your first order to get started.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
