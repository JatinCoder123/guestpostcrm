import useModule from "../../../hooks/useModule";
import { CREATE_DEAL_API_KEY } from "../../../store/constants";
import { Edit3 } from "lucide-react";
import { useState } from "react";
import Loading from "../../Loading";
import Header from "./Header";
import ErrorBox from "./ErrorBox";
import EditUser from "./EditUser";
import { useSelector } from "react-redux";
import { getDomain } from "../../../assets/assets";

export function UsersPage() {
  const [editItem, setEditItem] = useState(null);
  const { businessEmail, crmEndpoint } = useSelector((state) => state.user);

  const { loading, data, error, setData, refetch, add, update } = useModule({
    url: `${crmEndpoint.split('?')[0]}?entryPoint=fetch_gpc&type=get_users`,
    method: "GET",
    name: "USERS"

  });
  const handleCreate = async (updatedItem) => {
    setData((prev) => {
      const updated = { ...prev };
      updated.data = [{ id: Math.random(), ...updatedItem }, ...updated.data];
      return updated;
    });
    await add({
      url: `https://crm.outrightsystems.org/index.php?entryPoint=get_post_all&action_type=post_data&email=${businessEmail}`,
      method: "POST",
      body: {
        parent_bean: {
          id: data.parent_bean_id,
          module: data.parent_bean_module,
        },
        child_bean: {
          module: "outr_gpc_users",
          description: updatedItem.email,
          name: updatedItem.name,
        },
      },
      headers: {
        "x-api-key": `${CREATE_DEAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    await add({
      url: `${crmEndpoint.split('?')[0]}?entryPoint=fetch_gpc&type=add_user&email=${updatedItem.email}&name=${updatedItem.name}`,
      method: "POST",
    });
  };
  const handleUpdate = (updatedItem) => {
    setData((prev) => {
      const updated = { ...prev };
      updated.data = updated.data.map((obj) =>
        obj.id === updatedItem.id ? updatedItem : obj
      );
      return updated;
    });
    update({
      url: `https://crm.outrightsystems.org/index.php?entryPoint=get_post_all&action_type=post_data&email=${businessEmail}`,
      method: "POST",
      body: {
        parent_bean: {
          module: "outr_gpc_users",
          id: updatedItem.id,
          description: updatedItem.email,
          name: updatedItem.name,
        },
      },
      headers: {
        "x-api-key": `${CREATE_DEAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
  };

  // Normalize API data response
  const users = data;
  return (
    <div className="p-8">
      {/* Header */}
      <Header
        text={"User Manager"}
        handleCreate={() =>
          setEditItem(() => {
            return {
              type: "new",
            };
          })
        }
      />

      {/* Loading */}
      {loading && (
        <div className="mt-10">
          <Loading text={"Users"} />
        </div>
      )}

      {/* Error Component */}
      {error && <ErrorBox message={error.message} onRetry={refetch} />}

      {/* Empty State */}
      {!loading && !error && users?.length == 0 && (
        <div className="mt-6 text-center p-10 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-gray-600 text-lg">No users found.</p>
          <p className="text-gray-400 text-sm mt-1">
            Add new users from your backend or configuration panel.
          </p>
        </div>
      )}

      {/* Data Cards */}
      {users?.length > 0 && (
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((item) => (
            <div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 
              p-5 flex flex-col justify-between group transition-all"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {item.name}
                </h2>

                <p className="text-gray-600 mt-2 text-sm">
                  {item.email || "No Email"}
                </p>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setEditItem(item)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white 
                  rounded-xl shadow-sm hover:bg-blue-700 transition"
                >
                  <Edit3 size={18} />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <EditUser
        item={editItem}
        onClose={() => setEditItem(null)}
        handleUpdate={handleUpdate}
        handleCreate={handleCreate}
      />
    </div>
  );
}
