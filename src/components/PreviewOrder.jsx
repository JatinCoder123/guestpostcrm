export default function PreviewOrder({ data = [], userEmail }) {
  if (!data || data.length === 0) {
    return (
      <table width="100%" cellPadding="0" cellSpacing="0" style={noDataStyle}>
        <tbody>
          <tr>
            <td align="center" style={{ padding: "40px" }}>
              <div style={{ fontSize: "18px", color: "#6b7280", fontWeight: "600" }}>
                No order data available
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  const order = data[0];

  return (
    <table
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        backgroundColor: "#ffffff",
        lineHeight: "1.5",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <tbody>
        <tr>
          <td align="center">

            {/* HEADER */}
            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              style={{
                background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                padding: "24px 0",
                marginBottom: "32px",
                borderRadius: "10px",
              }}
            >
              <tbody>
                <tr>
                  <td align="center">
                    <div style={{ fontSize: "32px", fontWeight: "800", color: "#fff" }}>
                      Order #{order.order_id || "N/A"}
                    </div>

                    {order.date_entered_formatted && (
                      <div style={{ fontSize: "16px", color: "#e5e7eb", marginTop: "8px" }}>
                        {order.date_entered_formatted}
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* BODY */}
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth: "700px" }}>
              <tbody>

                {/* Client */}
                <tr>
                  <td style={{ padding: "0 24px 32px" }}>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#4b5563" }}>
                      Client Information
                    </div>

                    <div
                      style={{
                        fontSize: "18px",
                        background: "#f3f4f6",
                        padding: "16px",
                        borderRadius: "10px",
                        fontWeight: "700",
                      }}
                    >
                      {order.client_email || userEmail || "No email provided"}
                    </div>
                  </td>
                </tr>

                {/* Order Details */}
                <tr>
                  <td style={{ padding: "0 24px" }}>
                    <div style={{ fontSize: "22px", fontWeight: "800", marginBottom: "16px" }}>
                      Order Details
                    </div>

                    <table width="100%">
                      <tbody>
                        <tr>
                          <td width="50%" style={{ paddingRight: "10px" }}>
                            <div style={detailBox}>
                              <div style={detailLabel}>Status</div>
                              <span style={statusPill(order.order_status)}>
                                {order.order_status || "pending"}
                              </span>
                            </div>
                          </td>

                          <td width="50%" style={{ paddingLeft: "10px" }}>
                            <div style={detailBox}>
                              <div style={detailLabel}>Total Amount</div>
                              <div style={amountValue}>
                                ${order.total_amount_c || "0.00"}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ marginTop: "20px" }}>
                      <div style={infoItem}>
                        <b>Order Type:</b> {order.order_type || "-"}
                      </div>
                      <div style={infoItem}>
                        <b>Website:</b> {order.website_c || "-"}
                      </div>
                      <div style={infoItem}>
                        <b>Anchor:</b> {order.anchor_text_c || "-"}
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Dates */}
                <tr>
                  <td style={{ padding: "24px" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700" }}>Dates</div>
                    <div style={infoItem}>
                      Created: {order.date_entered_formatted || "-"}
                    </div>
                    <div style={infoItem}>
                      Updated: {order.date_modified_formatted || "-"}
                    </div>
                    {order.expiry_date && (
                      <div style={infoItem}>
                        Expiry: {order.expiry_date}
                      </div>
                    )}
                  </td>
                </tr>

           
                <tr>
                  <td align="center" style={{ paddingBottom: "40px" }}>
                    {order.invoice_link_c ? (
                      <a
                        href={order.invoice_link_c}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={invoiceBtn}
                      >
                        📄 View Invoice
                      </a>
                    ) : (
                      <div style={noInvoice}>Invoice not available</div>
                    )}
                  </td>
                </tr>

              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}


const noDataStyle = {
  background: "#f9fafb",
  padding: "40px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
};

const statusPill = (status) => ({
  padding: "6px 14px",
  borderRadius: "20px",
  fontWeight: "700",
  background:
    status === "paid" ? "#d1fae5" : status === "new" ? "#fef3c7" : "#fee2e2",
});

const detailBox = {
  background: "#f8fafc",
  padding: "16px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const detailLabel = { fontSize: "12px", color: "#6b7280" };

const amountValue = { fontSize: "20px", fontWeight: "800", color: "#059669" };

const infoItem = {
  padding: "10px",
  background: "#f9fafb",
  borderRadius: "8px",
  marginTop: "8px",
};

const invoiceBtn = {
  padding: "14px 32px",
  background: "#2563eb",
  color: "#fff",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: "700",
};

const noInvoice = {
  color: "#9ca3af",
  background: "#f9fafb",
  padding: "12px",
  borderRadius: "8px",
};
