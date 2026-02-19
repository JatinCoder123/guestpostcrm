import { renderToString } from "react-dom/server";

import React from "react";

const BuildOrderLinkTable = ({ data }) => {
  return (
    <>
      {data?.map((item, index) => (
        <table
          key={index}
          width="100%"
          cellSpacing="0"
          cellPadding="0"
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "14px",
            marginBottom: "12px",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  fontWeight: "bold",
                  color: "#111827",
                }}
              >
                {item.name}
              </td>

              <td align="right">
                <span
                  style={{
                    background: "#fef3c7",
                    color: "#92400e",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  {item.status_c}
                </span>
              </td>
            </tr>

            <tr>
              <td
                colSpan="2"
                style={{
                  padding: "8px",
                  fontSize: "13px",
                  color: "#374151",
                }}
              >
                🔗 <strong>Backlink URL:</strong> {item.backlink_url}
              </td>
            </tr>
            {item.type_c == "LI" ? (
              <tr>
                <td
                  colSpan="2"
                  style={{
                    padding: "8px",
                    fontSize: "13px",
                    color: "#374151",
                  }}
                >
                  🔗 <strong>Target URL:</strong> {item.target_url_c}
                </td>
              </tr>
            ) : (
              <tr>
                <td
                  colSpan="2"
                  style={{
                    padding: "8px",
                    fontSize: "13px",
                    color: "#374151",
                  }}
                >
                  📄 <strong>Document URL:</strong> {item.gp_doc_url_c}
                </td>
              </tr>
            )}

            <tr>
              <td
                colSpan="2"
                style={{
                  padding: "8px",
                  fontSize: "13px",
                  color: "#374151",
                }}
              >
                💰 <strong>Amount:</strong> {item.link_amount_c}
              </td>
            </tr>
          </tbody>
        </table>
      ))}
    </>
  );
};

export const createPreviewOrder = ({ templateData, order, userEmail }) => {
  let html = templateData?.[0]?.body_html || "";
  const dofollowLink = order?.seo_backlinks?.find(l => l?.link_type == "dofollow")
  html = html
    .replace("{{ORDER_ID}}", order?.order_id)
    .replace("{{NAME}}", userEmail)
    .replace("{{DATE}}", order?.date_entered_formatted)
    .replace("{{STATUS}}", order?.order_status)
    .replace("{{ORDER_TYPE}}", order?.order_type)
    .replace("{{AMOUNT}}", order?.total_amount_c)
    .replace("{{LINK_backlink_url}}", dofollowLink?.backlink_url ?? "")
    .replace("{{LINK_NAME}}", dofollowLink?.name ?? "")
    .replace("{{LINK_gp_doc_url_c}}", dofollowLink?.gp_doc_url_c ?? "")
    .replace("{{LINK_target_url_c}}", dofollowLink?.target_url_c ?? "")
    .replace("{{LINK_anchor_text_c}}", dofollowLink?.anchor_text_c ?? "")
    .replace("{{Invoice_link}}", order?.invoice_link_c ?? "");
  return html;
};
const InvoiceButton = ({ order }) => {
  return (
    <>
      {order?.order_status === "rejected_nontechnical" ||
        order?.order_status === "wrong" ? (
        <p></p>
      ) : (
        <tr>
          <td style={{ padding: "32px" }} align="center">
            <a
              style={{
                background: "#2563eb",
                color: "#ffffff",
                padding: "14px 36px",
                textDecoration: "none",
                fontWeight: 800,
              }}
              href={order?.invoice_link_c}
            >
              View Invoice
            </a>
          </td>
        </tr>
      )}
    </>
  );
};

{
  /*  */
}
