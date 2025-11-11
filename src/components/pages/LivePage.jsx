import { Mail } from "lucide-react";
import { Footer } from "../Footer";

export function LivePage() {
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

      {/* Live Content */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl text-gray-900">Live Activity</h2>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            Real-time Monitoring
          </span>
        </div>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-xl p-4 hover:border-green-500 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">New Email Received</span>
              <span className="text-gray-400 text-xs">Just now</span>
            </div>
            <p className="text-gray-900">From: marketing@example.com</p>
            <p className="text-gray-600 text-sm mt-1">
              Subject: Guest post opportunity for tech blog
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 hover:border-green-500 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">New Email Received</span>
              <span className="text-gray-400 text-xs">2 minutes ago</span>
            </div>
            <p className="text-gray-900">From: content@digitalagency.com</p>
            <p className="text-gray-600 text-sm mt-1">
              Subject: Collaboration proposal
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 hover:border-green-500 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Deal Updated</span>
              <span className="text-gray-400 text-xs">5 minutes ago</span>
            </div>
            <p className="text-gray-900">
              Partnership with TechBlog moved to negotiation
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
