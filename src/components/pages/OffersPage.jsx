import { Mail, Gift, Tag, DollarSign, Calendar, User } from "lucide-react";
import { Footer } from "../Footer";

export function OffersPage() {
  const offers = [
    {
      offerName: "Premium Guest Post Package",
      client: "TechBlog Inc.",
      price: "$1,500",
      status: "Pending",
      validUntil: "30 Nov 2025",
      services: "DA50+ Guest Post",
    },
    {
      offerName: "Link Building Bundle",
      client: "Digital Marketing Co.",
      price: "$2,000",
      status: "Accepted",
      validUntil: "25 Nov 2025",
      services: "5 High DA Guest Posts",
    },
    {
      offerName: "Content Partnership",
      client: "SEO Agency",
      price: "$3,500",
      status: "Under Review",
      validUntil: "15 Dec 2025",
      services: "Monthly Guest Posts",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Accepted":
        return "bg-green-100 text-green-700";
      case "Under Review":
        return "bg-blue-100 text-blue-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-6 text-white">
        <h1 className="text-2xl mb-2">Welcome GuestPostCRM</h1>
        <div className="flex items-center gap-2 text-purple-100">
          <Mail className="w-4 h-4" />
          <span>your.business@email.com</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Offers</p>
              <p className="text-2xl text-gray-900 mt-1">3</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl text-gray-900 mt-1">1</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Accepted</p>
              <p className="text-2xl text-gray-900 mt-1">1</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Value</p>
              <p className="text-2xl text-gray-900 mt-1">$7K</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Offers Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6 text-green-600" />
            <h2 className="text-xl text-gray-900">OFFERS</h2>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            + New Offer
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <th className="px-6 py-4 text-left">OFFER NAME</th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>CLIENT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>PRICE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">STATUS</th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>VALID UNTIL</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">SERVICES</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-green-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-green-600">
                    {offer.offerName}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{offer.client}</td>
                  <td className="px-6 py-4 text-green-600">{offer.price}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                        offer.status
                      )}`}
                    >
                      {offer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {offer.validUntil}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{offer.services}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {offers.length === 0 && (
          <div className="p-12 text-center">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No offers yet. Create your first offer to get started.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
