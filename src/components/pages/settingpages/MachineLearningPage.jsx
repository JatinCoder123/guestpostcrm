import { Link } from "react-router-dom";
import {
  Mail,
  Shield,
  MessageSquare,
  Handshake,
  Gift,
  ShoppingCart,
  FileText,
  CreditCard,
  Link2,
  Bell,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Settings,   // 👈 THIS is the settings icon
  Cpu,
  Radio,
  Globe,
  User,
} from "lucide-react";

export function MachineLearningPage() {
  return (
    <div className="p-8">

      {/* Header + Button Row */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Machine Learning Settings</h1>

        <Link
          to="/settings"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Settings className="w-10 h-5 text-gray-300" />
        </Link>
      </div>

      <p className="text-gray-700 mb-6">
        Manage and configure machine learning modules used across the platform.
        These settings allow you to improve prediction accuracy, update model
        behavior, optimize performance, and track training results.
      </p>

      {/* Section 1 */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Model Configuration</h2>
        <p className="text-gray-600">
          Update machine learning model parameters such as learning rate,
          training intervals, dataset sources, and optimization settings.
        </p>
      </div>

      {/* Section 2 */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Data Source Settings</h2>
        <p className="text-gray-600">
          Manage data sources that the ML model uses for training. You can update
          API connections, enable data filters, and set preprocessing rules.
        </p>
      </div>

      {/* Section 3 */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Training Controls</h2>
        <p className="text-gray-600">
          Start or schedule model training, monitor training progress, and view
          historical training logs and performance metrics.
        </p>
      </div>

      {/* Section 4 */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Model Performance</h2>
        <p className="text-gray-600">
          Track accuracy, precision, recall, and other key performance indicators
          to evaluate the effectiveness of the current model.
        </p>
      </div>

      {/* Section 5 */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-3">Automation Settings</h2>
        <p className="text-gray-600">
          Enable or disable automated learning tasks like scheduled retraining,
          auto-optimization, and real-time prediction adjustments.
        </p>
      </div>
    </div>
  );
}
