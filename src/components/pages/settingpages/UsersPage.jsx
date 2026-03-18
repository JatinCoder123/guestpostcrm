import useModule from "../../../hooks/useModule";
import { CREATE_DEAL_API_KEY } from "../../../store/constants";
import { Edit3, Trash2 } from "lucide-react";
import { useState } from "react";
import Loading from "../../Loading";
import Header from "./Header";
import ErrorBox from "./ErrorBox";
import EditUser from "./EditUser";
import { useSelector } from "react-redux";

export function UsersPage() {
  const [editItem, setEditItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { businessEmail, crmEndpoint } = useSelector((state) => state.user);

  const { loading, data, error, setData, refetch, add, update } = useModule({
    url: `https://crm.outrightsystems.org/index.php?entryPoint=get_gpc_users&email=${businessEmail}`,
    method: "POST",
    body: {
      module: "outr_gpc_users",
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  // ✅ CREATE
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
      url: `${crmEndpoint.split("?")[0]}?entryPoint=fetch_gpc&type=add_user&email=${updatedItem.email}&name=${updatedItem.name}`,
      method: "POST",
    });
  };

  // ✅ UPDATE
  const handleUpdate = (updatedItem) => {
    setData((prev) => {
      const updated = { ...prev };
      updated.data = updated.data.map((obj) =>
        obj.id === updatedItem.id ? updatedItem : obj,
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

  // ✅ DELETE USER (NEW)
  const handleDelete = async (item) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${item.name}?`,
    );
    if (!confirmDelete) return;

    setDeletingId(item.id);

    try {
      // 🔹 Optimistic UI
      setData((prev) => {
        const updated = { ...prev };
        updated.data = updated.data.filter((u) => u.id !== item.id);
        return updated;
      });

      // 🔹 CRM DELETE
      await fetch(
        `${crmEndpoint}&type=delete_record&module_name=outr_gpc_users&record_id=${item.id}`,
        {
          method: "POST",
        },
      );
    } catch (err) {
      console.error("Delete failed", err);

      // rollback (optional improvement)
      refetch();
    } finally {
      setDeletingId(null);
    }
  };

  const users = data?.data;

  return (
    <div className="p-8">
      <Header
        text={"User Manager"}
        handleCreate={() =>
          setEditItem({
            type: "new",
          })
        }
      />

      {loading && (
        <div className="mt-10">
          <Loading text={"Users"} />
        </div>
      )}

      {error && <ErrorBox message={error.message} onRetry={refetch} />}

      {!loading && !error && users?.length === 0 && (
        <div className="mt-6 text-center p-10 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-gray-600 text-lg">No users found.</p>
        </div>
      )}

      {users?.length > 0 && (
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 
              p-5 flex flex-col justify-between group transition-all"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  {item.name}
                </h2>

                <p className="text-gray-600 mt-2 text-sm">
                  {item.email || "No Email"}
                </p>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                {/* EDIT */}
                <button
                  onClick={() => setEditItem(item)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  <Edit3 size={16} />
                </button>

                {/* DELETE */}
                <button
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
                >
                  {deletingId === item.id ? "..." : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditUser
        item={editItem}
        onClose={() => setEditItem(null)}
        handleUpdate={handleUpdate}
        handleCreate={handleCreate}
      />
    </div>
  );
}
