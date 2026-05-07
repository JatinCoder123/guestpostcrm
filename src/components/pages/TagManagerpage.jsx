import {
  Calendar,
  Clapperboard,
  Trash,
  Tag,
  MemoryStick,
  Edit,
  BadgeDollarSign,
  Plus,
  X,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import { LoadingChase } from "../Loading.jsx";

import { getTags, deleteTag } from "../../store/Slices/tag.js";

import CreateTag from "./CreateTag";

export function TagManagerpage() {
  const dispatch = useDispatch();

  const { tags, pageIndex, deleting, deleteTagId, creating } = useSelector(
    (state) => state.tag,
  );

  // ✅ Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [editingTag, setEditingTag] = useState(null);

  useEffect(() => {
    dispatch(getTags());
  }, [dispatch]);

  // ✅ OPEN CREATE
  const handleCreate = () => {
    setEditingTag(null);
    setShowPopup(true);
  };

  // ✅ OPEN EDIT
  const handleEdit = (row) => {
    setEditingTag(row);
    setShowPopup(true);
  };

  // ✅ AFTER SUCCESS
  const handleSuccess = () => {
    setShowPopup(false);
    setEditingTag(null);
    dispatch(getTags());
  };

  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      icon: Calendar,
      render: (row) => <span>{row.date_entered}</span>,
    },
    {
      label: "Tag Name",
      accessor: "name",
      icon: Tag,
      render: (row) => <span>{row.name}</span>,
    },
    {
      label: "Memo No.",
      accessor: "memo_c",
      icon: MemoryStick,
      render: (row) => <span>{row?.memo_c}</span>,
    },
    {
      label: "Type",
      accessor: "type",
      icon: BadgeDollarSign,
      render: (row) => <span>{row?.type}</span>,
    },
    {
      label: "Modified At",
      accessor: "date_modified",
      icon: Calendar,
      render: (row) => <span>{row?.date_modified}</span>,
    },
    {
      label: "Action",
      accessor: "action",
      icon: Clapperboard,
      classes: "ml-auto",
      headerClasses: "ml-auto",
      render: (row) => (
        <div className="flex gap-2 ">
          {/* ✅ EDIT */}
          <button
            onClick={() => handleEdit(row)}
            className="p-2 bg-blue-100 rounded"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>

          {/* ✅ DELETE */}
          {deleting && deleteTagId === row.id ? (
            <LoadingChase size="20" color="red" />
          ) : (
            <button
              onClick={() => dispatch(deleteTag(row.id))}
              className="p-2 bg-red-100 rounded"
            >
              <Trash className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {/* ✅ TABLE */}
      <TableView
        tableData={tags}
        tableName={"Tag Manager"}
        columns={columns}
        slice={"tag"}
        fetchNextPage={() => dispatch(getTags({ page: pageIndex + 1 }))}
      >
        <TableTitleBar
          Icon={Tag}
          title={"Tag Manager"}
          titleClass={"text-orange-500"}
        />

        {
          <div className="absolute -top-1 right-0">
            <button className="cursor-pointer" onClick={handleCreate}>
              <img
                width="30"
                height="30"
                src="https://img.icons8.com/arcade/64/plus.png"
                alt="plus"
              />
            </button>
          </div>
        }

        <Table headerStyle={"bg-orange-500"} layoutStyle={"grid grid-cols-6"} />
      </TableView>

      {/* ✅ POPUP */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowPopup(false)}
          />

          {/* MODAL */}
          <div className="relative bg-white rounded-xl w-full max-w-md shadow-lg">
            {/* HEADER */}
            <div className="flex justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingTag ? "Edit Tag" : "Create Tag"}
              </h2>

              <button onClick={() => setShowPopup(false)}>
                <X />
              </button>
            </div>

            {/* FORM */}
            <CreateTag
              onSubmit={handleSuccess}
              onCancel={() => setShowPopup(false)}
              initialData={editingTag}
              isEditing={!!editingTag}
            />
          </div>
        </div>
      )}
    </>
  );
}
