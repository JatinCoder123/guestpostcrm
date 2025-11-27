import { useState } from "react";

import { useSelector } from "react-redux";
import CreateOffer from "../CreateOffer";
import { Gift, User, Calendar, DollarSign, Tag, Pencil } from "lucide-react";
import { getOffers } from "../../store/Slices/offers";
import Pagination from "../Pagination";

export function OffersPage() {
  const { offers, count, loading } = useSelector((state) => state.offers);
  const [showOffer, setShowOffer] = useState(false);
  const [editData, setEditData] = useState(null);

  // Show popup only
  if (showOffer) {
    return (
      <CreateOffer
        editData={editData}
        onClose={() => {
          setEditData(null);
          setShowOffer(false);
        }}
      />
    );
  }

  // Calculate stats
  const pending = offers.filter((o) => o.status === "Pending").length;
  const accepted = offers.filter((o) => o.status === "Accepted").length;

  return (
    <>
      {/* ⭐ Stats Cards (Top Section) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        
        {/* Total Offers */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Offers</p>
              <p className="text-2xl text-gray-900 mt-1">{count}</p>
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

        {/* Total Value */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Value</p>
              <p className="text-2xl text-gray-900 mt-1">
                ${offers.reduce((sum, o) => sum + Number(o.amount || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ Offers Section (Header + Table) */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          
          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl text-gray-900 font-semibold">OFFERS</h2>
             <a href="https://www.guestpostcrm.com/blog/offers-in-guestpostcrm/" target="_blank" 
  rel="noopener noreferrer">
         <img width="30" height="30" src="https://img.icons8.com/offices/30/info.png" alt="info"/>
         </a>
          </div>
          <div className="px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {offers.length} Active Offers
          </div>

          <button
            onClick={() => {
              setEditData(null);
              setShowOffer(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-cyan-700 transition cursor-pointer"
          >
            + New Offer
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <th className="px-6 py-4 text-left">OFFER ID</th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>CLIENT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">DISCOUNT</th>
                <th className="px-6 py-4 text-left">EXPIRES</th>
                <th  className="px-6 py-4 text-left" >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <samp>
                    Date
                    </samp>
                  </div>
                  </th>
                 <th className="px-6 py-4 text-left">ACTIONS</th>
              </tr>
            </thead>

           <tbody>
  {offers.map((offer, index) => (
    <tr
      key={index}
      className="border-b border-gray-100 hover:bg-pink-50 transition"
    >
      <td className="px-6 py-4 text-blue-600">{offer.name}</td>
      <td className="px-6 py-4">{offer.amount}</td>
      <td className="px-6 py-4 text-green-600">{offer.client_offer_c}</td>
      <td className="px-6 py-4 text-gray-600">{offer.our_offer_c}</td>
      <td className="px-6 py-4 text-gray-600">{offer.date_entered}</td>

      <td className="px-6 py-4">
        <button
          className="text-blue-600 hover:underline"
          onClick={() => {
            setEditData(offer);
            setShowOffer(true);
          }}
        >
          <Pencil className="w-7 h-7 text-blue-600 cursor-pointer" />

        </button>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
        {offers.length > 0 && <Pagination slice={"offers"} fn={getOffers} />}

        {!loading && offers.length === 0 && (
          <div className="p-12 text-center">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No offers yet. Create your first offer to get started.</p>
          </div>
        )}
      </div>
    </>
  );
}
