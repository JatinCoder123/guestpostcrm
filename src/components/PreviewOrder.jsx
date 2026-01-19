export default function PreviewOrder({ data = [], userEmail }) {
  if (!data || data.length === 0) {
    return (
      <table width="100%" cellPadding="0" cellSpacing="0" style={noDataStyle}>
        <tbody>
          <tr>
            <td align="center" style={{}}>
              <div
                style={{
                  fontSize: "18px",
                  color: "#6b7280",
                  fontWeight: "600",
                }}
              >
                No order data availablew
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  const order = data[0];
  const status = String(order.order_status || "").toLowerCase();

  const rawName = order.real_name || "";
  const userName = rawName.split("<")[0].trim() || "Customer";

  const backlinks = Array.isArray(order.seo_backlinks)
    ? order.seo_backlinks
    : [];

  const gpBacklinks = backlinks.filter(
    (b) => String(b.type_c || "").toUpperCase() === "GP"
  );

  const liBacklinks = backlinks.filter(
    (b) => String(b.type_c || "").toUpperCase() === "LI"
  );

  return (
    <table
      width="100%"
      align="center"
      cellPadding="0"
      cellSpacing="0"
      style={container}
    >
      <tbody>
        <tr>
          <td>
            {/* ================= HEADER ================= */}
            <table width="100%" cellPadding="0" cellSpacing="0" style={header}>
              <tbody>
                <tr>
                  <td align="center">
                    <div style={headerTitle}>OrderID #{order.order_id}</div>
                    <div style={headerUser}>👤 {userName}</div>
                    <div style={headerDate}>{order.date_entered_formatted}</div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ================= ORDER SUMMARY ================= */}
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <tr>
                  <td style={sectionPadding}>
                    <div style={card}>
                      <div style={cardTitle}>
                        🧾 Order Summary
                        {/* <span style={statusBadge(order.order_status)}>
                          {order.order_status}
                        </span> */}
                      </div>

                      <table width="100%">
                        <tbody>
                          <tr>
                            <td style={label}>Status</td>
                            <td style={value}>
                              {order.order_status || OrderStatus}
                            </td>
                          </tr>
                          <tr>
                            <td style={label}>Client Email</td>
                            <td style={value}>
                              {order.client_email || userEmail}
                            </td>
                          </tr>
                          <tr>
                            <td style={label}>Website</td>
                            <td style={value}>{order.website_c}</td>
                          </tr>
                          <tr>
                            <td style={label}>Order Type</td>
                            <td style={value}>{order.order_type}</td>
                          </tr>
                          <tr>
                            <td style={label}>Total Amount</td>
                            <td style={value}>${order.total_amount_c}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>

                {/* ================= GP BACKLINKS ================= */}
                {gpBacklinks.length > 0 && (
                  <tr>
                    <td style={sectionPadding}>
                      <h3 style={gpTitle}>📝 Guest Posts (GP)</h3>
                      {gpBacklinks.map((link, i) => (
                        <BacklinkRow key={i} link={link} />
                      ))}
                    </td>
                  </tr>
                )}

                {/* ================= LI BACKLINKS ================= */}
                {liBacklinks.length > 0 && (
                  <tr>
                    <td style={sectionPadding}>
                      <h3 style={liTitle}>🔗 Link Insertions (LI)</h3>
                      {liBacklinks.map((link, i) => (
                        <BacklinkRow key={i} link={link} />
                      ))}
                    </td>
                  </tr>
                )}

                {/* ================= INVOICE ================= */}
                <tr>
                  <td align="center" style={{ padding: "32px" }}>
                    {console.log(order.invoice_link_c)}
                    <a
                      href={order.invoice_link_c}
                      target="_blank"
                      style={invoiceBtn}
                    >
                      Pay Now
                    </a>
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

/* ================= BACKLINK CARD ================= */
const BacklinkRow = ({ link }) => {
  const type = String(link.type_c || "").toUpperCase();

  return (
    <table width="100%" cellPadding="0" cellSpacing="0" style={backlinkCard}>
      <tbody>
        <tr>
          <td style={backlinkTitle}>{link.name}</td>
          <td align="right">
            <span style={statusBadge(link.status_c)}>{link.status_c}</span>
          </td>
        </tr>

        <tr>
          <td colSpan="2" style={row}>
            🔗 <strong>Backlink URL:</strong>
            <br />
            {link.backlink_url || "N/A"}
          </td>
        </tr>

        {/* ✅ ONLY SHOW ANCHOR TEXT FOR LI */}
        {type === "LI" && (
          <tr>
            <td colSpan="2" style={row}>
              🏷️ <strong>Anchor Text:</strong>{" "}
              <span style={anchorBadge}>{link.anchor_text_c || "N/A"}</span>
            </td>
          </tr>
        )}

        <tr>
          <td colSpan="2" style={row}>
            📄 <strong>Document URL:</strong>
            <br />
            {link.gp_doc_url_c || "N/A"}
          </td>
        </tr>

        <tr>
          <td colSpan="2" style={row}>
            💰 <strong>Amount:</strong> {link.link_amount_c}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

/* ================= STYLES ================= */

const container = {
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  background: "#ffffff",
  fontFamily: "'Inter', Arial, sans-serif",
};

const header = {
  background: "linear-gradient(135deg,#1e40af,#2563eb)",
  padding: "34px 0",
};

const headerTitle = {
  fontSize: "30px",
  color: "#ffffff",
  fontWeight: "800",
};

const headerUser = {
  marginTop: "6px",
  color: "#dbeafe",
  fontWeight: "600",
};

const headerDate = {
  marginTop: "4px",
  color: "#bfdbfe",
  fontSize: "13px",
};

const sectionPadding = {
  padding: "22px",
};

const card = {
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "20px",
};

const cardTitle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "14px",
  fontWeight: "800",
  color: "#1e40af",
};

const label = {
  padding: "8px 0",
  color: "#374151",
  fontWeight: "600",
};

const value = {
  padding: "8px 0",
  textAlign: "right",
  fontWeight: "700",
};

const gpTitle = {
  color: "#1e40af",
  marginBottom: "10px",
};

const liTitle = {
  color: "#1e40af",
  marginBottom: "10px",
};

const backlinkCard = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "14px",
  marginBottom: "12px",
};

const backlinkTitle = {
  fontWeight: "700",
  color: "#111827",
};

const row = {
  padding: "8px",
  fontSize: "13px",
  color: "#374151",
};

const anchorBadge = {
  background: "#e0f2fe",
  color: "#075985",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: "700",
};

const invoiceBtn = {
  background: "#2563eb",
  color: "#ffffff",
  padding: "14px 36px",
  borderRadius: "10px",
  textDecoration: "none",
  fontWeight: "800",
  display: "inline-block",
};

const statusBadge = (status) => ({
  background:
    String(status).toLowerCase() === "paid" ||
      String(status).toLowerCase() === "completed" ||
      String(status).toLowerCase() === "live"
      ? "#dcfce7"
      : "#fef3c7",
  color:
    String(status).toLowerCase() === "paid" ||
      String(status).toLowerCase() === "completed" ||
      String(status).toLowerCase() === "live"
      ? "#166534"
      : "#92400e",
  padding: "4px 12px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: "700",
});

const noDataStyle = {
  background: "#f9fafb",
  padding: "40px",
  borderRadius: "12px",
};