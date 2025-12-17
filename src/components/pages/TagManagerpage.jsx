import {
  Mail,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  BarChart,
  Shield,
  TagIcon,
  Delete,
  Trash2,
  XCircle,
  Trash,
  MoreVertical
} from "lucide-react";

import SearchComponent from "./SearchComponent";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Pagination from "../Pagination";
import { getTags } from "../../store/Slices/tag";

export function TagManagerpage() {
  const dispatch = useDispatch();
  const { tags, count } = useSelector((state) => state.tag);
  
  const [topsearch, setTopsearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [deletingId, setDeletingId] = useState(null); 

  
  useEffect(() => {
    dispatch(getTags(selectedTag));
  }, [dispatch, selectedTag]);

  const handleSearchChange = (value) => {
    setTopsearch(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setSelectedTag(value);
  };

  const handleFilterApply = (filters) => {
    console.log("Filters applied:", filters);
  };

  const handleDownload = () => {
    console.log("Download handler");
  };

  
  const handleConfirmDelete = (id, firstName) => {
    console.log('Tag delete clicked');
  };

  const dropdownOptions = [
    { value: "cold", label: "Cold" },
    { value: "forwarded", label: "Forwarded" },
    { value: "hot", label: "Hot" },
    { value: "spammed", label: "Spammed" },
    { value: "no_reply", label: "No Reply" },
    { value: "non_relevant", label: "Non Relevant" },
    { value: "reseller", label: "Reseller" },
    { value: "unreplied", label: "Unreplied" },
    { value: "sync_contact", label: "Sync Contact" },
    { value: "invalid_email", label: "Invalid Email" },
    { value: "do_not_call", label: "Do not call" },
  ];

  return (
    <>
      <SearchComponent
        dropdownOptions={dropdownOptions}
        selectedDropdownValue={selectedCategory}
        onDropdownChange={handleCategoryChange}
        dropdownPlaceholder="Select Tag"
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

      {/* Tag Manager Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <TagIcon className="w-6 h-6 text-green-600" />
            <h2 className="text-xl text-gray-900">Tag Manager</h2>
            <a 
              href="https://www.guestpostcrm.com/blog/guestpostcrm-moves-certain-spam-emails-back-to-inbox/" 
              target="_blank"
              rel="noopener noreferrer"
            >
              <img 
                width="30" 
                height="30" 
                src="https://img.icons8.com/offices/30/info.png" 
                alt="info" 
              />
            </a>
          </div>
          <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full">
            {count} Tag Manager
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>DATE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>NAME</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <MoreVertical className="w-4 h-4" />
                    <span>ACTION</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {tags?.length > 0 && tags.map((tagItem) => (
                <tr
                  key={tagItem.thread_id || tagItem.id}
                  className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{tagItem.date_modified}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-900">
                      <span>{tagItem.first_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleConfirmDelete()}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer
                        ${deletingId === (tagItem.thread_id || tagItem.id) 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
                        }
                      `}
                    >
                     <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {tags?.length > 0 && (
          <Pagination slice={"tag"} fn={getTags} />
        )}
        
        {(!tags || tags.length === 0) && (
          <div className="p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tags found. Select a tag from dropdown to view data.</p>
          </div>
        )}
      </div>
    </>
  );
}