function addOneWeek(dateStr) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 7);
    
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = String(date.getFullYear()).slice(-2);
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    
    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
}

function addOneMonth(dateStr) {
    const date = new Date(dateStr);
    date.setMonth(date.getMonth() + 1);
    
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = String(date.getFullYear()).slice(-2);
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    
    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
}

export default function Preview({
    data = [],
    type,
    userEmail,
    websiteKey,
    orderID = "order_id",
    amountKey
}) {

    return (
        <>
            <div id="sugar_text_copy-area">
                <table
                    style={{ width: "100%" }}
                    border="0"
                    cellSpacing="0"
                    cellPadding="0"
                    bgcolor="#f9f7f3"
                >
                    <tbody>
                        <tr>
                            <td style={{ padding: "20px" }} width="100%">
                                <table style={{ width: "100%" }} cellSpacing="0" cellPadding="0">
                                    <tbody>
                                        {/* ========================= HEADER ========================= */}
                                        <tr>
                                            <td style={{ padding: "10px" }}>
                                                {/* ========================= PREVIEW CARD ========================= */}
                                                <div
                                                    style={{
                                                        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
                                                        background: "#ffffff",
                                                        padding: "0",
                                                        borderRadius: "16px",
                                                        maxWidth: "650px",
                                                        margin: "0 auto",
                                                        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    {/* HEADER */}
                                                    <div
                                                        style={{
                                                            background: "linear-gradient(135deg, #FFD166 0%, #FFB347 100%)",
                                                            padding: "30px 20px",
                                                            color: "#2c3e50",
                                                            textAlign: "center",
                                                            borderBottom: "1px solid rgba(255,255,255,0.2)",
                                                        }}
                                                    >
                                                        <h1
                                                            style={{
                                                                margin: 0,
                                                                fontSize: "28px",
                                                                fontWeight: "700",
                                                                letterSpacing: "-0.5px",
                                                                color: "#2c3e50",
                                                            }}
                                                        >
                                                            {type} Summary
                                                        </h1>

                                                        {userEmail && (
                                                            <div style={{
                                                                marginTop: "12px",
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: "6px",
                                                                background: "rgba(255,255,255,0.2)",
                                                                padding: "6px 14px",
                                                                borderRadius: "20px",
                                                                fontSize: "13px",
                                                            }}>
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#2c3e50">
                                                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                                                </svg>
                                                                <span>For: <strong>{userEmail}</strong></span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* DEALS CARD */}
                                                    <div
                                                        style={{
                                                            padding: "30px",
                                                        }}
                                                    >
                                                        <div style={{
                                                            marginBottom: "25px",
                                                            paddingBottom: "15px",
                                                            borderBottom: "2px solid #FFD166"
                                                        }}>
                                                            <h3 style={{
                                                                margin: 0,
                                                                fontSize: "18px",
                                                                fontWeight: "600",
                                                                color: "#2c3e50",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "8px"
                                                            }}>
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFB347">
                                                                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                                                                </svg>
                                                                {type} Details
                                                            </h3>
                                                        </div>
                                                        
                                                        <div style={{
                                                            overflow: "hidden",
                                                            borderRadius: "12px",
                                                            border: "1px solid #FFD166",
                                                            boxShadow: "0 3px 10px rgba(255, 209, 102, 0.1)"
                                                        }}>
                                                            <table
                                                                style={{
                                                                    width: "100%",
                                                                    borderCollapse: "collapse",
                                                                }}
                                                            >
                                                                <thead>
                                                                    <tr style={{ 
                                                                        background: "linear-gradient(to right, #FFF9E6, #FFF4D4)",
                                                                        borderBottom: "2px solid #FFD166"
                                                                    }}>
                                                                        <th
                                                                            style={{
                                                                                textAlign: "left",
                                                                                padding: "18px 20px",
                                                                                fontSize: "14px",
                                                                                fontWeight: "700",
                                                                                color: "#2c3e50",
                                                                                letterSpacing: "0.5px",
                                                                            }}
                                                                        >
                                                                            {type == "Orders" ? "OrderID" : "Websites"}
                                                                        </th>
                                                                        <th
                                                                            style={{
                                                                                textAlign: "right",
                                                                                padding: "18px 20px",
                                                                                fontSize: "14px",
                                                                                fontWeight: "700",
                                                                                color: "#2c3e50",
                                                                                letterSpacing: "0.5px",
                                                                            }}
                                                                        >
                                                                            Amount
                                                                        </th>
                                                                        <th
                                                                            style={{
                                                                                textAlign: "right",
                                                                                padding: "18px 20px",
                                                                                fontSize: "14px",
                                                                                fontWeight: "700",
                                                                                color: "#2c3e50",
                                                                                letterSpacing: "0.5px",
                                                                            }}
                                                                        >
                                                                            Expiry Date
                                                                        </th>
                                                                    </tr>
                                                                </thead>

                                                                <tbody>
                                                                    {data.map((d, i) => (
                                                                        <tr
                                                                            key={i}
                                                                            style={{
                                                                                background: i % 2 === 0 ? "#FFFDF6" : "#FFF9E6",
                                                                                borderBottom: i === data.length - 1 ? "none" : "1px solid #FFECB3",
                                                                            }}
                                                                        >
                                                                            <td
                                                                                style={{
                                                                                    padding: "18px 20px",
                                                                                    fontSize: "14px",
                                                                                    color: "#2c3e50",
                                                                                    fontWeight: "500",
                                                                                    borderRight: "1px solid #FFECB3",
                                                                                }}
                                                                            >
                                                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                                    <div style={{
                                                                                        width: "6px",
                                                                                        height: "6px",
                                                                                        borderRadius: "50%",
                                                                                        background: "#06D6A0"
                                                                                    }}></div>
                                                                                    {type == "Orders" ? d[orderID] || "(no Id)" : d[websiteKey] || "(no Site)"}
                                                                                </div>
                                                                            </td>

                                                                            <td
                                                                                style={{
                                                                                    padding: "18px 20px",
                                                                                    textAlign: "right",
                                                                                    fontSize: "14px",
                                                                                    color: "#2c3e50",
                                                                                    fontWeight: "600",
                                                                                    borderRight: "1px solid #FFECB3",
                                                                                }}
                                                                            >
                                                                                ${isNaN(Number(d[amountKey])) ? "0.00" : Number(d[amountKey]).toFixed(2)}
                                                                            </td>
                                                                            <td
                                                                                style={{
                                                                                    padding: "18px 20px",
                                                                                    textAlign: "right",
                                                                                    fontSize: "14px",
                                                                                    color: type === "Deals" ? "#FF9E00" : "#06D6A0",
                                                                                    fontWeight: "600",
                                                                                }}
                                                                            >
                                                                                {type == "Deals" ?
                                                                                    addOneWeek(
                                                                                        d.date_entered_formatted
                                                                                            ? d.date_entered_formatted
                                                                                            : new Date().toLocaleString("en-GB", {
                                                                                                day: "2-digit",
                                                                                                month: "short",
                                                                                                year: "2-digit",
                                                                                                hour: "2-digit",
                                                                                                minute: "2-digit",
                                                                                                hour12: true,
                                                                                            })
                                                                                    )
                                                                                    : addOneMonth(
                                                                                        d.date_entered_formatted
                                                                                            ? d.date_entered_formatted
                                                                                            : new Date().toLocaleString("en-GB", {
                                                                                                day: "2-digit",
                                                                                                month: "short",
                                                                                                year: "2-digit",
                                                                                                hour: "2-digit",
                                                                                                minute: "2-digit",
                                                                                                hour12: true,
                                                                                            })
                                                                                    )}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* ========================= GUIDELINES ========================= */}
                                        {/* ========================= IMPORTANT GUIDELINES (EMAIL SAFE) ========================= */}
<tr>
  <td align="center" style={{ padding: "20px 0" ,background:"#ffffff" }}>
    <table width="650" cellPadding="0" cellSpacing="0" style={{ background:"#ffffff", fontFamily:"Arial, Helvetica, sans-serif" }}>
      <tbody>

        {/* Header */}
        <tr>
          <td style={{ padding:"10px 0 15px", fontSize:"18px", fontWeight:"700", color:"#2c3e50", borderBottom:"2px solid #FFB347" }}>
            Important Guidelines
          </td>
        </tr>

        {[
          "DF Link Spam Must Be Under 7%",
          "Article Duration: 1 year.",
          "Content will undergo AI detection; editorial fees apply if flagged.",
          "Please review the Sample Post",
          "Articles must contain a minimum of 900 words.",
          "We will add 2-3 internal links within a Guest Post for SEO purposes.",
          "Most link insertions are done instantly; guest posts are completed within 1-3 business days."
        ].map((text, index) => (
          <tr key={index}>
            <td style={{ paddingTop:"10px" }}>
              <table width="100%" cellPadding="0" cellSpacing="0" style={{ background:"#FFF9E6", borderLeft:"5px solid #FFB347", borderRadius:"8px" }}>
                <tbody>
                  <tr>
                    {/* Number circle */}
                    <td width="45" align="center" valign="middle">
                      <table width="28" height="28" cellPadding="0" cellSpacing="0" style={{ background:"#FFD166", borderRadius:"50%" }}>
                        <tbody>
                          <tr>
                            <td align="center" valign="middle" style={{ fontSize:"13px", fontWeight:"bold", color:"#2c3e50" }}>
                              {index+1}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>

                    {/* Text */}
                    <td style={{ padding:"12px 10px", fontSize:"14px", color:"#2c3e50", lineHeight:"20px" }}>
                      {text.includes("Sample Post") ? (
                        <>
                          Please review the{" "}
                          <a href="https://www.outrightcrm.com/blog/elead-crm/" style={{ color:"#000",background:"#FF8C00", borderRadius:"9px", padding:"7px",  fontWeight:"bold", textDecoration:"none" }}>
                            Sample Post
                          </a>
                        </>
                      ) : (
                        text
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        ))}

      </tbody>
    </table>
  </td>
</tr>

                                        {/* ========================= PAYMENT SECTION ========================= */}
                                        <tr><td style={{ padding: "20px" }}>&nbsp;</td></tr>

                                        <tr>
                                            <td>
                                                <div style={{
                                                    maxWidth: "650px",
                                                    margin: "0 auto",
                                                    background: "linear-gradient(135deg, #FFFDF6, #FFF9E6)",
                                                    borderRadius: "12px",
                                                    padding: "30px",
                                                    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                                                    border: "1px solid #FFD166"
                                                }}>
                                                    <h3 style={{ 
                                                        color: "#2c3e50",
                                                        fontSize: "18px",
                                                        fontWeight: "700",
                                                        marginBottom: "20px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "10px"
                                                    }}>
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFB347">
                                                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                                                        </svg>
                                                        Payment Methods
                                                    </h3>

                                                    <div style={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: "15px"
                                                    }}>
                                                        <div style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "12px",
                                                            padding: "15px",
                                                            background: "white",
                                                            borderRadius: "8px",
                                                            border: "1px solid #FFECB3"
                                                        }}>
                                                            <div style={{
                                                                width: "40px",
                                                                height: "40px",
                                                                borderRadius: "8px",
                                                                background: "linear-gradient(135deg, #003087, #009cde)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center"
                                                            }}>
                                                                <span style={{ 
                                                                    color: "white", 
                                                                    fontWeight: "bold", 
                                                                    fontSize: "16px" 
                                                                }}>PP</span>
                                                            </div>
                                                            <div>
                                                                <div style={{
                                                                    fontWeight: "600",
                                                                    color: "#2c3e50",
                                                                    marginBottom: "2px"
                                                                }}>PayPal</div>
                                                                <div style={{ color: "#666", fontSize: "14px" }}>
                                                                    <strong>pay@outrightcrm.com</strong>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "12px",
                                                            padding: "15px",
                                                            background: "white",
                                                            borderRadius: "8px",
                                                            border: "1px solid #FFECB3"
                                                        }}>
                                                            <div style={{
                                                                width: "40px",
                                                                height: "40px",
                                                                borderRadius: "8px",
                                                                background: "linear-gradient(135deg, #FF4800, #FF6B35)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center"
                                                            }}>
                                                                <span style={{ 
                                                                    color: "white", 
                                                                    fontWeight: "bold", 
                                                                    fontSize: "16px" 
                                                                }}>PO</span>
                                                            </div>
                                                            <div>
                                                                <div style={{
                                                                    fontWeight: "600",
                                                                    color: "#2c3e50",
                                                                    marginBottom: "2px"
                                                                }}>Payoneer</div>
                                                                <div style={{ color: "#666", fontSize: "14px" }}>
                                                                    <strong>ashish@outrightcrm.com</strong>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* ========================= POLICY LINKS ========================= */}
                                        <tr><td style={{ padding: "20px" }}>&nbsp;</td></tr>

                                        <tr>
                                            <td>
                                                <div style={{
                                                    maxWidth: "650px",
                                                    margin: "0 auto",
                                                    textAlign: "center"
                                                }}>
                                                    <div style={{
                                                        display: "flex",
                                                        gap: "12px",
                                                        justifyContent: "center",
                                                        flexWrap: "wrap"
                                                    }}>
                                                        {[
                                                            ["URL Policy", "https://www.outrightcrm.com/anchor-url-policy-2/"],
                                                            ["Anchor Text Policy", "https://www.outrightcrm.com/anchor-text-policy/"],
                                                            ["Content Policy", "https://www.outrightcrm.com/policy-for-blog-submissions/"],
                                                        ].map(([label, link]) => (
                                                            <a
                                                                key={label}
                                                                style={{
                                                                    padding: "12px 20px",
                                                                    border: "2px solid #FFD166",
                                                                    fontSize: "14px",
                                                                    color: "#2c3e50",
                                                                    textDecoration: "none",
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: "8px",
                                                                    background: "white",
                                                                    borderRadius: "8px",
                                                                    fontWeight: "600",
                                                                    transition: "all 0.3s ease",
                                                                }}
                                                                href={link}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFB347">
                                                                    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                                                                </svg>
                                                                {label}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>

                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}