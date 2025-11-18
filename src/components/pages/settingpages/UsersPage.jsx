import { Link } from "react-router-dom";
import Header from "./Header";

export function UsersPage() {
  return (
    <div className="p-8">
      {/* Header + Button Row */}
      <Header text={"User Manager"} />
      <p className="text-gray-700 mb-6">
        Manage and configure PayPal API credentials used for processing
        payments. Ensure your client ID and secret key are updated and securely
        stored.
      </p>
      {/* Section 1 */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">
          PayPal Client Credentials
        </h2>
        <p className="text-gray-600">
          Update your PayPal <strong>Client ID</strong> and{" "}
          <strong>Secret Key</strong>. These keys allow your application to
          communicate with the PayPal server.
        </p>
      </div>
      {/* Section 2 */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">API Mode</h2>
        <p className="text-gray-600">
          Choose whether to use PayPal <strong>Sandbox Mode</strong> for testing
          or
          <strong>Live Mode</strong> for real transactions.
        </p>
      </div>
      {/* Section 3 */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Webhook Settings</h2>
        <p className="text-gray-600">
          Configure webhook endpoints to receive real-time updates for payment
          status, refunds, disputes, and subscription events.
        </p>
      </div>
      {/* Section 4 */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Security & Encryption</h2>
        <p className="text-gray-600">
          Ensure your credentials are encrypted and securely stored. Update
          encryption keys and enable enhanced security for sensitive operations.
        </p>
      </div>
      {/* Section 5 */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-3">Transaction Logs</h2>
        <p className="text-gray-600">
          View and monitor recent PayPal transactions, check error logs, and
          confirm successful payment operations.
        </p>
      </div>
    </div>
  );
}
