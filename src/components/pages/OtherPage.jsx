import {
  Clock9Icon,
  Cpu,
  CreditCard,
  FileCog,
  Gamepad2,
  GamepadIcon,
  Globe,
  Inbox,
  Layers,
  LucideForkKnifeCrossed,
  MessageCircle,
  Move,
  Option,
  Phone,
  Settings,
  Settings2Icon,
  Shield,
  TruckIcon,
  Users,
} from "lucide-react";
import { Link, Outlet } from "react-router-dom";

export function OtherPage() {
  const menuItems = [
    {
      title: "Moved Emails",
      subtitle: "inside it Inbox-2 and Spam-2 will be shown",
      icon: <Inbox className="w-8 h-8 text-blue-600" />,
      bg: "bg-blue-50",
      link: "/moved-emails",
    },

    {
      title: "All BackLinks",
      subtitle: "All BackLinks content shown here",
      icon: <Option className="w-8 h-8 text-green-600" />,
      bg: "bg-green-50",
      link: "paypal-credentials",
    },
    {
      title: "Defaulter",
      subtitle: "All the defaulters are Listed here",
      icon: <Settings className="w-8 h-8 text-green-600" />,
      bg: "bg-green-50",
      link: "/default-report",
    },
    {
      title: "Bulk Marking",
      subtitle: "All the Bulk Marking are Listed here",
      icon: <Layers className="w-8 h-8 text-green-600" />,
      bg: "bg-green-50",
      link: "/mark-bulk",
    },
    {
      title: "Report",
      subtitle: "Report will be shown here",
      icon: <MessageCircle className="w-8 h-8 text-green-600" />,
      bg: "bg-green-50",
      link: "/all-report",
    },
     {
      title: "Spam Detection",
      subtitle: "Spam Emails will be shown here",
      icon: <Shield className="w-8 h-8 text-green-600" />,
      bg: "bg-green-50",
      link: "/spam-detection",
    }

  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Others</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
          <Link
            to={item.link}
            key={index}
            className={`${item.bg} p-6 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition block`}
          >
            <div>{item.icon}</div>

            <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{item.subtitle}</p>
          </Link>
        ))}
      </div>

      {/* Child pages will load here */}
      <div className="mt-10">
        <Outlet />
      </div>
    </div>
  );
}
