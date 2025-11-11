import {
  Mail,
  CreditCard,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";
import { Footer } from "../Footer";

export function PaymentMissedPage() {
  const missedPayments = [
    {
      client: "TechBlog Inc.",
      invoiceId: "#INV-003",
      amount: "$750",
      dueDate: "08 Nov 2025",
      daysPastDue: 1,
      lastContact: "09 Nov 2025",
    },
    {
      client: "Digital Marketing Co.",
      invoiceId: "#INV-005",
      amount: "$1,500",
      dueDate: "05 Nov 2025",
      daysPastDue: 4,
      lastContact: "07 Nov 2025",
    },
    {
      client: "Content Agency",
      invoiceId: "#INV-007",
      amount: "$900",
      dueDate: "01 Nov 2025",
      daysPastDue: 8,
      lastContact: "03 Nov 2025",
    },
  ];

  const getSeverityColor = (days) => {
    if (days >= 7) return "bg-red-100 text-red-700 border-red-300";
    if (days >= 3) return "bg-orange-100 text-orange-700 border-orange-300";
    return "bg-yellow-100 text-yellow-700 border-yellow-300";
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
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Missed Payments</p>
              <p className="text-2xl text-gray-900 mt-1">3</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Overdue</p>
              <p className="text-2xl text-gray-900 mt-1">$3.1K</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Days Overdue</p>
              <p className="text-2xl text-gray-900 mt-1">4.3</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Recovery Rate</p>
              <p className="text-2xl text-gray-900 mt-1">85%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Missed Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-red-600" />
            <h2 className="text-xl text-gray-900">PAYMENT MISSED</h2>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Send Reminders
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>CLIENT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">INVOICE ID</th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>AMOUNT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>DUE DATE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">DAYS PAST DUE</th>
                <th className="px-6 py-4 text-left">LAST CONTACT</th>
                <th className="px-6 py-4 text-left">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {missedPayments.map((payment, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-gray-900">{payment.client}</td>
                  <td className="px-6 py-4 text-red-600">
                    {payment.invoiceId}
                  </td>
                  <td className="px-6 py-4 text-green-600">{payment.amount}</td>
                  <td className="px-6 py-4 text-gray-600">{payment.dueDate}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm border ${getSeverityColor(
                        payment.daysPastDue
                      )}`}
                    >
                      {payment.daysPastDue} days
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {payment.lastContact}
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Send Reminder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {missedPayments.length === 0 && (
          <div className="p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No missed payments. All invoices are paid on time!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
