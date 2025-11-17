import { Cpu, CreditCard, FileCog, Globe, Users } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

export function SettingsPage() {
  const menuItems = [
    {
      title: "Machine Learning",
      subtitle: "Update ML settings",
      icon: <Cpu className="w-8 h-8 text-blue-600" />,
      bg: "bg-blue-50",
      link: "machine-learning",
    },
    {
      title: "PayPal Credentials",
      subtitle: "Manage payments",
      icon: <CreditCard className="w-8 h-8 text-green-600" />,
      bg: "bg-green-50",
      link: "paypal-credentials",
    },
    {
      title: "Templates",
      subtitle: "Manage templates",
      icon: <FileCog className="w-8 h-8 text-purple-600" />,
      bg: "bg-purple-50",
      link: "templates",
    },
    {
      title: "Websites",
      subtitle: "Manage websites",
      icon: <Globe className="w-8 h-8 text-blue-700" />,
      bg: "bg-blue-50",
      link: "websites",
    },
    {
      title: "Users",
      subtitle: "Manage users",
      icon: <Users className="w-8 h-8 text-yellow-600" />,
      bg: "bg-yellow-50",
      link: "users",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>

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
