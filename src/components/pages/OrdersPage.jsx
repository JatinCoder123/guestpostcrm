import {
  Mail,
  ShoppingCart,
  Package,
  Pen,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";

import { useSelector } from "react-redux";
import Pagination from "../Pagination";
import { getOrders } from "../../store/Slices/orders";
import { useNavigate } from "react-router-dom";

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



  const dropdownOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
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
    console.log('Download clicked');
  };

  return (
    <>


      <SearchComponent
      
      dropdownOptions={dropdownOptions}
      onDropdownChange={handleCategoryChange} 
      selectedDropdownValue={selectedCategory} 
      dropdownPlaceholder="Filter by Status"
      
      
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
            <h2 className="text-lg font-semibold text-gray-800">ORDERS</h2>
            <a href="">
              <img width="30" height="30" src="https://img.icons8.com/offices/30/info.png" alt="info" />
            </a>
          </div>
          <button
            onClick={() => navigateTo("create")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + New Order
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                 <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>ORDER DATE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>CLIENT</span>
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
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-indigo-600">{order.order_date}</td>
                  <td className="px-6 py-4 text-gray-900">
                    {order.client_email}
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
                    {order.id_C}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {order.complete_data}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {/* Update Button */}
                      <button
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Update"
                      >
                        <Pen className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination slice={"orders"} fn={getOrders} />

        {!loading && orders.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No orders found for this week.
          </div>
        )}
      </div>
    </>
  );
}
