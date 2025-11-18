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

export function TemlatesPage() {
  return (
    <div className="p-8">

      {/* Header + Button Row */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">PayPal Credentials Settings</h1>

        <Link
          to="/settings"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
         <Settings className="w-10 h-5 text-gray-300" />
        </Link>
      </div>

      <p className="text-gray-700 mb-6">
        Manage and configure PayPal API credentials used for processing payments.
        Ensure your client ID and secret key are updated and securely stored.
      </p>

      {/* Section 1 */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">PayPal Client Credentials</h2>
        <p className="text-gray-600">
          Update your PayPal <strong>Client ID</strong> and <strong>Secret Key</strong>.
          These keys allow your application to communicate with the PayPal server.
        </p>
      </div>

      {/* Section 2 */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">API Mode</h2>
        <p className="text-gray-600">
          Choose whether to use PayPal <strong>Sandbox Mode</strong> for testing or 
          <strong>Live Mode</strong> for real transactions.
        </p>
      </div>

      {/* Section 3 */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Webhook Settings</h2>
        <p className="text-gray-600">
          Configure webhook endpoints to receive real-time updates for payment status, 
          refunds, disputes, and subscription events.
        </p>
      </div>

      {/* Section 4 */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Security & Encryption</h2>
        <p className="text-gray-600">
          Ensure your credentials are encrypted and securely stored. Update encryption 
          keys and enable enhanced security for sensitive operations.
        </p>
      </div>

      {/* Section 5 */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-3">Transaction Logs</h2>
        <p className="text-gray-600">
          View and monitor recent PayPal transactions, check error logs, and confirm 
          successful payment operations.
        </p>
      </div>

    </div>
  );
}
