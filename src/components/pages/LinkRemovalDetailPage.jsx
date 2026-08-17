import { ArrowDownToDot, ArrowLeft, ExternalLink, LoaderCircle, PlusCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  useBacklink,
  useExtractedBlogLinks,
  useUpdateBacklink,
} from "../../queries/backlinks.queries";
import IconButton from "../ui/Buttons/IconButton";

const Link = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex max-w-full items-center gap-1 text-blue-600 hover:underline"
  >
    <span className="truncate">{children}</span>
    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
  </a>
);

export default function LinkRemovalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: backlink, isPending: isBacklinkLoading } = useBacklink(id);
  const sourceUrl = backlink?.records?.[0]?.source_url_c;
  const currentBacklinkUrl = backlink?.records?.[0]?.backlink_url_c;
  console.log("backlink", sourceUrl, backlink);
  const {
    data: extraction,
    isPending: isExtractionLoading,
    error: extractionError,
  } = useExtractedBlogLinks(sourceUrl);
  console.log("extraction", extraction);
  const { mutate: updateBacklink, isPending: isUpdating } = useUpdateBacklink();

  const selectedAnchor = String(backlink?.anchor_text_c || "")
    .trim()
    .toLowerCase();
  const links = Array.isArray(extraction?.links) ? extraction.links : [];

  const updateSelectedAnchorStatus = (status_c) => {
    updateBacklink(
      { id: id, status_c },
      {
        onSuccess: (response) => {
          if (response?.success === false) {
            toast.error(response.message || "Could not update the link.");
            return;
          }
          toast.success(`Link marked as ${status_c.toLowerCase()}.`);
          if (status_c === "Removed") navigate("/link-removal");
        },
        onError: (error) =>
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Could not update the link.",
          ),
      },
    );
  };

  if (isBacklinkLoading) {
    return <div className="p-8 text-slate-600">Loading record…</div>;
  }

  if (!backlink) {
    return (
      <div className="p-8 text-slate-600">Link-removal record not found.</div>
    );
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <button
        type="button"
        onClick={() => navigate("/link-removal")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Link Removal
      </button>
      <section className="rounded-xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div>
            <h2 className="font-bold text-slate-900">Extracted links</h2>
            <p className="mt-1 text-sm text-slate-500">
              {isExtractionLoading
                ? "Fetching links…"
                : `${extraction?.total_links ?? links.length} links found`}
            </p>
          </div>
          {extraction?.final_url && (
            <Link href={extraction.final_url}>{extraction.final_url}</Link>
          )}
        </div>

        {isExtractionLoading && (
          <div className="flex items-center gap-2 p-5 text-slate-600">
            <LoaderCircle className="h-5 w-5 animate-spin" /> Fetching the
            latest link details…
          </div>
        )}
        {extractionError && (
          <div className="p-5 text-sm text-red-700">
            {extractionError.message ||
              "Could not fetch links from this source URL."}
          </div>
        )}
        {!isExtractionLoading && !extractionError && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Anchor text</th>
                  <th className="px-5 py-3">Backlink URL</th>
                  <th className="px-5 py-3">Source URL</th>
                  <th className="px-5 py-3">Rel</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link, index) => {
                  const isSelectedAnchor =
                    String(link.anchor_text || "")
                      .trim()
                      .toLowerCase() === selectedAnchor;
                  return (
                    <tr
                      key={`${link.anchor_text}-${link.target_url}-${index}`}
                      className="border-t"
                    >
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {link.anchor_text || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <Link href={link.target_url}>{link.target_url}</Link>
                      </td>
                      <td className="px-5 py-4">
                        <Link href={link.source_url}>{link.source_url}</Link>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {link.rel || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex ">   
                            {currentBacklinkUrl===link.target_url && (
                              <IconButton
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  updateSelectedAnchorStatus("Removed")
                                }
                              label="Removed"
                              iconColor="red"
                              icon={Trash2}
                              loading={isUpdating}
                            />
                )}
                           
                          </div>
                      </td>
                    </tr>
                  );
                })}
                {links.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No links were returned for this source URL.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
