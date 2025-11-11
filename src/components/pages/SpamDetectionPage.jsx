import { Mail, Calendar, User, FileText, AlertTriangle } from 'lucide-react';
import { Footer } from '../Footer';

export function SpamDetectionPage() {
  const spamEmails = [
    {
      date: '05 Nov 25 at 12:40 PM',
      sender: 'kartikey@outrightlysystems.org',
      spamReason: 'test mfgnsf',
      spam: 'SPAM'
    },
    {
      date: '05 Nov 25 at 12:29 PM',
      sender: 'kartikey@outrightlysystems.org',
      spamReason: 'test kfakas',
      spam: 'SPAM'
    },
    {
      date: '05 Nov 25 at 11:01 AM',
      sender: 'kartikey@outrightlysystems.org',
      spamReason: 'test kfakas',
      spam: 'SPAM'
    },
    {
      date: '05 Nov 25 at 05:48 PM',
      sender: 'anshik@outrightlysystems.org',
      spamReason: 'test 1',
      spam: 'SPAM'
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

      {/* Spam Detection Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl text-gray-900">SPAM DETECTION</h2>
          </div>
          <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full">
            4 Spam Detected
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>DATE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>SENDER</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>SPAM REASON</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">Spam</th>
              </tr>
            </thead>
            <tbody>
              {spamEmails.map((email, index) => (
                <tr 
                  key={index} 
                  className="border-b border-gray-100 hover:bg-orange-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{email.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-900">
                      <span>{email.sender}</span>
                      <button className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <span className="text-xs">📋</span>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{email.spamReason}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs">
                      {email.spam}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  );
}
