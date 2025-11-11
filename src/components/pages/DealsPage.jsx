import { Mail, Handshake, TrendingUp, DollarSign, Calendar, User } from 'lucide-react';
import { Footer } from '../Footer';

export function DealsPage() {
  const deals = [
    {
      dealName: 'TechBlog Partnership',
      company: 'TechBlog Inc.',
      value: '$5,000',
      stage: 'Negotiation',
      closeDate: '15 Nov 2025',
      probability: '75%',
      status: 'active'
    },
    {
      dealName: 'Content Marketing Deal',
      company: 'Digital Agency',
      value: '$3,500',
      stage: 'Proposal',
      closeDate: '20 Nov 2025',
      probability: '60%',
      status: 'active'
    },
    {
      dealName: 'Guest Post Package',
      company: 'SEO Company',
      value: '$2,000',
      stage: 'Qualification',
      closeDate: '25 Nov 2025',
      probability: '40%',
      status: 'active'
    },
  ];

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
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Deals</p>
              <p className="text-2xl text-gray-900 mt-1">3</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Handshake className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Value</p>
              <p className="text-2xl text-gray-900 mt-1">$10.5K</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Win Rate</p>
              <p className="text-2xl text-gray-900 mt-1">58%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg. Deal Size</p>
              <p className="text-2xl text-gray-900 mt-1">$3.5K</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Deals Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Handshake className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl text-gray-900">DEALS</h2>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + New Deal
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <th className="px-6 py-4 text-left">DEAL NAME</th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>COMPANY</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>VALUE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">STAGE</th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>CLOSE DATE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">PROBABILITY</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal, index) => (
                <tr 
                  key={index} 
                  className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-blue-600">{deal.dealName}</td>
                  <td className="px-6 py-4 text-gray-900">{deal.company}</td>
                  <td className="px-6 py-4 text-green-600">{deal.value}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {deal.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{deal.closeDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: deal.probability }}
                        ></div>
                      </div>
                      <span className="text-gray-600 text-sm">{deal.probability}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {deals.length === 0 && (
          <div className="p-12 text-center">
            <Handshake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No deals yet. Create your first deal to get started.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
