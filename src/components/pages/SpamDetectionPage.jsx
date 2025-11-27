import {
  Mail,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  BarChart,
  Shield,
} from "lucide-react";

import { useSelector } from "react-redux";
import Pagination from "../Pagination";
import { getDetection } from "../../store/Slices/detection";

export function SpamDetectionPage() {
  const { detection, count } = useSelector((state) => state.detection);
  return (
    <>
      {/* Spam Detection Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl text-gray-900">SPAM DETECTION</h2>
             <a href="https://www.guestpostcrm.com/blog/guestpostcrm-moves-certain-spam-emails-back-to-inbox/"  target="_blank" 
  rel="noopener noreferrer">
         <img width="30" height="30" src="https://img.icons8.com/offices/30/info.png" alt="info"/>
         </a>
          </div>
          <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full">
            {count} Spam Detected
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
                    <span>SENDER NAME</span>
                  </div>
                </th>

                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>SPAM REASON</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <BarChart className="w-4 h-4" />
                    <span>THREAD SIZE</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {detection.map((spam) => (
                <tr
                  key={spam.thread_id}
                  className="border-b border-gray-100 hover:bg-orange-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{spam.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-900">
                      <span>{spam.from}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{spam.subject}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-900">
                      <span>{spam.thread_count}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {detection?.length > 0 && (
          <Pagination slice={"detection"} fn={getDetection} />
        )}
        {detection.length === 0 && (
          <div className="p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No Credits yet.</p>
          </div>
        )}
      </div>
    </>
  );
}
