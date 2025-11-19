import {
  Mail,
  Link2,
  AlertTriangle,
  Calendar,
  User,
  ExternalLink,
} from "lucide-react";
import { useSelector } from "react-redux";

export function LinkRemovalPage() {
  const { linkRem: linkRemovals, count } = useSelector(
    (state) => state.linkRem
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Requests</p>
              <p className="text-2xl text-gray-900 mt-1">{count}</p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <Link2 className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl text-gray-900 mt-1">1</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">In Progress</p>
              <p className="text-2xl text-gray-900 mt-1">1</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl text-gray-900 mt-1">1</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Link Removal Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Link2 className="w-6 h-6 text-pink-600" />
            <h2 className="text-xl text-gray-900">LINK REMOVAL REQUESTS</h2>
          </div>
          <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
            + New Request
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
                <th className="px-6 py-4 text-left">WEBSITE</th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <span>LINK URL</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>CLIENT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>REQUEST DATE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">REASON</th>
                <th className="px-6 py-4 text-left">STATUS</th>
                <th className="px-6 py-4 text-left">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {linkRemovals.map((removal, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-pink-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-pink-600">{removal.website}</td>
                  <td className="px-6 py-4">
                    <a
                      href={removal.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span className="truncate max-w-[200px]">
                        {removal.linkUrl}
                      </span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{removal.client}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {removal.requestDate}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{removal.reason}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                        removal.status
                      )}`}
                    >
                      {removal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {linkRemovals.length === 0 && (
          <div className="p-12 text-center">
            <Link2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No link removal requests. All links are active!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
