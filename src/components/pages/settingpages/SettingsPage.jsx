import {
  Bot,
  Bug,
  Cable,
  ChartBarStackedIcon,
  Cpu,
  CreditCard,
  Database,
  FileCog,
  GamepadIcon,
  Globe,
  Joystick,
  Phone,
  Recycle,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import Header from "./Header"

export function SettingsPage() {
  const menuItems = [
    {
      title: "Machine Learning Management",
      subtitle: "Update ML settings",
      icon: <Cpu className="w-8 h-8 text-blue-600" />,
      bg: "bg-blue-50",
      link: "machine-learning",
    },
    {
      title: "API Credentials Management",
      subtitle: "Manage payments",
      icon: <CreditCard className="w-8 h-8 text-green-600" />,
      bg: "bg-green-50",
      link: "paypal-credentials",
    },
    {
      title: "Templates Management",
      subtitle: "Manage templates",
      icon: <FileCog className="w-8 h-8 text-purple-600" />,
      bg: "bg-purple-50",
      link: "templates",
    },
    {
      title: "Websites Management",
      subtitle: "Manage websites",
      icon: <Globe className="w-8 h-8 text-blue-700" />,
      bg: "bg-blue-50",
      link: "websites",
    },
    {
      title: "Users Management",
      subtitle: "Manage users",
      icon: <Users className="w-8 h-8 text-yellow-600" />,
      bg: "bg-yellow-50",
      link: "users",
    },
    {
      title: "Button Management",
      subtitle: "Button management",
      icon: <GamepadIcon className="w-8 h-8 text-pink-600" />,
      bg: "bg-pink-50",
      link: "buttons",
    },
    {
      title: "Twillio Management",
      subtitle: "Twillio management",
      icon: <Phone className="w-8 h-8 text-pink-600" />,
      bg: "bg-pink-50",
      link: "users",
    },
    {
      title: "Control Automations",
      subtitle: "Contorl entire GPC",
      icon: <Joystick className="w-8 h-8 text-pink-600" />,
      bg: "bg-pink-50",
      link: "controller",
    },
    {
      title: "QA PlayGround",
      subtitle: "See Error Logs ",
      icon: <Bug className="w-8 h-8 text-red-600" />,
      bg: "bg-red-50",
      link: "debugging",
    },
    {
      title: "Data Modelling",
      subtitle: "Manage Data",
      icon: <Database className="w-8 h-8 text-green-600" />,
      bg: "bg-green-50",
      link: "data-modelling",
    },
    {
      title: "Prompt Management",
      subtitle: "Test prompts",
      icon: <ChartBarStackedIcon className="w-8 h-8 text-blue-600" />,
      bg: "bg-blue-50",
      link: "prompt-testing",
    },
    {
      title: "User Activities",
      subtitle: "Manage User Activity",
      icon: <User className="w-8 h-8 text-teal-600" />,
      bg: "bg-teal-50",
      link: "user-activity",
    },
    {
      title: "Recycle Bin",
      subtitle: "Manage Recycle Bin",
      icon: <Recycle className="w-8 h-8 text-red-600" />,
      bg: "bg-red-50",
      link: "recycle",
    },
    {
      title: "Backlinks",
      subtitle: "Manage Backlinks",
      icon: <Cable className="w-8 h-8 text-red-600" />,
      bg: "bg-red-50",
      link: "backlinks",
    },
    {
      title: "Payments",
      subtitle: "Manage Payments",
      icon: <Wallet className="w-8 h-8 text-blue-600" />,
      bg: "bg-blue-50",
      link: "billing",
    }
  ];

  return (
    <div className="p-3 sm:p-6">
      <Header text={"Settings"} />

      {/* Intermediate steps so tablets don't jump straight from 1 to 4 columns */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
        {menuItems.map((item, index) => (
          <Link
            to={item.link}
            key={index}
            className={`bg-gray-200/60 p-4 sm:p-6 rounded-2xl shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition block min-w-0`}
          >
            <div>{item.icon}</div>

            <h3 className="mt-3 sm:mt-4 text-base sm:text-xl font-semibold">{item.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{item.subtitle}</p>
          </Link>
        ))}
      </div>

      {/* Child pages will load here */}
      <div className="mt-6 sm:mt-10">
        <Outlet />
      </div>
    </div>
  );
}
