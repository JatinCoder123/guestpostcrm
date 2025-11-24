import { Mail, Bell, Handshake, Calendar, User, Clock } from "lucide-react";
import { useSelector } from "react-redux";
import { getDealRem } from "../../store/Slices/dealRem";

export function DealRemindersPage() {
  const { dealRem: reminders, count } = useSelector((state) => state.dealRem);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Reminders</p>
              <p className="text-2xl text-gray-900 mt-1">{count}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">High Priority</p>
              <p className="text-2xl text-gray-900 mt-1">1</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔴</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Due Today</p>
              <p className="text-2xl text-gray-900 mt-1">0</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Upcoming</p>
              <p className="text-2xl text-gray-900 mt-1">3</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Deal Reminders Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-cyan-600" />
            <h2 className="text-xl text-gray-900">DEAL REMINDERS</h2>
             <a href="">
         <img width="30" height="30" src="https://img.icons8.com/offices/30/info.png" alt="info"/>
         </a>
          </div>
          <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
            + New Reminder
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Handshake className="w-4 h-4" />
                    <span>RECIPIENT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>NAME</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>TIME</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">STATUS</th>
                <th className="px-6 py-4 text-left">DATE CREATED</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((reminder, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-cyan-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-cyan-600">
                    {reminder.recipient}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{reminder.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {reminder.scheduled_time}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{reminder.status}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {reminder.date_entered}
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                      Complete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reminders.length > 0 && (
          <Pagination slice={"dealRem"} fn={getDealRem} />
        )}
        {reminders.length === 0 && (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No reminders set. Create a reminder to stay on track!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
