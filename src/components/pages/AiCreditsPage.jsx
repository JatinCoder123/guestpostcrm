import {
  Mail,
  ShoppingCart,
  DollarSign,
  Calendar,
  User,
  Flame,
  User2Icon,
  Sparkle,
} from "lucide-react";
import { Footer } from "../Footer";
import { useSelector } from "react-redux";

export function AiCreditsPage() {
  const { aiCredits, balance, count } = useSelector((state) => state.aiCredits);
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
                <th className="px-6 py-4 text-left">CREDIT </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>BALANCE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">USER TYPE</th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>CREDIT DATE</span>
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
                  <td className="px-6 py-4 text-indigo-600">{credit.credit}</td>

                  <td className="px-6 py-4 text-green-600">{credit.balance}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm `}>
                      {credit.user_type_c}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {credit.date_entered}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {aiCredits.length === 0 && (
          <div className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
