import React, { useEffect } from "react";
import { Mail, Handshake, Eye, Search, Brain } from "lucide-react";
import { Footer } from "../Footer";
import { useDealsStore } from "../../store/dealsStore";

export function DealsPage() {
  const { deals, loading, error, fetchDeals } = useDealsStore();

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return (
    <div className="p-6">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-6 text-white flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-semibold">Welcome GuestPostCRM</h1>
        <div className="flex items-center bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm border border-white/20">
          <Mail className="w-4 h-4 text-white mr-2" />
          <span className="bg-white text-gray-800 rounded-full px-3 py-1 text-sm font-medium shadow">
            your.business@email.com
          </span>
        </div>
      </div>

      {/* Deals Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative">
        <div className="absolute top-3 right-3 bg-cyan-100 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
          {deals.length > 0 ? `${deals.length} Active Deals` : "No Active Deals"}
        </div>

        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Handshake className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">DEALS</h2>
          </div>
        </div>

        {loading && (
          <div className="p-12 text-center text-gray-500">
            Loading this week's deals...
          </div>
        )}

        {error && !loading && (
          <div className="p-12 text-center text-red-500">{error}</div>
        )}

        {!loading && !error && deals.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-700">
              <thead>
                <tr className="bg-yellow-400 text-white">
                  <th className="px-6 py-4 text-left font-semibold">DATE</th>
                  <th className="px-6 py-4 text-left font-semibold">SENDER</th>
                  <th className="px-6 py-4 text-left font-semibold">STATUS</th>
                  <th className="px-6 py-4 text-right font-semibold">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">{deal.date}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      {deal.sender}
                      <Eye className="w-4 h-4 text-gray-400" />
                    </td>
                    <td className="px-6 py-4">{deal.subject}</td>
                    <td className="px-6 py-4 text-right text-gray-800 font-semibold flex justify-end items-center gap-3">
                      <span className="text-lg font-bold">{deal.amount}</span>
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <Search className="w-4 h-4 text-purple-600" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && deals.length === 0 && (
          <div className="p-12 text-center">
            <Handshake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No offers found for this week.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
