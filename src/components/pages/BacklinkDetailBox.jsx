

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  X, 
  ExternalLink, 
  Calendar, 
  User, 
  Shield, 
  TrendingUp,
  Clock,
  Globe,
  FileText,
  Edit,
  Trash2,
  Save,
  AlertCircle
} from "lucide-react";

export function BacklinkDetailBox({ onClose, backlinkId }) {
  const dispatch = useDispatch();
  const { backlinks, backlinkDetail, loading } = useSelector((state) => state.backlinks);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  
  const currentBacklink = backlinkDetail || backlinks.find(bl => bl.id === backlinkId);

  
  useEffect(() => {
    if (currentBacklink) {
      setEditData({
        anchor_text_c: currentBacklink.anchor_text_c || '',
        status_c: currentBacklink.status_c || '',
        expiry_date_c: currentBacklink.expiry_date_c || '',
        target_url_c: currentBacklink.target_url_c || '',
        
      });
    }
  }, [currentBacklink]);


  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'removed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!currentBacklink) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-yellow-500" />
          </div>
          <p className="text-center mt-4 text-gray-600">Backlink details not found.</p>
          <button
            onClick={onClose}
            className="mt-6 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ExternalLink className="w-6 h-6 text-green-600" />
            <h2 className="text-xl text-gray-900">
              {isEditing ? 'Edit Backlink' : 'BACKLINK DETAILS'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>


        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Basic Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Domain</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.target_url_c || ''}
                        onChange={(e) => handleInputChange('target_url_c', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      <p className="font-medium">{currentBacklink.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Anchor Text</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.anchor_text_c || ''}
                        onChange={(e) => handleInputChange('anchor_text_c', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      <p className="font-medium">{currentBacklink.anchor_text_c || "N/A"}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Status</p>
                    {isEditing ? (
                      <select
                        value={editData.status_c || ''}
                        onChange={(e) => handleInputChange('status_c', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="removed">Removed</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentBacklink.status_c)}`}>
                        {currentBacklink.status_c?.toUpperCase() || "UNKNOWN"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>


            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Date Added</p>
                    <p className="font-medium">{formatDate(currentBacklink.date_entered)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Expiry Date</p>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editData.expiry_date_c || ''}
                        onChange={(e) => handleInputChange('expiry_date_c', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      <p className="font-medium">{formatDate(currentBacklink.expiry_date_c)}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Author</p>
                    <p className="font-medium">{currentBacklink.post_author_name_c}</p>
                    <p className="text-sm text-gray-500">{currentBacklink.post_author_email_c}</p>
                  </div>
                </div>
              </div>
            </div>


            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">URLs</h3>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Target URL</p>
                <a 
                  href={currentBacklink.target_url_c} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 break-all"
                >
                  {currentBacklink.target_url_c}
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>

              {currentBacklink.source_url_c && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Source URL</p>
                  <a 
                    href={currentBacklink.source_url_c} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 break-all"
                  >
                    {currentBacklink.source_url_c}
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>


        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}