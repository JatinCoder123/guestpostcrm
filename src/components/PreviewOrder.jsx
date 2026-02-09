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

            <tr>
              <td
                colSpan="2"
                style={{
                  padding: "8px",
                  fontSize: "13px",
                  color: "#374151",
                }}
              >
                📄 <strong>Document URL:</strong> {item.document_url}
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
  const tableHtml = renderToString(
    <BuildOrderLinkTable data={order?.seo_backlinks} />
  );

  html = html
    .replace("{{ORDER_ID}}", order?.order_id)
    .replace("{{NAME}}", userEmail)
    .replace("{{DATE}}", order?.date_entered_formatted)
    .replace("{{STATUS}}", order?.order_status)
    .replace("{{WEBSITE}}", order?.website_c)
    .replace("{{ORDER_TYPE}}", order?.order_type)
    .replace("{{CLIENT_EMAIL}}", order?.client_email)
    .replace("{{AMOUNT}}", order?.total_amount_c)
    .replace("{{LINKS}}", tableHtml)
    .replace("%7B%7BINVOICE_LINK%7D%7D", order.invoice_link_c);
  return html;
}
