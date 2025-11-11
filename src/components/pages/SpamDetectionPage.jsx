import { useState } from 'react';
import { Mail, Calendar, User, FileText, AlertTriangle, Shield } from 'lucide-react';
import { Footer } from '../Footer';
import { getSpamDetection } from '../../store/Slices/spamEmails';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { SpamDetailsPopup } from './SpamDetailsPopup';

export function SpamDetectionPage() {
  const dispatch = useDispatch();
  const [selectedEmail, setSelectedEmail] = useState(null);
  
  // Safe destructuring with default values
  const spamState = useSelector((state) => state.spamDetection) || {};
  const { count = 0, emails = [], loading = false, error = null } = spamState;
  
  const ladgerState = useSelector((state) => state.ladger) || {};
  const { email: userEmail } = ladgerState;
  
  useEffect(() => {
    if (userEmail) {
      dispatch(getSpamDetection("this_month", userEmail));
    }
  }, [userEmail, dispatch]);

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => console.log('Copied to clipboard:', text))
      .catch(err => console.error('Failed to copy:', err));
  };

  // Truncate text function
  const truncateText = (text, wordLimit = 8) => {
    if (!text) return "Suspicious content";
    const words = text.split(' ');
    const truncated = words.slice(0, wordLimit).join(' ');
    return words.length > wordLimit ? `${truncated}...` : truncated;
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

      {/* Spam Detection Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl text-gray-900">SPAM DETECTION</h2>
          </div>
          <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full">
            {count} Spam Detected
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-lg text-gray-600">Loading spam detection data...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-lg text-red-600">Error: {error}</div>
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Spam Emails Detected
              </h3>
              <p className="text-gray-500 max-w-md">
                Great! No spam emails detected in your inbox.
              </p>
            </div>
          ) : (
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
                  <th className="px-6 py-4 text-left">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{email.date_entered || "No date"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-900">
                        <span>{email.name || "Unknown sender"}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(email.name);
                            alert("Email Copied...")
                          }}
                          className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                          title="Copy to clipboard"
                        >
                          <span className="text-xs">📋</span>
                        </button>
                      </div>
                    </td>
                    <td 
                      className="px-6 py-4 text-gray-900 cursor-pointer hover:text-orange-600 transition-colors"
                      onClick={() => setSelectedEmail(email)}
                    >
                      {truncateText(email.description, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs">
                        {email.spam || "SPAM"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Spam Details Popup */}
      <SpamDetailsPopup 
        email={selectedEmail} 
        onClose={() => setSelectedEmail(null)} 
      />

      <Footer />
    </div>
  );
}