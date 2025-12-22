import {
  Mail,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  BarChart,
  Shield,
  TagIcon,
  Laptop,
  Contact,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import SearchComponent from "./SearchComponent";
import Pagination from "../Pagination";
import { getContacts } from "../../store/Slices/contact_other";

export function Contacts_otherPage() {

  const dispatch = useDispatch();   // ✅ FIX ADDED

  const { detection = [], count = 0 } =
    useSelector((state) => state.contact_other || {});

  const [topsearch, setTopsearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleSearchChange = (value) => {
    setTopsearch(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleFilterApply = (filters) => { };

  const handleDownload = () => {
    console.log("download handler");
  };

  // ✅ Dispatch API call
  useEffect(() => {
    dispatch(getContacts({ page: 1 }));
  }, [dispatch]);

  return (
    <>
      <SearchComponent
        dropdownOptions={[{ value: "all", label: "Contact" }]}
        selectedDropdownValue={selectedCategory}
        onDropdownChange={handleCategoryChange}
        searchValue={topsearch}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search here..."
        onFilterApply={handleFilterApply}
        filterPlaceholder="Filters"
        showFilter={true}
        onDownloadClick={handleDownload}
        showDownload={true}
        className="mb-6"
      />

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Contact className="w-6 h-6 text-green-600" />
            <h2 className="text-xl text-gray-900">Contacts</h2>
          </div>
          <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full">
            {count} Contacts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                <th className="px-6 py-4 text-left w-1/4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>DATE</span>
                  </div>
                </th>

                <th className="px-6 py-4 text-left w-1/4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>CONTACT</span>
                  </div>
                </th>

                <th className="px-6 py-4 text-left w-1/4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Stage</span>
                  </div>
                </th>

                <th className="px-6 py-4 text-left w-1/4">
                  <div className="flex items-center gap-2">
                    <BarChart className="w-4 h-4" />
                    <span>Email Address</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {detection.length > 0 &&
                detection.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-orange-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 w-1/4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{item.date_entered}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 w-1/4">
                      <div className="flex items-center gap-2 text-gray-900">
                        <span>{item.first_name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-900 w-1/4">
                      {item.stage}
                    </td>

                    <td className="px-6 py-4 w-1/4">
                      <div className="flex items-center gap-2 text-gray-900">
                        <span>{item.email_address}</span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {detection.length > 0 && (
          <Pagination slice={"contact_other"} fn={getContacts} />
        )}

        {detection.length === 0 && (
          <div className="p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No Contacts yet.</p>
          </div>
        )}
      </div>
    </>
  );
}
