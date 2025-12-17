import {
  Calendar,
  User,
  FileText,
  Shield,
  TagIcon,
  Trash2,
  MoreVertical,
  Plus,
  X,
  CheckCircle
} from "lucide-react";

import SearchComponent from "./SearchComponent";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Pagination from "../Pagination";
import { getTags, tagActions } from "../../store/Slices/tag"; // Import tagActions
import CreateTag from "./CreateTag";

export function TagManagerpage() {
  const dispatch = useDispatch();
  const { tags, count, creating } = useSelector((state) => state.tag);
  
  const [topsearch, setTopsearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [createdTagName, setCreatedTagName] = useState("");
  
  useEffect(() => {
    dispatch(getTags(selectedTag));
  }, [dispatch, selectedTag]);

  
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
        setCreatedTagName("");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      const datePart = dateString.split(' ')[0];
      return datePart || dateString;
    }
  };

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
    console.log('delete btn clicked');
  };

  
  const handleCreateTagSuccess = (tagName) => {
    
    setCreatedTagName(tagName);
    
    
    setShowSuccessToast(true);
    
    
    setShowCreateForm(false);
    
    
    dispatch(getTags(selectedTag));
    
    
    dispatch(tagActions.resetCreateStatus());
  };

  
  const handleClosePopup = () => {
    if (!creating) {
      dispatch(tagActions.resetCreateStatus());
      setShowCreateForm(false);
    }
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
      {/* Main Container with blur effect */}
      <div className={`${showCreateForm ? 'filter blur-sm pointer-events-none' : ''} transition-all duration-300`}>
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

        {/* Success Toast Notification */}
        {showSuccessToast && createdTagName && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className="flex items-center gap-2 px-4 py-3 bg-green-100 text-green-800 rounded-lg shadow-lg border border-green-200">
              <CheckCircle className="w-5 h-5" />
              <span>Tag "<strong>{createdTagName}</strong>" created successfully!</span>
            </div>
          </div>
        )}

        {/* Tag Manager Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header with Create Button */}
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Tag</span>
              </button>
            </div>
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
                        <span>{formatDate(tagItem.date_modified)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-900">
                        <span>{tagItem.first_name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleConfirmDelete()}
                        disabled={deletingId === (tagItem.thread_id || tagItem.id)}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-lg transition-all bg-red-200 hover:bg-red-300 cursor-pointer
                        `}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
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
      </div>

      {/* Create Tag Form Popup */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={handleClosePopup}
          ></div>
          
          {/* Popup Card */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <TagIcon className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Create New Tag</h2>
              </div>
              <button
                onClick={handleClosePopup}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={creating}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Form */}
            <CreateTag 
              onSubmit={handleCreateTagSuccess}
              onCancel={handleClosePopup}
            />
          </div>
        </div>
      )}
    </>
  );
}