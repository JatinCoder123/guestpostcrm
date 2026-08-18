import {
  ArrowLeft,
  Check,
  ExternalLink,
  LoaderCircle,
  X,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

import {
  useBacklink,
  useExtractedBlogLinks,
  useUpdateBacklink,
} from "../../queries/backlinks.queries";

import IconButton from "../ui/Buttons/IconButton";
import {
  getOrderById,
} from "../../api/orders.api";
import {
  getInvoiceById,
} from "../../api/invoice.api";

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

/**
 * Timeline step
 */
const TimelineStep = ({
  title,
  status = "loading",
  description,
}) => {
  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="relative flex gap-4">
      {/* Icon */}
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-[#09090b]">
        {isLoading && (
          <LoaderCircle className="h-4 w-4 animate-spin text-black-300" />
        )}

        {isSuccess && (
          <Check className="h-4 w-4 text-slate-100" />
        )}

        {isError && (
          <X className="h-4 w-4 text-red-400" />
        )}
      </div>

      {/* Content */}
      <div className="pb-8">
        <h4 className="text-sm font-semibold text-black-100">
          {title}
        </h4>

        {description && (
          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default function LinkRemovalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showOrderPopup, setShowOrderPopup] = useState(false);

  const [checkingOrder, setCheckingOrder] = useState(false);
  const [orderChecked, setOrderChecked] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");

  const [checkingInvoice, setCheckingInvoice] = useState(false);
  const [invoiceChecked, setInvoiceChecked] = useState(false);
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);
  const [invoiceStatus, setInvoiceStatus] = useState("");

  const [invoiceId, setInvoiceId] = useState(null);


  const [processError, setProcessError] = useState("");

  const { data, isPending: isBacklinkLoading } = useBacklink(id);

  const backlink = data?.records?.[0];

  const sourceUrl = backlink?.source_url_c;
  const currentBacklinkUrl = backlink?.backlink_url_c;

  const {
    data: extraction,
    isPending: isExtractionLoading,
    error: extractionError,
  } = useExtractedBlogLinks(sourceUrl);

  const { mutate: updateBacklink, isPending: isUpdating } =
    useUpdateBacklink();

  const selectedAnchor = String(backlink?.anchor_text_c || "")
    .trim()
    .toLowerCase();

  const links = Array.isArray(extraction?.links)
    ? extraction.links
    : [];

  /**
   * Reset popup state
   */
  const resetPopupState = () => {
    setShowOrderPopup(false);

    setCheckingOrder(false);
    setOrderChecked(false);
    setOrderSuccess(false);
    setOrderStatus("");

    setCheckingInvoice(false);
    setInvoiceChecked(false);
    setInvoiceSuccess(false);
    setInvoiceStatus("");

    setInvoiceId(null);
    setProcessError("");
  };

  /**
   * Close popup
   */
  const closePopup = () => {
    resetPopupState();
    navigate("/link-removal");
  };

  /**
   * Start order + invoice verification
   *
   * IMPORTANT:
   * This is called ONLY after the backlink has already
   * been successfully updated/deleted.
   */
  const checkOrderAndInvoice = async () => {
    setShowOrderPopup(true);

    setCheckingOrder(true);
    setOrderChecked(false);

    try {
      /**
       * -----------------------------------------
       * STEP 1: GET ORDER
       * -----------------------------------------
       */
      const orderResponse = await getOrderById(
        backlink.order_id
      );

      console.log("Order response:", orderResponse);

      const order = orderResponse?.records?.[0];

      console.log("Order:", order);

      if (!order) {
        throw new Error("Order was not found.");
      }

      const currentOrderStatus = String(
        order?.order_status || ""
      )
        .trim()
        .toLowerCase();

      setOrderStatus(order?.order_status || "");

      /**
       * Change this if your actual expected value
       * is different.
       */
      const isDefaultOrder =
        currentOrderStatus === "default" ||
        currentOrderStatus === "defaulter" ||
        currentOrderStatus === "defauilt";

      setOrderSuccess(isDefaultOrder);
      setOrderChecked(true);
      setCheckingOrder(false);

      /**
       * -----------------------------------------
       * STEP 2: GET INVOICE ID
       * -----------------------------------------
       *
       * Adjust this according to the actual field
       * returned by your order API.
       */
      const foundInvoiceId =
        backlink?.invoice_record_id

      if (!foundInvoiceId) {
        setCheckingInvoice(false);
        setInvoiceChecked(true);
        setInvoiceSuccess(false);
        setInvoiceStatus("Invoice ID not found");

        return;
      }

      setInvoiceId(foundInvoiceId);

      /**
       * -----------------------------------------
       * STEP 3: GET INVOICE
       * -----------------------------------------
       */
      setCheckingInvoice(true);

      const invoiceResponse = await getInvoiceById(
        foundInvoiceId
      );

      console.log("Invoice response:", invoiceResponse);

      const invoice =
        invoiceResponse?.records?.[0] 

      console.log("Invoice:", invoice);

      if (!invoice) {
        throw new Error("Invoice was not found.");
      }

      const currentInvoiceStatus = String(
        invoice?.status ||
          invoice?.invoice_status ||
          invoice?.status_c ||
          ""
      )
        .trim()
        .toLowerCase();

      setInvoiceStatus(
        invoice?.status ||
          invoice?.invoice_status ||
          invoice?.status_c ||
          ""
      );

      /**
       * Invoice passes only when cancelled.
       */
      const isCancelled =
        currentInvoiceStatus === "cancelled";

      setInvoiceSuccess(isCancelled);
      setInvoiceChecked(true);
      setCheckingInvoice(false);
    } catch (error) {
      console.error(
        "Order / invoice verification failed:",
        error
      );

      setProcessError(
        error?.response?.data?.message ||
          error?.message ||
          "Could not complete order/invoice verification."
      );

      if (checkingOrder) {
        setCheckingOrder(false);
        setOrderChecked(true);
        setOrderSuccess(false);
      }

      if (checkingInvoice) {
        setCheckingInvoice(false);
        setInvoiceChecked(true);
        setInvoiceSuccess(false);
      }
    }
  };

  /**
   * -----------------------------------------
   * REMOVE LINK FIRST
   * -----------------------------------------
   *
   * Popup is NOT opened here.
   *
   * First:
   *   update backlink -> Removed
   *
   * Then:
   *   open popup
   *   check order
   *   check invoice
   */
  const updateSelectedAnchorStatus = () => {
    if (!backlink || isUpdating) return;

    updateBacklink(
      {
        id,
        status_c: "Removed",
      },
      {
        onSuccess: async (response) => {
          console.log(
            "Backlink update response:",
            response
          );

          if (response?.success === false) {
            toast.error(
              response.message ||
                "Could not remove the link."
            );

            return;
          }

          /**
           * LINK IS NOW REMOVED.
           *
           * Only now show popup.
           */
          toast.success("Link removed successfully.");

          await checkOrderAndInvoice();
        },

        onError: (error) => {
          console.error(
            "Failed to remove backlink:",
            error
          );

          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Could not remove the link."
          );
        },
      }
    );
  };

  if (isBacklinkLoading) {
    return (
      <div className="p-8 text-slate-600">
        Loading record…
      </div>
    );
  }

  if (!backlink) {
    return (
      <div className="p-8 text-slate-600">
        Link-removal record not found.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5 p-4 md:p-6">
        <button
          type="button"
          onClick={() => navigate("/link-removal")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Link Removal
        </button>

        <section className="rounded-xl border bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
            <div>
              <h2 className="font-bold text-slate-900">
                Extracted links
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {isExtractionLoading
                  ? "Fetching links…"
                  : `${
                      extraction?.total_links ??
                      links.length
                    } links found`}
              </p>
            </div>

            {extraction?.final_url && (
              <Link href={extraction.final_url}>
                {extraction.final_url}
              </Link>
            )}
          </div>

          {isExtractionLoading && (
            <div className="flex items-center gap-2 p-5 text-slate-600">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Fetching the latest link details…
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
                    <th className="px-5 py-3">
                      Anchor text
                    </th>

                    <th className="px-5 py-3">
                      Backlink URL
                    </th>

                    <th className="px-5 py-3">
                      Source URL
                    </th>

                    <th className="px-5 py-3">
                      Rel
                    </th>

                    <th className="px-5 py-3">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {links.map((link, index) => {
                    const isSelectedAnchor =
                      String(link.anchor_text || "")
                        .trim()
                        .toLowerCase() ===
                      selectedAnchor;

                    return (
                      <tr
                        key={`${link.anchor_text}-${link.target_url}-${index}`}
                        className={`border-t ${
                          isSelectedAnchor
                            ? "bg-red-50"
                            : "bg-white"
                        }`}
                      >
                        <td className="px-5 py-4 font-medium text-slate-800">
                          {link.anchor_text || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <Link href={link.target_url}>
                            {link.target_url}
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          <Link href={link.source_url}>
                            {link.source_url}
                          </Link>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {link.rel || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex">
                            {currentBacklinkUrl ===
                              link.target_url && (
                              <IconButton
                                type="button"
                                disabled={isUpdating}
                                onClick={
                                  updateSelectedAnchorStatus
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
                        No links were returned for this
                        source URL.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          ORDER + INVOICE VERIFICATION POPUP
          ===================================================== */}
{showOrderPopup && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md">
    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-7 py-7 text-white">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl" />
        <div className="absolute -bottom-12 left-16 h-32 w-32 rounded-full bg-cyan-400/10 blur-2xl" />

        <div className="relative flex items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-xl shadow-lg">
              🔍
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">
                Link Removal Verification
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight">
                Order & Invoice Validation
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                Verifying the linked CRM order and invoice before completing
                the removal process.
              </p>
            </div>
          </div>

          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-100">
            Verification
          </span>
        </div>
      </div>

      <div className="bg-slate-50 px-7 py-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Backlink URL
            </p>
            <a
              href={currentBacklinkUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block truncate text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              title={currentBacklinkUrl}
            >
              {currentBacklinkUrl || "Not available"}
            </a>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Order ID
            </p>
            <p className="mt-2 truncate font-mono text-sm font-semibold text-slate-800">
              {backlink?.order_id || "Not available"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Invoice ID
            </p>
            <p className="mt-2 truncate font-mono text-sm font-semibold text-slate-800">
              {backlink?.invoice_record_id || "Not available"}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h4 className="font-semibold text-slate-900">
                Verification progress
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Status is fetched directly from CRM records.
              </p>
            </div>

            {(checkingOrder || checkingInvoice) && (
              <span className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                Checking
              </span>
            )}
          </div>

          <div className="space-y-1">
            <TimelineStep
              title="Backlink Removed"
              status="success"
              description="The backlink record was successfully removed."
            />

            <TimelineStep
              title="Order Status Verification"
              status={
                checkingOrder
                  ? "loading"
                  : orderChecked
                  ? orderSuccess
                    ? "success"
                    : "error"
                  : "loading"
              }
              description={
                checkingOrder
                  ? "Fetching the linked order record..."
                  : orderChecked
                  ? orderStatus
                    ? `Current order status: ${orderStatus}`
                    : "Order status was not found."
                  : "Waiting for order verification..."
              }
            />

            <TimelineStep
              title="Invoice Status Verification"
              status={
                checkingInvoice
                  ? "loading"
                  : invoiceChecked
                  ? invoiceSuccess
                    ? "success"
                    : "error"
                  : "loading"
              }
              description={
                checkingInvoice
                  ? "Fetching the linked invoice record..."
                  : invoiceChecked
                  ? invoiceStatus
                    ? `Current invoice status: ${invoiceStatus}`
                    : "Invoice status was not found."
                  : "Waiting for invoice verification..."
              }
            />
          </div>
        </div>

        {processError && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span className="mt-0.5 text-base">⚠</span>
            <div>
              <p className="font-semibold">Verification issue</p>
              <p className="mt-1 text-xs leading-5">{processError}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-7 py-5">
        <p className="text-xs text-slate-400">
          Order must be <span className="font-semibold">defaulter</span> and
          invoice must be <span className="font-semibold">CANCELLED</span>.
        </p>

        {!checkingOrder &&
          !checkingInvoice &&
          (orderChecked || invoiceChecked) && (
            <button
              type="button"
              onClick={closePopup}
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md"
            >
              Done
            </button>
          )}
      </div>
    </div>
  </div>
)}
    </>
  );
}