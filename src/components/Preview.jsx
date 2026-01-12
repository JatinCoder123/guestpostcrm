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
    amountKey

    
}) {

    return (
        <>
            <div id="sugar_text_copy-area">
                <table
                    style={{ maxWidth: "750px", margin : "auto" }}
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
                                                                            Website
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
                                                                                    {d[websiteKey] || "(no website)"}
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

                                      
                                        {/* ========================= IMPORTANT GUIDELINES (EMAIL SAFE) ========================= */}
<tr>
  <td align="center" style={{ padding: "20px 0" , }}>
    <table width="650" cellPadding="0" cellSpacing="0" style={{ background:"#ffffff", fontFamily:"Arial, Helvetica, sans-serif" , padding:"10px" , borderRadius: "10px" ,}}>
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
{/* start by kjl */}
                                        {/* ========================= PAYMENT SECTION ========================= */}
                                     <tr>
  <td align="center" style={{ padding: "20px" }}>
    <table
      width="617"
      cellPadding="0"
      cellSpacing="0"
      border="0"
      style={{
        maxWidth: "617px",
        background: "#FFF9E6",
        borderRadius: "12px",
        border: "1px solid #FFD166",
      }}
    >
      <tbody>
        <tr>
          <td style={{ padding: "30px" }}>
            
            {/* Header */}
            <table width="100%" cellPadding="0" cellSpacing="0" border="0">
              <tbody>
                <tr>
                  <td
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#2c3e50",
                      paddingBottom: "20px",
                    }}
                  >
                    Payment Methods
                  </td>
                </tr>
              </tbody>
            </table>

            {/* PayPal */}
            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              border="0"
              style={{
                background: "#ffffff",
                border: "1px solid #FFECB3",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <tbody>
                <tr>
                  <td width="60" align="center" style={{ padding: "15px" }}>
                    <table
                      width="40"
                      height="40"
                      cellPadding="0"
                      cellSpacing="0"
                      border="0"
                      style={{
                        background: "#003087",
                        borderRadius: "8px",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td
                            align="center"
                            style={{
                              color: "#ffffff",
                              fontWeight: "bold",
                              fontSize: "16px",
                            }}
                          >
                            PP
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  <td style={{ padding: "15px" }}>
                    <table cellPadding="0" cellSpacing="0" border="0">
                      <tbody>
                        <tr>
                          <td
                            style={{
                              fontWeight: "600",
                              color: "#2c3e50",
                              fontSize: "15px",
                            }}
                          >
                            PayPal
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              fontSize: "14px",
                              color: "#666",
                              textDecoration: "none",
                            }}
                          >
                            <strong>pay@outrightcrm.com</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Payoneer */}
            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              border="0"
              style={{
                background: "#ffffff",
                border: "1px solid #FFECB3",
                borderRadius: "8px",
              }}
            >
              <tbody>
                <tr>
                  <td width="60" align="center" style={{ padding: "15px" }}>
                    <table
                      width="40"
                      height="40"
                      cellPadding="0"
                      cellSpacing="0"
                      border="0"
                      style={{
                        background: "#FF6B35",
                        borderRadius: "8px",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td
                            align="center"
                            style={{
                              color: "#ffffff",
                              fontWeight: "bold",
                              fontSize: "16px",
                            }}
                          >
                            PO
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  <td style={{ padding: "15px" }}>
                    <table cellPadding="0" cellSpacing="0" border="0">
                      <tbody>
                        <tr>
                          <td
                            style={{
                              fontWeight: "600",
                              color: "#2c3e50",
                              fontSize: "15px",
                            }}
                          >
                            Payoneer
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              fontSize: "14px",
                              color: "#666",
                              textDecoration: "none",
                            }}
                          >
                            <strong>ashish@outrightcrm.com</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

          </td>
        </tr>
      </tbody>
    </table>
  </td>
</tr>


                                        {/* ========================= POLICY LINKS ========================= */}
                                        <tr><td style={{ padding: "20px" }}>&nbsp;</td></tr>

                                     <tr>
  <td align="center" style={{ padding: "20px" }}>
    <table
      width="650"
      cellPadding="0"
      cellSpacing="0"
      border="0"
      style={{ maxWidth: "650px", margin: "0 auto" }}
    >
      <tbody>
        <tr>
          <td align="center">
            <table cellPadding="0" cellSpacing="0" border="0">
              <tbody>
                <tr>

                  {/* URL Policy */}
                  <td align="center" style={{ padding: "6px" }}>
                    <a
                      href="https://www.outrightcrm.com/anchor-url-policy-2/"
                      style={{
                        display: "inline-block",
                        padding: "12px 20px",
                        border: "2px solid #FFD166",
                        fontSize: "14px",
                        color: "#2c3e50",
                        textDecoration: "none",
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                      }}
                    >
                      URL Policy
                    </a>
                  </td>

                  {/* Anchor Text Policy */}
                  <td align="center" style={{ padding: "6px" }}>
                    <a
                      href="https://www.outrightcrm.com/anchor-text-policy/"
                      style={{
                        display: "inline-block",
                        padding: "12px 20px",
                        border: "2px solid #FFD166",
                        fontSize: "14px",
                        color: "#2c3e50",
                        textDecoration: "none",
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Anchor Text Policy
                    </a>
                  </td>

                  {/* Content Policy */}
                  <td align="center" style={{ padding: "6px" }}>
                    <a
                      href="https://www.outrightcrm.com/policy-for-blog-submissions/"
                      style={{
                        display: "inline-block",
                        padding: "12px 20px",
                        border: "2px solid #FFD166",
                        fontSize: "14px",
                        color: "#2c3e50",
                        textDecoration: "none",
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Content Policy
                    </a>
                  </td>   

                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </td>
</tr>
{/* by kjl */}
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


