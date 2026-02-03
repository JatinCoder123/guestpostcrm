import {
  Mail,
  FileText,
  DollarSign,
  Calendar,
  User,
  Download,
  Pen,
  CreditCard,
  Wallet,
  Banknote,
  Globe,
  Flag,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect, useState } from "react";
import { CreateInvoice } from "../CreateInvoice";
import Pagination from "../Pagination";
import { getInvoices, invoicesAction, updateInvoice } from "../../store/Slices/invoices";
import EnhancedSearch from "./EnhancedSearch";
import UpdatePopup from "../UpdatePopup";
import TableLoading from "../TableLoading";
import { toast } from "react-toastify";
import { excludeEmail, extractEmail } from "../../assets/assets";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";

export function InvoicesPage() {
  const { invoices, count, summary, loading, message, error, updating } = useSelector((state) => state.invoices);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const { setSearch, setEnteredEmail } = useContext(PageContext);
  const [topsearch, setTopsearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentUpdateInvoice, setCurrentUpdateInvoice] = useState(null);
  const [filters, setFilters] = useState({});
  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "SENT":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'paypal':
        return <Wallet className="w-4 h-4 mr-1" />;
      case 'payoneer':
        return <Globe className="w-4 h-4 mr-1" />;
      case 'wise':
        return <Banknote className="w-4 h-4 mr-1" />;
      case 'indian_upi':
        return <Flag className="w-4 h-4 mr-1" />;
      case 'swift_india':
        return <Banknote className="w-4 h-4 mr-1" />;
      default:
        return <Wallet className="w-4 h-4 mr-1" />;
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method?.toLowerCase()) {
      case 'paypal':
        return "bg-blue-100 text-blue-700 border-blue-200";
      case 'payoneer':
        return "bg-orange-100 text-orange-700 border-orange-200";
      case 'wise':
        return "bg-green-100 text-green-700 border-green-200";
      case 'indian_upi':
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case 'swift_india':
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  useEffect(() => {
    if (showCreateInvoice) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showCreateInvoice]);

  if (showCreateInvoice) {
    return (
      <CreateInvoice
        onClose={() => {
          setShowCreateInvoice(false);
        }}
      />
    );
  }

  // Filter configuration for Invoice page
  const invoiceFilterConfig = [
    {
      key: 'archive',
      type: 'select',
      label: 'Archive',
      options: [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'archived', label: 'Archived' },
      ],
      defaultValue: 'all'
    },
    {
      key: 'dateRange',
      type: 'date-range',
      label: 'Date',
      placeholder: 'Select date range'
    },
    // {
    //   key: 'transactionType',
    //   type: 'select',
    //   label: 'Transaction type',
    //   options: [
    //     { value: 'all', label: 'All transactions' },
    //     { value: 'invoice', label: 'Invoice' },
    //     { value: 'payment', label: 'Payment' },
    //     { value: 'refund', label: 'Refund' },
    //     { value: 'credit', label: 'Credit' },
    //     { value: 'debit', label: 'Debit' },
    //   ],
    //   defaultValue: 'all'
    // },
    {
      key: 'paymentMethod',
      type: 'select',
      label: 'Payment method',
      options: [
        { value: 'all', label: 'All methods' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'payoneer', label: 'Payoneer' },
        { value: 'wise', label: 'Wise' },
        { value: 'indian_upi', label: 'Indian UPI' },
        { value: 'swift_india', label: 'Swift India' },
      ],
      defaultValue: 'all'
    },
    {
      key: 'amountRange',
      type: 'range',
      label: 'Amount range',
      min: 0,
      max: 100000,
      step: 100
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All status' },
        { value: 'PAID', label: 'Paid' },
        { value: 'DRAFT', label: 'Draft' },
        { value: 'SENT', label: 'Sent' },
        { value: 'CANCELLED', label: 'Cancelled' },
        { value: 'OVERDUE', label: 'Overdue' },
        { value: 'PARTIAL', label: 'Partial Payment' },
      ],
      defaultValue: 'all'
    },
    {
      key: 'currency',
      type: 'select',
      label: 'Currency',
      options: [
        { value: 'all', label: 'All' },
        { value: 'usd', label: 'USD' },
        { value: 'eur', label: 'EUR' },
        { value: 'gbp', label: 'GBP' },
        { value: 'inr', label: 'INR' },
      ],
      defaultValue: 'all'
    },
    {
      key: 'hasAttachment',
      type: 'checkbox',
      label: 'Has attachment'
    }
  ];

  // Apply all filters to invoices
  const filteredinvoices = invoices
    .filter((item) => {
      // Apply search filter
      const searchValue = topsearch.toLowerCase();
      if (searchValue) {
        const contact = item.name?.split("<")[0]?.trim().toLowerCase() || "";
        const invoiceId = item.invoice_id?.toLowerCase() || "";
        const email = item.email_c?.toLowerCase() || "";
        const paymentMethod = item.payment_method?.toLowerCase() || "";

        if (selectedCategory === "contact") {
          return contact.includes(searchValue);
        }
        if (selectedCategory === "paymentMethod") {
          return paymentMethod.includes(searchValue);
        }
        // Default search: search in contact, invoice ID, email, and payment method
        return contact.includes(searchValue) ||
          invoiceId.includes(searchValue) ||
          email.includes(searchValue) ||
          paymentMethod.includes(searchValue);
      }
      return true;
    })
    .filter((item) => {
      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        const invoiceStatus = item.status_c?.toString().toUpperCase() || "";
        const filterStatus = filters.status.toUpperCase();
        return invoiceStatus === filterStatus;
      }
      return true;
    })
    .filter((item) => {
      // Apply amount range filter
      if (filters.amountRange && (filters.amountRange.min > 0 || filters.amountRange.max > 0)) {
        const amount = parseFloat(item.amount_c) || 0;
        const min = filters.amountRange.min || 0;
        const max = filters.amountRange.max || Infinity;

        return amount >= min && amount <= max;
      }
      return true;
    })
    .filter((item) => {
      // Apply date range filter
      if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) {
        const invoiceDate = new Date(item.date_entered);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

        if (startDate && invoiceDate < startDate) return false;
        if (endDate && invoiceDate > endDate) return false;

        return true;
      }
      return true;
    })
    .filter((item) => {
      // Apply payment method filter
      if (filters.paymentMethod && filters.paymentMethod !== 'all') {
        const paymentMethod = item.payment_method?.toLowerCase() || "";
        const filterMethod = filters.paymentMethod.toLowerCase();

        // Handle exact match for payment methods
        if (['paypal', 'payoneer', 'wise', 'indian_upi', 'swift_india'].includes(filterMethod)) {
          return paymentMethod === filterMethod;
        }

        // For partial matching if needed
        return paymentMethod.includes(filterMethod);
      }
      return true;
    })
    .filter((item) => {
      // Apply currency filter
      if (filters.currency && filters.currency !== 'all') {
        const invoiceCurrency = item.currency?.toLowerCase() || 'usd';
        return invoiceCurrency === filters.currency.toLowerCase();
      }
      return true;
    })
    .filter((item) => {
      // Apply archive filter
      if (filters.archive && filters.archive !== 'all') {
        const isArchived = item.archived || item.is_archived || false;
        if (filters.archive === 'archived') {
          return isArchived;
        } else if (filters.archive === 'active') {
          return !isArchived;
        }
      }
      return true;
    })
    .filter((item) => {
      // Apply has attachment filter
      if (filters.hasAttachment) {
        return item.has_attachment || item.attachments || item.attachment_count > 0;
      }
      return true;
    });

  const dropdownOptions = [
    { value: 'contact', label: 'Contact' },
    { value: 'paymentMethod', label: 'Payment Method' }
  ];

  const handleSearchChange = (value) => {
    setTopsearch(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleFilterApply = (appliedFilters) => {
    setFilters(appliedFilters);
  };

  const handleDownload = () => {
    if (!filteredinvoices || filteredinvoices.length === 0) {
      toast.error("No data available to download");
      return;
    }

    const headers = ["DATE", "INVOICE ID", "CLIENT", "AMOUNT", "PAYMENT METHOD", "STATUS", "DUE DATE", "LINK"];
    const rows = filteredinvoices.map((invoice) => [
      invoice.date_entered,
      invoice.id,
      invoice.email_c,
      invoice.amount_c,
      invoice.payment_method || 'N/A',
      invoice.status_c,
      invoice.due_date,
      invoice.preview
    ]);

    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.map((val) => `"${val}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "invoices.csv";
    a.click();
  };

  const updateInvoiceHandler = (invoice, data) => {
    const updatedInvoice = {
      ...invoice,
      ...data,
    };
    dispatch(updateInvoice(updatedInvoice));
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(invoicesAction.clearAllErrors());
    }
    if (message) {
      toast.success(message);
      setCurrentUpdateInvoice(null);
      dispatch(invoicesAction.clearAllMessages());
    }
  }, [dispatch, message, error]);




  // Calculate payment method statistics
  const paymentMethodsStats = {};
  filteredinvoices.forEach(inv => {
    const method = inv.payment_method || 'Unknown';
    if (!paymentMethodsStats[method]) {
      paymentMethodsStats[method] = { count: 0, amount: 0 };
    }
    paymentMethodsStats[method].count++;
    paymentMethodsStats[method].amount += parseFloat(inv.amount_c) || 0;
  });

  const topPaymentMethod = Object.entries(paymentMethodsStats)
    .sort((a, b) => b[1].amount - a[1].amount)[0] || ['None', { count: 0, amount: 0 }];

  return (
    <>
      {currentUpdateInvoice && (
        <UpdatePopup
          open={!!currentUpdateInvoice}
          title="Update Invoice"
          fields={[
            { name: "name", label: "Name", type: "text", value: currentUpdateInvoice.name },
            { name: "email_c", label: "Email", type: "text", value: currentUpdateInvoice.email_c },
            { name: "amount_c", label: "Amount", type: "number", value: currentUpdateInvoice.amount_c },
            {
              name: "payment_method",
              label: "Payment Method",
              type: "select",
              value: currentUpdateInvoice.payment_method,
              options: [
                { value: 'paypal', label: 'PayPal' },
                { value: 'payoneer', label: 'Payoneer' },
                { value: 'wise', label: 'Wise' },
                { value: 'indian_upi', label: 'Indian UPI' },
                { value: 'swift_india', label: 'Swift India' },
              ]
            },
          ]}
          loading={updating}
          onUpdate={(data) => updateInvoiceHandler(currentUpdateInvoice, data)}
          onClose={() => setCurrentUpdateInvoice(null)}
        />
      )}

      {/* Use EnhancedSearch with dynamic filters */}
      <EnhancedSearch
        dropdownOptions={dropdownOptions}
        onDropdownChange={handleCategoryChange}
        selectedDropdownValue={selectedCategory}
        onSearchChange={handleSearchChange}
        searchValue={topsearch}
        searchPlaceholder="Search here..."
        onFilterApply={handleFilterApply}
        filterConfig={invoiceFilterConfig}
        filterPlaceholder="Filters"
        showFilter={true}
        onDownloadClick={handleDownload}
        showDownload={true}
        className="mb-6"
      />

      {/* Active Filters Display */}
      {Object.keys(filters).length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Active Filters:</span>
            {Object.entries(filters).map(([key, value]) => {
              const config = invoiceFilterConfig.find(c => c.key === key);
              if (!config) return null;

              let displayValue = '';
              if (config.type === 'select') {
                const option = config.options.find(o => o.value === value);
                displayValue = option ? option.label : value;
              } else if (config.type === 'range') {
                if (value.min || value.max) {
                  displayValue = `$${value.min || 0} - $${value.max || '∞'}`;
                }
              } else if (config.type === 'date-range') {
                if (value.start || value.end) {
                  displayValue = `${value.start || 'Start'} to ${value.end || 'End'}`;
                }
              } else if (config.type === 'checkbox') {
                if (value) {
                  displayValue = config.label;
                }
              }

              if (displayValue) {
                return (
                  <span key={key} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {config.label}: {displayValue}
                  </span>
                );
              }
              return null;
            })}
            <button
              onClick={() => setFilters({})}
              className="ml-auto text-sm text-red-600 hover:text-red-800"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Invoices</p>
              <p className="text-2xl text-gray-900 mt-1">{count}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Paid</p>
              <p className="text-2xl text-gray-900 mt-1">{summary?.paid_count}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Sent</p>
              <p className="text-2xl text-gray-900 mt-1">{summary?.sent_count}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Paid Amount</p>
              <p className="text-2xl text-gray-900 mt-1">${summary?.total_paid_amount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💸</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-900">INVOICES</h2>
            <a href="https://www.guestpostcrm.com/blog/one-click-paypal-invoice-creation/" target="_blank"
              rel="noopener noreferrer">
              <img width="30" height="30" src="https://img.icons8.com/offices/30/info.png" alt="info" />
            </a>
          </div>

          <div className="relative group">
            <button
              className="p-5 cursor-pointer hover:scale-110 flex items-center justify-center transition"
              onClick={() => alert("work in progress")}
            >
              <img
                width="40"
                height="40"
                src="https://img.icons8.com/arcade/64/plus.png"
                alt="plus"
              />
            </button>
            <span className="absolute left-1/2 -bottom-3 -translate-x-1/2 
                   bg-gray-800 text-white text-sm px-3 py-1 rounded-md 
                   opacity-0 group-hover:opacity-100 transition 
                   pointer-events-none whitespace-nowrap shadow-md">
              Create Invoices
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>DATE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">INVOICE ID</th>
                <th className="px-6 py-4 text-left">LINK</th>
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
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    <span>PAYMENT METHOD</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">STATUS</th>
                <th className="px-6 py-4 text-left">DUE DATE</th>

                <th className="px-6 py-4 text-left">ACTION</th>
              </tr>
            </thead>
            {loading ? <TableLoading cols={8} /> : <tbody>
              {filteredinvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-gray-100 hover:bg-yellow-50 transition-colors cursor-pointer"
                >
                  <td
                    className="px-6 py-4 text-gray-600 cursor-pointer"
                    onClick={() => {
                      const input = extractEmail(invoice.email_c);
                      localStorage.setItem("email", input);
                      setSearch(input);
                      setEnteredEmail(input);
                      navigateTo("/");
                    }}
                  >
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{invoice.date_entered}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-yellow-600">
                    {invoice.invoice_id?.slice(0, 4)}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    <a href={invoice.preview} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View Invoice
                    </a>
                  </td>

                  <td
                    onClick={() => {
                      const input = extractEmail(invoice.email_c);
                      localStorage.setItem("email", input);
                      setSearch(input);
                      setEnteredEmail(input);
                      navigateTo("/contacts");
                    }}
                    className="px-6 py-4 text-gray-900 cursor-pointer"
                  >
                    {invoice.email_c?.split("<")[0]?.trim() || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-green-600">
                    ${parseFloat(invoice.amount_c || 0).toFixed(2)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className={`px-3 py-1.5 rounded-full text-sm border flex items-center ${getPaymentMethodColor(invoice.payment_method)}`}>
                        {getPaymentMethodIcon(invoice.payment_method)}
                        {invoice.payment_method ? invoice.payment_method.replace('_', ' ').toUpperCase() : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(invoice.status_c)}`}>
                      {invoice.status_c}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {invoice.due_date || "PENDING"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentUpdateInvoice(invoice)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Update"
                      >
                        <Pen className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>}
          </table>
        </div>
        {filteredinvoices.length > 0 && (
          <Pagination slice={"invoices"} fn={(p) => dispatch(getInvoices({ page: p }))} />
        )}
        {filteredinvoices.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No invoices found matching your criteria.
            </p>
            {Object.keys(filters).length > 0 && (
              <button
                onClick={() => setFilters({})}
                className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}