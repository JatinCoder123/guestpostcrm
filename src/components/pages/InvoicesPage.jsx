import {
  Mail,
  FileText,
  DollarSign,
  Calendar,
  User,
  Download,
} from "lucide-react";

import { useSelector } from "react-redux";

export function InvoicesPage() {
  const { invoices, count } = useSelector((state) => state.invoices);

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "SENT":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Invoices</p>
              <p className="text-2xl text-gray-900 mt-1">{count}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Paid</p>
              <p className="text-2xl text-gray-900 mt-1">$500</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl text-gray-900 mt-1">$1.2K</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Overdue</p>
              <p className="text-2xl text-gray-900 mt-1">$750</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl text-gray-900">INVOICES</h2>
          </div>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
            + New Invoice
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <th className="px-6 py-4 text-left">INVOICE ID</th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>CLIENT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>AMOUNT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">STATUS</th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>ISSUE DATE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">DUE DATE</th>
                <th className="px-6 py-4 text-left">PAID DATE</th>
                <th className="px-6 py-4 text-left">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-gray-100 hover:bg-yellow-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-yellow-600">
                    {invoice.invoice_id?.slice(0, 4)}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{invoice.name}</td>
                  <td className="px-6 py-4 text-green-600">
                    {invoice.amount_c ?? "NOT PAID"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                        invoice.status_c
                      )}`}
                    >
                      {invoice.status_c}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {invoice.date_entered}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {invoice.due_date ?? "PENDING"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {invoice.payment_data ?? "PENDING"}
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No invoices yet. Create your first invoice to get started.
            </p>
          </div>
        )}
      </div>

      
    </>
  );
}
