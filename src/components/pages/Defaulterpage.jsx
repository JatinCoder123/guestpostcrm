import {
  Clock9Icon,
  Cpu,
  CreditCard,
  FileCog,
  Gamepad2,
  GamepadIcon,
  Globe,
  LucideMagnet,
  Phone,
  Settings2Icon,
  Users,
} from "lucide-react";
import { Link, Outlet } from "react-router-dom";

export function DefaulterPage() {
  const menuItems = [
    {
      title: "Defaulter Management content will show here",
      icon: <LucideMagnet className="w-8 h-8 text-blue-600" />,
      bg: "bg-blue-50"
     
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
