import { Mail, Calendar, User, FileText } from "lucide-react";
import { Footer } from "../Footer";
import { getUnrepliedEmail } from "../../store/Slices/unrepliedEmails";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

export function UnrepliedEmailsPage() {
  const emails = [
    {
      date: "Today at 07:58 AM",
      sender: "kartikey@outrightlysystems.org",
      subject: "i want guestpost insertion",
      mailerSummary: "-",
    },
    {
      date: "Today at 06:45 AM",
      sender: "john.doe@example.com",
      subject: "Guest post opportunity for tech blog",
      mailerSummary: "-",
    },
    {
      date: "Yesterday at 11:30 PM",
      sender: "sarah.marketing@webagency.com",
      subject: "Partnership proposal - Guest posting",
      mailerSummary: "-",
    },
    {
      date: "Yesterday at 09:15 PM",
      sender: "alex.content@digitalmarketing.io",
      subject: "Interested in guest post collaboration",
      mailerSummary: "-",
    },
    {
      date: "Yesterday at 05:20 PM",
      sender: "michael.seo@seoexperts.com",
      subject: "Link building and guest post inquiry",
      mailerSummary: "-",
    },
    {
      date: "2 days ago at 03:45 PM",
      sender: "emma.blogger@contentcreators.net",
      subject: "Guest blogging opportunity",
      mailerSummary: "-",
    },
    {
      date: "2 days ago at 01:20 PM",
      sender: "david.outreach@linkbuilding.co",
      subject: "Premium guest post placement",
      mailerSummary: "-",
    },
    {
      date: "2 days ago at 11:00 AM",
      sender: "lisa.marketing@digitalboost.com",
      subject: "Quick question about guest posting",
      mailerSummary: "-",
    },
    {
      date: "3 days ago at 04:30 PM",
      sender: "robert.seo@rankingpro.com",
      subject: "Backlink exchange proposal",
      mailerSummary: "-",
    },
    {
      date: "3 days ago at 02:15 PM",
      sender: "jennifer.content@blognetwork.io",
      subject: "Guest post package inquiry",
      mailerSummary: "-",
    },
  ];
  const dispatch = useDispatch();
  const { count } = useSelector((state) => state.unreplied);
  const { email } = useSelector((state) => state.ladger);
  useEffect(() => {
    if (email) {
      dispatch(getUnrepliedEmail());
    }
  }, [email]);
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

      {/* Unreplied Emails Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl text-gray-900">UNREPLIED EMAILS</h2>
          </div>
          <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full">
            {count} Unreplied
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
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
                    <span>SUBJECT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">MAILER SUMMARY</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{email.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{email.sender}</td>
                  <td className="px-6 py-4 text-purple-600">{email.subject}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {email.mailerSummary}
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
