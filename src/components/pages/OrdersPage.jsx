import {
  Mail,
  ShoppingCart,
  Package,
  Pen,
  DollarSign,
  Calendar,
  User,
  ShieldCheck,
  ClipboardCheck,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import Pagination from "../Pagination";
import { getOrders, orderAction, updateOrder } from "../../store/Slices/orders";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import SearchComponent from "./SearchComponent";
import { toast } from "react-toastify";
import { excludeEmail, extractEmail } from "../../assets/assets";
import { PageContext } from "../../context/pageContext";
import { ladgerAction } from "../../store/Slices/ladger";
import TableLoading from "../TableLoading";

const getStatusColor = (status) => {
  switch (status) {
    // ✅ GREEN → Completed only
    case "Completed":
      return "bg-green-100 text-green-700";

    // ✅ RED → All rejected types
    case "Rejected":
    case "reject":
    case "rejected_nontechnical":
    case "rejected_technical":
    case "Cancelled":
      return "bg-red-100 text-red-700";

    case "In Progress":
      return "bg-blue-100 text-blue-700";

    case "Pending":
      return "bg-yellow-100 text-yellow-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

export function OrdersPage() {
  const [topsearch, setTopsearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [isExternalSearch, setIsExternalSearch] = useState(false);

  const { state } = useLocation();
  const { setSearch, setEnteredEmail } = useContext(PageContext);
  const [currentUpdateOrder, setCurrentUpdateOrder] = useState(null);
  const [actualOrder, setActualOrder] = useState([]);
  const { email } = useSelector((state) => state.ladger);
  const { orders, count, loading, error, message, updating, summary } =
    useSelector((state) => state.orders);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  
  const rejectedCount = orders.filter((order) =>
    order.order_status?.toLowerCase().trim().includes("reject")
  ).length;

  // Add state for filter values
  const [filters, setFilters] = useState({
    archive: "all",
    transactionType: "all",
    dateRange: "30",
    currency: "all",
    status: "all",
    minAmount: 0,
    maxAmount: 0,
  });

  // State for status dropdown
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  // Status options for dropdown
  const statusOptions = [
    { value: "all", label: "All Status" },
     { value: "new", label: "New" },
    { value: "duplicate", label: "Duplicate" },
    { value: "ai_failed", label: "AI Failed" },
    { value: "ai_passed", label: "AI Passed" },
    { value: "in_process", label: "In Process" },
    { value: "accepted", label: "Accepted" },
    { value: "completed", label: "Completed" },
    { value: "published", label: "Published" },
    { value: "blacklisted", label: "Blacklisted" },
    { value: "spam_score_high", label: "Spam Score High" },
    { value: "link_removed", label: "Link Removed" },
    { value: "rejected_nontechnical", label: "Rejected-NonTechnical" },
    { value: "previous_payment_due", label: "Previous Payment Due" },
    { value: "client_side_issue", label: "Client Side Issue" },
    { value: "reminder_sent", label: "Reminder Sent" },
    { value: "wrong", label: "Wrong" },
  ];

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setSelectedStatusFilter(e.target.value);
    // Update filters state as well
    setFilters(prev => ({ ...prev, status: e.target.value }));
  };

  // Debug: Log order statuses to see what we have
  useEffect(() => {
    if (orders.length > 0) {
      const uniqueStatuses = [
        ...new Set(orders.map((order) => order.order_status)),
      ];
    }
  }, [orders]);

  // Updated filteredOrders function with proper status matching
  const filteredorders = actualOrder
    .filter((item) => {
      const status = item.order_status?.toLowerCase().trim();
      // If email came from another page → show ONLY matching email
      if (isExternalSearch) return true;

      // Always show ONLY New & Pending
      if (!isExternalSearch && selectedCategory !== "search") {
        return status === "new" || status === "pending";
      }

      // Apply search filter first
      // SEARCH MODE → allow ALL records
      if (selectedCategory === "search") {
        const searchValue = topsearch.toLowerCase();

        if (!searchValue) return true;

        const contact =
          item.real_name?.split("<")[0]?.trim().toLowerCase() || "";
        const orderId = item.order_id?.toLowerCase() || "";

        return contact.includes(searchValue) || orderId.includes(searchValue);
      }
    })
    .filter((item) => {
      // Apply status filter from dropdown
      if (selectedStatusFilter && selectedStatusFilter !== "all") {
        const orderStatus = item.order_status?.toString().toLowerCase().trim() || "";
        const filterStatus = selectedStatusFilter.toLowerCase().trim();
        
        // Handle special cases
        if (filterStatus === "in_process") {
          return orderStatus.includes("in process") || 
                 orderStatus.includes("in progress") || 
                 orderStatus.includes("processing");
        }
        
        if (filterStatus === "rejected_nontechnical") {
          return orderStatus.includes("rejected") || 
                 orderStatus.includes("reject") || 
                 orderStatus.includes("nontechnical");
        }
        
        if (filterStatus === "ai_failed") {
          return orderStatus.includes("ai failed") || 
                 orderStatus.includes("ai_failed");
        }
        
        if (filterStatus === "ai_passed") {
          return orderStatus.includes("ai passed") || 
                 orderStatus.includes("ai_passed");
        }
        
        if (filterStatus === "spam_score_high") {
          return orderStatus.includes("spam") || 
                 orderStatus.includes("score high");
        }
        
        if (filterStatus === "previous_payment_due") {
          return orderStatus.includes("payment due") || 
                 orderStatus.includes("previous payment");
        }
        
        if (filterStatus === "client_side_issue") {
          return orderStatus.includes("client side") || 
                 orderStatus.includes("client issue");
        }
        
        if (filterStatus === "reminder_sent") {
          return orderStatus.includes("reminder") || 
                 orderStatus.includes("sent");
        }
        
        // For other statuses, do a simple includes check
        return orderStatus.includes(filterStatus);
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
        return (a.real_name?.split("<")[0]?.trim() || "").localeCompare(
          b.real_name?.split("<")[0]?.trim() || "",
        );
      }

      if (selectedSort === "desc") {
        return (b.real_name?.split("<")[0]?.trim() || "").localeCompare(
          a.real_name?.split("<")[0]?.trim() || "",
        );
      }

      if (selectedSort === "oldest") {
        return new Date(a.date_entered) - new Date(b.date_entered);
      }

      return 0;
    });

  const dropdownOptions = [
    { value: "contect", label: "Contact" },
    { value: "subject", label: "Order id" },
    { value: "search", label: "Search" },
  ];

  const handleSearchChange = (value) => {
    setTopsearch(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleDownload = () => {
    if (!filteredorders || filteredorders.length === 0) {
      toast.error("No data available to download");
      return;
    }

    const headers = [
      "DATE",
      "CONTACT",
      "AMOUNT",
      "STATUS",
      "DELIVERY DATE",
      "ORDER ID",
    ];
    const rows = filteredorders.map((order) => [
      order.date_entered,
      order.real_name?.split("<")[0]?.trim() || "",
      order.total_amount_c,
      order.order_status,
      order.complete_date,
      order.order_id,
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
  
  useEffect(() => {
    if (state?.email) {
      const specificOrder = orders.filter(
        (order) =>
          excludeEmail(order?.real_name).toLowerCase() ===
          state.email.toLowerCase(),
      );
      setActualOrder(specificOrder);
    } else {
      setActualOrder(orders);
    }
  }, [state?.email, orders]);

  return (
    <>
      {currentUpdateOrder && (
        <UpdatePopup
          open={!!currentUpdateOrder}
          title="Update Order"
          fields={[
            {
              name: "total_amount_c",
              label: "Order Amount",
              type: "number",
              value: currentUpdateOrder.total_amount_c,
            },
            {
              name: "website_c",
              label: "Website",
              type: "text",
              value: currentUpdateOrder.website_c,
            },
            {
              name: "client_email",
              label: "Client Email",
              type: "email",
              value: currentUpdateOrder.client_email,
            },
          ]}
          loading={updating}
          onUpdate={(data) => updateOrderHandler(currentUpdateOrder, data)}
          onClose={() => setCurrentUpdateOrder(null)}
        />
      )}

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          <SearchComponent
            dropdownOptions={dropdownOptions}
            onDropdownChange={handleCategoryChange}
            selectedDropdownValue={selectedCategory}
            onSearchChange={handleSearchChange}
            searchValue={topsearch}
            searchPlaceholder="Search here..."
            onFilterApply={() => {}}
            filterPlaceholder="Filters"
            showFilter={false}
            archiveOptions={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            transactionTypeOptions={[
              { value: "all", label: "All Emails" },
              { value: "incoming", label: "Incoming" },
              { value: "outgoing", label: "Outgoing" },
            ]}
            currencyOptions={[
              { value: "all", label: "All" },
              { value: "usd", label: "USD" },
              { value: "eur", label: "EUR" },
            ]}
            onDownloadClick={handleDownload}
            showDownload={true}
          />
        </div>
        
        {/* Status Dropdown Only - Inline with search */}
        <div className="flex items-center gap-3 shrink-0">
          {/* <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Status:</span> */}
          <select
            value={selectedStatusFilter}
            onChange={handleStatusFilterChange}
            className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-700 shadow-sm min-w-[180px] cursor-pointer hover:border-indigo-400 transition-colors"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
        <div className="flex gap-4">
          <span>Active Filter:</span>
          {selectedStatusFilter !== "all" && (
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
              Status: {statusOptions.find(opt => opt.value === selectedStatusFilter)?.label || selectedStatusFilter}
            </span>
          )}
          <span className="ml-auto">
            Showing {filteredorders.length} of {orders.length} orders
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
       
       {/* Rejected Orders */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Rejected Orders</p>
              <p className="text-2xl text-gray-900 mt-1 font-semibold">
                {rejectedCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-red-600" />
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
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Pending Orders – Clickable */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigateTo("/orders/view", { state: { email } })}
          className="
    bg-white rounded-xl p-4
    shadow-sm border-l-4 border-green-500
    cursor-pointer
    transition-all duration-200 
    hover:shadow-md hover:-translate-y-0.5
    hover:bg-green-50
    focus:outline-none focus:ring-2 focus:ring-green-400
  "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Orders</p>
              <p className="text-2xl text-gray-900 mt-1 font-semibold">
                {summary?.pending_orders ?? 0}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-green-700">✓</span>
              </div>

              {/* Subtle navigation hint */}
              <span className="text-gray-400 text-xl">→</span>
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
              <DollarSign className="w-6 h-6 text-purple-600" />
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
              <img
                width="30"
                height="30"
                src="https://img.icons8.com/offices/30/info.png"
                alt="info"
              />
            </a>
          </div>
          <div className="relative group">
            <span
              className="absolute left-1/2 -bottom-3 -translate-x-1/2 
                   bg-gray-800 text-white text-sm px-3 py-1 rounded-md 
                   opacity-0 group-hover:opacity-100 transition 
                   pointer-events-none whitespace-nowrap shadow-md"
            >
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
            {loading ? (
              <TableLoading cols={7} />
            ) : (
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
                        dispatch(ladgerAction.setTimeline(null));
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
                        dispatch(ladgerAction.setTimeline(null));
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
                          order.order_status,
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
                          onClick={() =>
                            navigateTo(`/orders/edit/${order.id}`, {
                              state: { email: excludeEmail(order.real_name), threadId: order?.thread_id },
                            })
                          }
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Update"
                        >
                          <Pen className="w-5 h-5 text-blue-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        <Pagination
          slice={"orders"}
          fn={(p) => dispatch(getOrders({ page: p }))}
        />

        {!loading && filteredorders.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No orders found matching your criteria.
          </div>
        )}
      </div>
    </>
  );
}