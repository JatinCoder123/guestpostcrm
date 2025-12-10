import {
  Mail,
  FileText,
  DollarSign,
  Calendar,
  User,
  Download,
  Pen,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { CreateInvoice } from "../CreateInvoice";
import Pagination from "../Pagination"; 
import { getInvoices, invoicesAction, updateInvoice } from "../../store/Slices/invoices";
import SearchComponent from "./SearchComponent";
import UpdatePopup from "../UpdatePopup";
import { toast } from "react-toastify";

export function InvoicesPage() {
  const { invoices, count, message, error, updating } = useSelector((state) => state.invoices);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [topsearch, setTopsearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('');
  const [currentUpdateInvoice, setCurrentUpdateInvoice] = useState(null);
  const dispatch = useDispatch();

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


  const filteredinvoices = invoices
    .filter((item) => {
      const searchValue = topsearch.toLowerCase();
      if (!searchValue) return true; // no search → show all

      const contact = item.name.split("<")[0].trim().toLowerCase();
      // const subject = item.order_id?.toLowerCase() || "";
      // const date = item.date_entered?.toLowerCase() || "";

      // 🟢 If category selected
      if (selectedCategory === "contect" || selectedCategory === "contact") {
        return contact.includes(searchValue);
      }
      // if (selectedCategory === "subject") {
      //   return subject.includes(searchValue);
      // }
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

      // if (selectedSort === "oldest") {
      //   return new Date(a.date_entered) - new Date(b.date_entered);
      // }

      return 0;
    });




  const dropdownOptions = [
    { value: 'contect', label: 'contact' }
  ];

  const filterOptions = [
    { value: 'asc', label: 'A to Z' },
    { value: 'desc', label: 'Z to A' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },

  ];

  const handleFilterApply = (filters) => {
    
  };

  const handleSearchChange = (value) => {
    setTopsearch(value);
   
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    
  };

  const handleSortChange = (value) => {
    setSelectedSort(value);
    
  };


  const handleDownload = () => {
    if (!filteredinvoices || filteredinvoices.length === 0) {
      toast.error("No data available to download");
      return;
    }

    // Convert Objects → CSV rows
    const headers = ["DATE", "INVOICE ID", "CLIENT", "AMOUNT", "STATUS", "DUE DATE", "	PAID DATE"];

    const rows = filteredinvoices.map((email) => [
      email.date_entered,
      email.invoice_id?.slice(0, 4),
      email.name,
      email.amount_c,
      email.status_c,
      email.due_date,
      email.payment_data

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


  const updateInvoiceHandler = (invoice, data) => {
    const updatedInvoice = {
      ...invoice,
      ...data,
    };
    dispatch(updateInvoice(updatedInvoice));
  };
  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(invoicesAction.clearAllErrors())
    }
    if (message) {
      toast.success(message)
      setCurrentUpdateInvoice(null)
      dispatch(invoicesAction.clearAllMessages())
    }
  }, [dispatch, message, error]);

  return (
    <>
      {
        currentUpdateInvoice && (
          <UpdatePopup
            open={!!currentUpdateInvoice}
            title="Update Invoice"
            fields={[
              { name: "name", label: "Name", type: "text", value: currentUpdateInvoice.name },
              { name: "email_c", label: "Email", type: "text", value: currentUpdateInvoice.email_c },
              { name: "amount_c", label: "Amount", type: "number", value: currentUpdateInvoice.amount_c },
            ]}
            loading={updating}
            onUpdate={(data) => updateInvoiceHandler(currentUpdateInvoice, data)}
            onClose={() => setCurrentUpdateInvoice(null)}
          />
        )
      }
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
              <p className="text-2xl text-gray-900 mt-1">$500</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl text-gray-900 mt-1">$1.2K</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Overdue</p>
              <p className="text-2xl text-gray-900 mt-1">$750</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 ">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-900">INVOICES</h2>
            <a href="https://www.guestpostcrm.com/blog/one-click-paypal-invoice-creation/" target="_blank"
              rel="noopener noreferrer">
              <img width="30" height="30" src="https://img.icons8.com/offices/30/info.png" alt="info" />
            </a>
          </div>

          <div className="relative group ">
            <button

              className="p-5  cursor-pointer hover:scale-110 flex items-center justify-center transition"
              onClick={() => setShowCreateInvoice(true)}
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
                    <span> DATE</span>
                  </div>
                </th>


                <th className="px-6 py-4 text-left">INVOICE ID</th>
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

                <th className="px-6 py-4 text-left">DUE DATE</th>
                <th className="px-6 py-4 text-left">PAID DATE</th>
                <th className="px-6 py-4 text-left">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredinvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-gray-100 hover:bg-yellow-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-gray-600">
                    {invoice.date_entered}
                  </td>
                  <td className="px-6 py-4 text-yellow-600">
                    {invoice.invoice_id?.slice(0, 4)}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{invoice.name}</td>
                  <td className="px-6 py-4 text-green-600">
                    {invoice.amount_c ?? "NOT PAID"}
                  </td>
                  <td className="px-6 py-4">
                    {invoice.status_c}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {invoice.due_date ?? "PENDING"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {invoice.payment_data ?? "PENDING"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {/* Download Button */}


                      {/* Update Button */}
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
            </tbody>
          </table>
        </div>
        {invoices.length > 0 && (
          <Pagination slice={"invoices"} fn={getInvoices} />
        )}
        {filteredinvoices.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No invoices yet. Create your first invoice to get started.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
