import {
  Calendar,
  User2,
  Globe,
  ChartNoAxesColumn,
  Clapperboard,
  Cable,
  Text,
  X,
  Pen,
} from "lucide-react";

import { useContext, useState } from "react";

import { PageContext } from "../../context/pageContext";
import { extractEmail } from "../../assets/assets";

import TableView, {
  Table,
} from "../ui/table/Table";

import TableTitleBar from "../ui/table/TableTitleBar";

import BacklinkDetailBox from "./BacklinkDetailBox.jsx";

import { useTablePreference } from "../../hooks/useTablePreference";

import {
  useInfiniteBacklinks,
  useBacklinkStats,
  useUpdateBacklink,
} from "../../queries/backlinks.queries";
import toast from "react-hot-toast";

const STATUS_CONFIG = [
  {
    value: "dofollow",
    label: "Do Follow",
    color: "#10B981",
    filter: "link_type",
  },
  {
    value: "nofollow",
    label: "No Follow",
    color: "#EF4444",
    filter: "link_type",
  },
  {
    value: "authoritative",
    label: "Authoritative",
    color: "#5b44ef",
    filter: "link_type",
  },
];

export function BacklinksPage() {
  const preferences =
    useTablePreference(
      "backlinks"
    );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } =
    useInfiniteBacklinks(
      preferences
    );

  const {
    data: summary,
  } =
    useBacklinkStats();

  const {
    mutate:
    updateBacklink,
    isPending:
    saving,
  } =
    useUpdateBacklink();

  const { handleDateClick, } = useContext(PageContext);

  const [
    showEditModal,
    setShowEditModal,
  ] = useState(false);

  const [
    editData,
    setEditData,
  ] = useState(null);

  const [
    currentBacklinkId,
    setCurrentBacklinkId,
  ] = useState(null);

  const backlinks =
    data?.pages?.flatMap(
      (page) =>
        page.records ||
        page.data ||
        []
    ) ?? [];

  const pages =
    data?.pages ?? [];

  const lastPage =
    pages[
    pages.length - 1
    ] ?? {};

  const firstPage =
    pages[0] ?? {};

  const pageIndex =
    lastPage.page ?? 1;

  const pageCount =
    firstPage.total_pages ??
    0;

  const count =
    firstPage.total ?? 0;

  const loading =
    isPending ||
    isFetchingNextPage;

  const handleEditClick =
    (backlink) => {
      setEditData(
        backlink
      );
      setShowEditModal(
        true
      );
    };

  const handleEditChange =
    (e) => {
      setEditData({
        ...editData,
        [e.target.name]:
          e.target.value,
      });
    };

  const handleSaveEdit = () => {
    updateBacklink(editData, {
      onSuccess: () => {
        setShowEditModal(false);
        toast.success(
          "BackLink Updated Successfully!",
          {
            style: {
              background: "#1f2937",
              color: "#fff",
            },
          }
        );
      },
    });
  };

  const columns = [
    {
      label:
        "Created At",

      accessor:
        "date_entered",

      icon: Calendar,

      onClick: (
        row
      ) =>
        setCurrentBacklinkId(
          row.id
        ),

      classes:
        "truncate max-w-[200px]",

      render: (
        row
      ) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {
            row.date_entered_time_ago
          }
        </span>
      ),
    },

    {
      label:
        "Author",

      accessor:
        "post_author_email_c",

      icon: User2,
      searchable: true,
      classes:
        "truncate max-w-[200px]",

      onClick: (
        row
      ) =>
        handleDateClick(
          {
            email:
              extractEmail(
                row?.post_author_email_c
              ),
            navigate:
              "/contacts",
          }
        ),

      render: (
        row
      ) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.post_author_email_c?.substring(
            0,
            20
          )}
        </span>
      ),
    },

    {
      label:
        "Target URL",
      searchable: true,
      accessor:
        "target_url_c",

      icon: Globe,
      classes:
        "truncate max-w-[200px]",
      render: (
        row
      ) => (
        <a
          href={
            row.target_url_c
          }
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {row.target_url_c?.substring(
            0,
            40
          )}
          ...
        </a>
      ),
    },

    {
      label:
        "Anchor Text",
      searchable: true,
      accessor:
        "anchor_text_c",
      classes:
        "truncate max-w-[200px]",
      icon: Text,

      render: (
        row
      ) => (
        <span className="font-medium text-green-700">
          {row.anchor_text_c ||
            "N/A"}
        </span>
      ),
    },

    {
      label:
        "Expiry",

      accessor:
        "expiry_date_c",

      icon: Calendar,

      render: (
        row
      ) => (
        <span className="font-medium text-gray-700">
          {
            row.expiry_date_c
          }
        </span>
      ),
    },

    {
      label:
        "Link Type",

      accessor:
        "link_type",

      icon:
        ChartNoAxesColumn,

      render: (
        row
      ) => (
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
          {
            row.link_type
          }
        </span>
      ),
    },

    {
      label:
        "Action",

      accessor:
        "action",

      icon:
        Clapperboard,

      headerClasses:
        "ml-auto",

      classes:
        "truncate max-w-[300px] ml-auto",

      render: (
        row
      ) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() =>
              handleEditClick(
                row
              )
            }
            className="flex items-center gap-1 px-3 py-1 text-blue-700 rounded cursor-pointer"
          >
            <Pen className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  const statusList =
    STATUS_CONFIG.map(
      (config) => ({
        ...config,
        count: Number(
          summary?.stats?.[
            config.value
          ]?.count || 0
        ),
      })
    );
  const statusCount = Object.values(summary?.stats ?? {}).reduce((acc, curr) => acc + curr?.count, 0)

  if (
    currentBacklinkId
  ) {
    return (
      <BacklinkDetailBox
        backlinkId={
          currentBacklinkId
        }
        onClose={() =>
          setCurrentBacklinkId(
            null
          )
        }
      />
    );
  }

  return (
    <>
      {showEditModal &&
        editData && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[500px] rounded-xl shadow-xl p-6 relative">
              <button
                onClick={() =>
                  setShowEditModal(
                    false
                  )
                }
                className="absolute right-4 top-4"
              >
                <X />
              </button>

              <h2 className="text-xl font-semibold mb-6">
                Edit
                Backlink
              </h2>

              <input
                type="text"
                name="post_author_name_c"
                value={
                  editData.post_author_name_c ||
                  ""
                }
                onChange={
                  handleEditChange
                }
                placeholder="Author Name"
                className="w-full border p-2 mb-3 rounded"
              />

              <input
                type="email"
                name="post_author_email_c"
                value={
                  editData.post_author_email_c ||
                  ""
                }
                onChange={
                  handleEditChange
                }
                placeholder="Author Email"
                className="w-full border p-2 mb-3 rounded"
              />

              <input
                type="text"
                name="target_url_c"
                value={
                  editData.target_url_c ||
                  ""
                }
                onChange={
                  handleEditChange
                }
                placeholder="Target URL"
                className="w-full border p-2 mb-3 rounded"
              />

              <input
                type="text"
                name="anchor_text_c"
                value={
                  editData.anchor_text_c ||
                  ""
                }
                onChange={
                  handleEditChange
                }
                placeholder="Anchor Text"
                className="w-full border p-2 mb-3 rounded"
              />

              <input
                type="date"
                name="expiry_date_c"
                value={
                  editData.expiry_date_c ||
                  ""
                }
                onChange={
                  handleEditChange
                }
                className="w-full border p-2 mb-4 rounded"
              />

              <select
                name="link_type"
                value={
                  editData.link_type ||
                  ""
                }
                onChange={
                  handleEditChange
                }
                className="w-full border p-2 mb-6 rounded"
              >
                <option value="dofollow">
                  dofollow
                </option>

                <option value="nofollow">
                  nofollow
                </option>
              </select>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    setShowEditModal(
                      false
                    )
                  }
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    () => handleSaveEdit()
                  }
                  disabled={
                    saving
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

      <TableView
        tableData={backlinks}
        tableName={"Backlinks"}
        columns={
          columns
        }
        slice={
          "backlinks"
        }
        statusList={
          statusList
        }
        statusCount={statusCount}
        pageIndex={
          pageIndex
        }
        pageCount={
          pageCount
        }
        count={count}
        loading={
          loading
        }
        preferences={
          preferences
        }
        refreshKey={[
          "backlinks",
        ]}
        fetchNextPage={() => {
          if (
            hasNextPage &&
            !isFetchingNextPage
          ) {
            fetchNextPage();
          }
        }}
      >
        <TableTitleBar
          Icon={Cable}
          title={
            "Backlinks"
          }
          titleClass={
            "text-teal-700"
          }
        />

        <Table
          headerStyle={
            "bg-teal-600"
          }
          layoutStyle={
            "grid grid-cols-7"
          }
        />
      </TableView>
    </>
  );
}