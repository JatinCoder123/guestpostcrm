import {
  Mail,
  ShoppingCart,
  Package,
  Pen,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Pagination from "../Pagination";
import { getOrders } from "../../store/Slices/orders";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SearchComponent from "./SearchComponent";

export function OrdersPage() {
  const [topsearch, setTopsearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); 
  const [selectedSort, setSelectedSort] = useState('');
  const { orders, count, loading, error } = useSelector(
    (state) => state.orders
  );
  const navigateTo = useNavigate()
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





  
  const filteredorders =orders
    .filter((item) => {
      const searchValue = topsearch.toLowerCase();
      if (!searchValue) return true; // no search → show all

      const contact = item.real_name.split("<")[0].trim().toLowerCase();
      const subject = item.order_id?.toLowerCase() || "";
      const date = item.date_entered?.toLowerCase() || "";

      // 🟢 If category selected
      if (selectedCategory === "contect" || selectedCategory === "contact") {
        return contact.includes(searchValue);
      }
      if (selectedCategory === "subject") {
        return subject.includes(searchValue);
      }
      // if (selectedCategory === "date") {
      //   return date.includes(searchValue);
      // }

      // 🟢 Default search → CONTACT
      return contact.includes(searchValue);
    })
    .sort((a, b) => {
      if (!selectedSort) return 0;

      if (selectedSort === "asc") {
        return a.from.localeCompare(b.from);
      }

      if (selectedSort === "desc") {
        return b.from.localeCompare(a.from);
      }

      // if (selectedSort === "newest") {
      //   return new Date(b.date_entered) - new Date(a.date_entered);
      // }

      if (selectedSort === "oldest") {
        return new Date(a.date_entered) - new Date(b.date_entered);
      }

      return 0;
    });



  const dropdownOptions = [
    { value: 'contect', label: 'contact' },
    { value: 'subject', label: 'order id' },
  ];

  const filterOptions = [
    { value: 'asc', label: 'A to Z' },
    { value: 'desc', label: 'Z to A' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
   
  ];

  const handleFilterApply = (filters) => {
    console.log('Applied filters from popup:', filters);
  };

  const handleSearchChange = (value) => {
    setTopsearch(value);
    console.log('Searching for:', value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    console.log('Category selected:', value);
  };

  const handleSortChange = (value) => {
    setSelectedSort(value); 
    console.log('Sort selected:', value);
  };

 
   const handleDownload = () => {
  if (!filteredorders || filteredorders.length === 0) {
   toast.error("No data available to download");
   return;
 }
 
   // Convert Objects → CSV rows
   const headers = ["DATE", "CONTACT", "AMOUNT", "STATUS", "DELIVERY DATE", "ORDER ID"];
   
   const rows = filteredorders.map((email) => [
     email.date_entered,
     email.real_name.split("<")[0].trim(),
     email.total_amount_c,
     email.order_status,
     email.complete_date,
     email.order_id
     
   ]);
 
   // Convert to CSV string
   const csvContent =
     headers.join(",") +
     "\n" +
     rows.map((r) => r.map((val) => `"${val}"`).join(",")).join("\n");
 
   // Create and auto-download file
   const blob = new Blob([csvContent], { type: "text/csv" });
   const url = URL.createObjectURL(blob);
 
   const a = document.createElement("a");
   a.href = url;
   a.download = "unreplied-emails.csv";
   a.click();
 };
 

  return (
    <>


      <SearchComponent
      
      dropdownOptions={dropdownOptions}
      onDropdownChange={handleCategoryChange} 
      selectedDropdownValue={selectedCategory} 
      dropdownPlaceholder="Filter by contact"
      
      
      onSearchChange={handleSearchChange}
      searchValue={topsearch}
      searchPlaceholder="Search emails..."
      
      
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


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl text-gray-900 mt-1">{count}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">In Progress</p>
              <p className="text-2xl text-gray-900 mt-1">1</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl text-gray-900 mt-1">1</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Revenue</p>
              <p className="text-2xl text-gray-900 mt-1">$2.4K</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}

        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">ORDERS</h2>
            <a href="">
              <img width="30" height="30" src="https://img.icons8.com/offices/30/info.png" alt="info" />
            </a>
          </div>
         
      <div className="relative group ">
   <button
            onClick={() => navigateTo("create")}
   
    className="p-5  cursor-pointer hover:scale-110 flex items-center justify-center transition"
  >
    <img
      width="40"
      height="40"
      src="https://img.icons8.com/arcade/64/plus.png"
      alt="plus"
    />
  </button>

  {/* Tooltip */}
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
            <tbody>
              {filteredorders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-indigo-600">{order.date_entered}</td>
                  <td className="px-6 py-4 text-gray-900">
                    {order.real_name.split("<")[0].trim()}
                  </td>
                  <td className="px-6 py-4 text-green-600">
                    {order.total_amount_c}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                        order.order_status
                      )}`}
                    >
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {order.complete_date}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {order.order_id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {/* Update Button */}
                      <button
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
          </table>
        </div>
        <Pagination slice={"orders"} fn={getOrders} />

        {!loading && filteredorders.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No orders found for this week.
          </div>
        )}
      </div>
    </>
  );
}
