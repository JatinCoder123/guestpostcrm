import {
  Mail,
  Handshake,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";

export function Marketplace() {
  return (
    <div className="p-6 space-y-8">

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Marketplace</h1>
        <p className="text-gray-500 mt-1">Find deals, connect, and grow your network.</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-gray-500">Total Deals</p>
            <h2 className="text-2xl font-bold">124</h2>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition">
          <div className="bg-green-100 text-green-600 p-3 rounded-lg">
            <Handshake size={28} />
          </div>
          <div>
            <p className="text-gray-500">Active Partners</p>
            <h2 className="text-2xl font-bold">58</h2>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition">
          <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-gray-500">Monthly Revenue</p>
            <h2 className="text-2xl font-bold">$12,400</h2>
          </div>
        </div>
      </div>

      {/* Deals List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Featured Deals
        </h2>

        <div className="space-y-4">
          {/* Deal Item */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border p-4 rounded-lg flex justify-between items-center hover:shadow-md transition"
            >
              <div>
                <h3 className="font-semibold text-lg">Deal #{i}</h3>
                <p className="text-gray-500 text-sm">A great business opportunity.</p>
              </div>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                View
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
