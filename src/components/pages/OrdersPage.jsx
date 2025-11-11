import { useEffect } from "react";
import { Mail, Eye, Package } from "lucide-react";
import { Footer } from "../Footer";
import { useOrdersStore } from "../../store/ordersStore";


export function OrdersPage() {
  const { orders, loading, error, fetchOrders } = useOrdersStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-6 text-white">
        <h1 className="text-2xl mb-2">Welcome GuestPostCRM</h1>
        <div className="flex items-center gap-2 text-purple-100">
          <Mail className="w-4 h-4" />
          <span>your.business@email.com</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-800">ORDERS</h2>
          </div>
          <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            {orders.length} Active Orders
          </span>
        </div>

        {loading && (
          <div className="p-8 text-center text-gray-500">Loading orders...</div>
        )}

        {error && (
          <div className="p-8 text-center text-red-500">{error}</div>
        )}

        {!loading && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-600 text-white text-left">
                  <th className="px-6 py-3 font-medium">ORDER ID</th>
                  <th className="px-6 py-3 font-medium">CLIENT EMAIL</th>
                  <th className="px-6 py-3 font-medium">ANCHOR TEXT</th>
                  <th className="px-6 py-3 font-medium text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-700">{item.order_id || "N/A"}</td>
                    <td className="px-6 py-4 text-gray-900">{item.client_email || "—"}</td>
                    <td className="px-6 py-4 text-gray-700">{item.anchor_text_c || "—"}</td>
                    <td className="px-6 py-4 text-gray-900 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="font-semibold">
                          {item.total_amount_c ? `$${item.total_amount_c}` : "—"}
                        </span>
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
        )}

        {!loading && orders.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No orders found for this week.
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
