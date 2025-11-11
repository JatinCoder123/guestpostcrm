import {
  Mail,
  MessageSquare,
  Eye,
  Package,
} from "lucide-react";
import { Footer } from "../Footer";

export function OrdersPage() {
  const orders = [
    {
      order: "06 Nov 25 at 12:40 PM",
      sender: "kartikey@outrightsystems.org",
      subject: "Special pricing offer",
      amount: "$499",
    },
    {
      order: "06 Nov 25 at 07:03 AM",
      sender: "marketing@digitalagency.com",
      subject: "Limited time guest post package",
      amount: "$499",
    },
    {
      order: "05 Nov 25 at 04:46 PM",
      sender: "sales@contentpro.io",
      subject: "Exclusive partnership offer",
      amount: "$499",
    },
    {
      order: "05 Nov 25 at 02:10 PM",
      sender: "offers@seoexperts.com",
      subject: "Premium link building deal",
      amount: "$499",
    },
  ];

  return (
    <div className="p-6">
      {/* ✅ Keep Header Unchanged */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-6 text-white">
        <h1 className="text-2xl mb-2">Welcome GuestPostCRM</h1>
        <div className="flex items-center gap-2 text-purple-100">
          <Mail className="w-4 h-4" />
          <span>your.business@email.com</span>
        </div>
      </div>

      {/* ✅ Orders Section (Updated like image) */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {/* Header Row */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-800">ORDER</h2>
          </div>
          <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            4 Active Offers
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-green-600 text-white text-left">
                <th className="px-6 py-3 font-medium">ORDER</th>
                <th className="px-6 py-3 font-medium">SENDER</th>
                <th className="px-6 py-3 font-medium">SUBJECT</th>
                <th className="px-6 py-3 font-medium text-right">AMOUNT</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-700">{item.order}</td>
                  <td className="px-6 py-4 text-gray-900">{item.sender}</td>
                  <td className="px-6 py-4 text-gray-700">{item.subject}</td>

                  <td className="px-6 py-4 text-gray-900 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-semibold">{item.amount}</span>
                      <div className="relative flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full text-[10px] font-bold text-purple-600">
                        AI
                      </div>
                      <Eye className="w-4 h-4 text-purple-600 cursor-pointer hover:scale-110 transition-transform" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No orders yet. Create your first order to get started.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
