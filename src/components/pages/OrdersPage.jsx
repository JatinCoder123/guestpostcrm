import {
  Mail,
  ShoppingCart,
  Package,
  Pen,
  DollarSign,
  Calendar,
  User,
  ShieldCheck,
  ClipboardCheck
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import Pagination from "../Pagination";
import { getOrders, orderAction, updateOrder } from "../../store/Slices/orders";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import SearchComponent from "./SearchComponent";
import { toast } from "react-toastify";
import { excludeEmail, extractEmail } from "../../assets/assets";
import { PageContext } from "../../context/pageContext";
import { ladgerAction } from "../../store/Slices/ladger";
import TableLoading from "../TableLoading";

export function OrdersPage() {
  const [topsearch, setTopsearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('');
  const { setSearch, setEnteredEmail } = useContext(PageContext);
  const [currentUpdateOrder, setCurrentUpdateOrder] = useState(null)
  const { orders, count, loading, error, message, updating,summary } = useSelector(
    (state) => state.orders
  );
  const navigateTo = useNavigate()
  const dispatch = useDispatch()

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Add state for filter values
  const [filters, setFilters] = useState({
    archive: 'all',
    transactionType: 'all',
    dateRange: '30',
    currency: 'all',
    status: 'all',
    minAmount: 0,
    maxAmount: 0,
  });

  // Handle filter application
  const handleFilterApply = (appliedFilters) => {
    setFilters(appliedFilters);
  };

  // Debug: Log order statuses to see what we have
  useEffect(() => {
    if (orders.length > 0) {
      const uniqueStatuses = [...new Set(orders.map(order => order.order_status))];
    }
  }, [orders]);

  // Updated filteredOrders function with proper status matching
  const filteredorders = orders
    .filter((item) => {
      // Apply search filter first
      const searchValue = topsearch.toLowerCase();
      if (searchValue) {
        const contact = item.real_name?.split("<")[0]?.trim().toLowerCase() || "";
        const orderId = item.order_id?.toLowerCase() || "";
        const date = item.date_entered?.toLowerCase() || "";

        // If category selected
        if (selectedCategory === "contect" || selectedCategory === "contact") {
          return contact.includes(searchValue);
        }
        if (selectedCategory === "subject") {
          return orderId.includes(searchValue);
        }

        // Default search: search in both contact and order ID
        return contact.includes(searchValue) || orderId.includes(searchValue);
      }
      return true; // No search value → show all
    })
    .filter((item) => {
      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        // Check if the order_status matches the selected filter
        // Handle case-insensitive matching and partial matches
        const orderStatus = item.order_status?.toString().toLowerCase().trim() || "";
        const filterStatus = filters.status.toLowerCase().trim();

        // Try exact match first
        if (orderStatus === filterStatus) {
          return true;
        }

        // Try partial match (e.g., "In process" vs "In Process")
        if (orderStatus.includes(filterStatus) || filterStatus.includes(orderStatus)) {
          return true;
        }

        // Try to match common variations
        const statusVariations = {
          'new': ['new', 'pending', 'received'],
          'in process': ['in process', 'in progress', 'processing', 'in-progress'],
          'completed': ['completed', 'finished', 'done', 'delivered'],
          'accepted': ['accepted', 'approved', 'confirmed'],
          'duplicate': ['duplicate', 'copied'],
        };

        // Check if any variation matches
        if (statusVariations[filterStatus]) {
          return statusVariations[filterStatus].some(variation =>
            orderStatus.includes(variation)
          );
        }

        return false;
      }
      return true;
    })
    .filter((item) => {
      // Apply amount range filter
      if (filters.minAmount > 0 || filters.maxAmount > 0) {
        const amount = parseFloat(item.total_amount_c) || 0;
        const minAmount = filters.minAmount || 0;
        const maxAmount = filters.maxAmount || Infinity;

        return amount >= minAmount && amount <= maxAmount;
      }
      return true;
    })
    .sort((a, b) => {
      if (!selectedSort) return 0;

      if (selectedSort === "asc") {
        return (a.real_name?.split("<")[0]?.trim() || "").localeCompare(b.real_name?.split("<")[0]?.trim() || "");
      }

      if (selectedSort === "desc") {
        return (b.real_name?.split("<")[0]?.trim() || "").localeCompare(a.real_name?.split("<")[0]?.trim() || "");
      }

      if (selectedSort === "oldest") {
        return new Date(a.date_entered) - new Date(b.date_entered);
      }

      return 0;
    });

  const dropdownOptions = [
    { value: 'contect', label: 'Contact' },
    { value: 'subject', label: 'Order id' },
  ];

  const handleSearchChange = (value) => {
    setTopsearch(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  // Function to handle status filter change (if you want to add it separately)
  const handleStatusChange = (status) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleDownload = () => {
    if (!filteredorders || filteredorders.length === 0) {
      toast.error("No data available to download");
      return;
    }

    const headers = ["DATE", "CONTACT", "AMOUNT", "STATUS", "DELIVERY DATE", "ORDER ID"];
    const rows = filteredorders.map((order) => [
      order.date_entered,
      order.real_name?.split("<")[0]?.trim() || "",
      order.total_amount_c,
      order.order_status,
      order.complete_date,
      order.order_id
    ]);

    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.map((val) => `"${val}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
  };

  return (
    <>
      {currentUpdateOrder && (
        <UpdatePopup
          open={!!currentUpdateOrder}
          title="Update Order"
          fields={[
            { name: "total_amount_c", label: "Order Amount", type: "number", value: currentUpdateOrder.total_amount_c },
            { name: "website_c", label: "Website", type: "text", value: currentUpdateOrder.website_c },
            { name: "client_email", label: "Client Email", type: "email", value: currentUpdateOrder.client_email },
          ]}
          loading={updating}
          onUpdate={(data) => updateOrderHandler(currentUpdateOrder, data)}
          onClose={() => setCurrentUpdateOrder(null)}
        />
      )}

      <SearchComponent
        dropdownOptions={dropdownOptions}
        onDropdownChange={handleCategoryChange}
        selectedDropdownValue={selectedCategory}
        onSearchChange={handleSearchChange}
        searchValue={topsearch}
        searchPlaceholder="Search here..."
        onFilterApply={handleFilterApply}
        filterPlaceholder="Filters"
        showFilter={true}
        archiveOptions={[
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]}
        transactionTypeOptions={[
          { value: 'all', label: 'All Emails' },
          { value: 'incoming', label: 'Incoming' },
          { value: 'outgoing', label: 'Outgoing' },
        ]}
        currencyOptions={[
          { value: 'all', label: 'All' },
          { value: 'usd', label: 'USD' },
          { value: 'eur', label: 'EUR' },
        ]}
        onDownloadClick={handleDownload}
        showDownload={true}
        className="mb-6"
      />

      {/* Debug Info - Remove in production */}
      <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
        <div className="flex gap-4">
          <span>Active Filters:</span>
          {filters.status !== 'all' && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Status: {filters.status}
            </span>
          )}
          {(filters.minAmount > 0 || filters.maxAmount > 0) && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              Amount: ${filters.minAmount} - ${filters.maxAmount || '∞'}
            </span>
          )}
          <span className="ml-auto">
            Showing {filteredorders.length} of {orders.length} orders
          </span>
        </div>
      </div>

      {/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

  {/* Pending / Under Verification */}
  <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-indigo-500">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">Under Verification</p>
        <p className="text-2xl text-gray-900 mt-1 font-semibold">
          {summary?.under_verification_orders ?? 0}
        </p>
      </div>
      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
        <ShieldCheck className="w-6 h-6 text-yellow-600" />
      </div>
    </div>   
  </div>

  {/* New Orders */}
  <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">New Orders</p>
        <p className="text-2xl text-gray-900 mt-1 font-semibold">
          {summary?.new_orders ?? 0}
        </p>
      </div>
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
        <ShoppingCart className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  </div>

  {/* Accepted Orders */}
  <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">Accepted Orders</p>
        <p className="text-2xl text-gray-900 mt-1 font-semibold">
          {summary?.accepted_orders ?? 0}
        </p>
      </div>
      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
        <span className="text-2xl text-green-700">✓</span>
      </div>
    </div>
  </div>

  {/* Completed Orders */}
  <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">Completed Orders</p>
        <p className="text-2xl text-gray-900 mt-1 font-semibold">
          {summary?.completed_orders ?? 0}
        </p>
      </div>
      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
        <ClipboardCheck className="w-6 h-6 text-purple-600" />
      </div>
    </div>
  </div>


</div>

      {/* Orders Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">ORDERS</h2>
            <a href="">
              <img width="30" height="30" src="https://img.icons8.com/offices/30/info.png" alt="info" />
            </a>
          </div>
          <div className="relative group">
            <span className="absolute left-1/2 -bottom-3 -translate-x-1/2 
                   bg-gray-800 text-white text-sm px-3 py-1 rounded-md 
                   opacity-0 group-hover:opacity-100 transition 
                   pointer-events-none whitespace-nowrap shadow-md">
              Create Order
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>DATE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>CONTACT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>AMOUNT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">STATUS</th>
                <th className="px-6 py-4 text-left">DELIVERY DATE</th>
                <th className="px-6 py-4 text-left">ORDER ID</th>
                <th className="px-6 py-4 text-left">ACTION</th>
              </tr>
            </thead>
            {loading ? <TableLoading cols={7} /> : (
              <tbody>
                {filteredorders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 hover:bg-indigo-50 transition-colors cursor-pointer"
                  >
                    <td
                      className="px-6 py-4 text-gray-600 cursor-pointer"
                      onClick={() => {
                        const input = extractEmail(order.real_name);
                        localStorage.setItem("email", input);
                        setSearch(input);
                        setEnteredEmail(input);
                        dispatch(ladgerAction.setTimeline(null))
                        navigateTo("/");
                      }}
                    >
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{order.date_entered}</span>
                      </div>
                    </td>
                    <td
                      onClick={() => {
                        const input = extractEmail(order.real_name);
                        localStorage.setItem("email", input);
                        setSearch(input);
                        setEnteredEmail(input);
                        dispatch(ladgerAction.setTimeline(null))
                        navigateTo("/contacts");
                      }}
                      className="px-6 py-4 text-gray-900 cursor-pointer"
                    >
                      {order.real_name?.split("<")[0]?.trim() || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-green-600">
                      ${order.total_amount_c || "0.00"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                          order.order_status
                        )}`}
                      >
                        {order.order_status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.complete_date || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.order_id || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigateTo(`/orders/edit/${order.id}`, { state: { email: excludeEmail(order.real_name) } })}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Update"
                        >
                          <Pen className="w-5 h-5 text-blue-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>)}
          </table>
        </div>

        <Pagination slice={"orders"} fn={getOrders} />

        {!loading && filteredorders.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No orders found matching your criteria.
          </div>
        )}
      </div>
    </>
  );
}