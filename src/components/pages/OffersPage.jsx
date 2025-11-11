import React, { useEffect } from "react";
import { Mail, Gift, Eye, Search } from "lucide-react";
import { Footer } from "../Footer";
import { useOffersStore } from "../../store/offersStore";

export function OffersPage() {
  const { offers, loading, error, fetchOffers } = useOffersStore();

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-6 text-white flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-semibold">Welcome GuestPostCRM</h1>
        <div className="flex items-center bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm border border-white/20">
          <Mail className="w-4 h-4 text-white mr-2" />
          <span className="bg-white text-gray-800 rounded-full px-3 py-1 text-sm font-medium shadow">
            your.business@email.com
          </span>
        </div>
      </div>

      {/* Offers Section */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl text-gray-900 font-semibold">OFFERS</h2>
          </div>
          <div className="px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {offers.length} Active Offers
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading offers...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : offers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No offers found for this week.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-yellow-400 text-gray-900 font-semibold">
                  <th className="px-6 py-4 text-sm uppercase">Date</th>
                  <th className="px-6 py-4 text-sm uppercase">Sender</th>
                  <th className="px-6 py-4 text-sm uppercase">Subject</th>
                  <th className="px-6 py-4 text-sm uppercase text-right pr-10">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr
                    key={offer.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {offer.date}
                    </td>
                    <td className="px-6 py-4 text-gray-800 text-sm flex items-center gap-2">
                      {offer.sender}
                      <Eye className="w-4 h-4 text-gray-400" />
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {offer.subject}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-semibold text-right flex items-center justify-end gap-4 pr-6">
                      <span>{offer.amount}</span>
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-100 text-purple-600 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                          <span>AI</span>
                        </div>
                        <Search className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
