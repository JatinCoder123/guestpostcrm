export default function Preview({
    data = [],
    type,
    totalAmount = 0,
    userEmail
}) {
    return (
        <>
            <p>&nbsp;</p>
            <p>&nbsp;</p>

            <div id="sugar_text_copy-area">
                <table
                    style={{ width: "100%" }}
                    border="0"
                    cellSpacing="0"
                    cellPadding="0"
                    bgcolor="#eef4ff"
                >
                    <tbody>
                        <tr>
                            <td style={{ padding: "30px" }} width="100%">
                                <table style={{ width: "100%" }} cellSpacing="0" cellPadding="0">
                                    <tbody>

                                        {/* ========================= HEADER ========================= */}
                                        <tr>
                                            <td
                                                style={{
                                                    padding: "10px",
                                                }}
                                            >


                                                {/* ========================= PREVIEW CARD ========================= */}
                                                <div
                                                    style={{
                                                        fontFamily: "Arial, sans-serif",
                                                        background: "#eef4ff",
                                                        padding: "30px",
                                                        borderRadius: "12px",
                                                        maxWidth: "650px",
                                                        margin: "0 auto",
                                                        boxShadow: "0px 6px 18px rgba(0,0,0,0.08)",
                                                        marginTop: "15px",
                                                    }}
                                                >
                                                    {/* HEADER */}
                                                    <div
                                                        style={{
                                                            background:
                                                                "linear-gradient(135deg, #4e79ff, #6db6ff)",
                                                            padding: "20px",
                                                            borderRadius: "10px",
                                                            color: "white",
                                                            textAlign: "center",
                                                            marginBottom: "25px",
                                                            boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
                                                        }}
                                                    >
                                                        <h1
                                                            style={{
                                                                margin: 0,
                                                                fontSize: "26px",
                                                                fontWeight: "700",
                                                            }}
                                                        >
                                                            {type} Summary
                                                        </h1>

                                                        {userEmail && (
                                                            <p
                                                                style={{
                                                                    marginTop: "8px",
                                                                    opacity: 0.95,
                                                                    fontSize: "14px",
                                                                }}
                                                            >
                                                                For: <strong>{userEmail}</strong>
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* DEALS CARD */}
                                                    <div
                                                        style={{
                                                            background: "#ffffff",
                                                            padding: "20px",
                                                            borderRadius: "10px",
                                                            border: "1px solid #d0ddff",
                                                            boxShadow: "0px 4px 10px rgba(0,0,0,0.05)",
                                                        }}
                                                    >
                                                        <table
                                                            style={{
                                                                width: "100%",
                                                                borderCollapse: "collapse",
                                                                marginBottom: "20px",
                                                            }}
                                                        >
                                                            <thead>
                                                                <tr style={{ backgroundColor: "#e8efff" }}>
                                                                    <th
                                                                        style={{
                                                                            textAlign: "left",
                                                                            padding: "12px",
                                                                            fontSize: "15px",
                                                                            fontWeight: "700",
                                                                            color: "#1a2b6b",
                                                                            borderBottom: "2px solid #d0ddff",
                                                                        }}
                                                                    >
                                                                        Website
                                                                    </th>
                                                                    <th
                                                                        style={{
                                                                            textAlign: "right",
                                                                            padding: "12px",
                                                                            fontSize: "15px",
                                                                            fontWeight: "700",
                                                                            color: "#1a2b6b",
                                                                            borderBottom: "2px solid #d0ddff",
                                                                        }}
                                                                    >
                                                                        Amount
                                                                    </th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                {data.map((d, i) => (
                                                                    <tr
                                                                        key={i}
                                                                        style={{
                                                                            backgroundColor:
                                                                                i % 2 === 0 ? "#f7f9ff" : "#ffffff",
                                                                        }}
                                                                    >
                                                                        <td
                                                                            style={{
                                                                                padding: "12px",
                                                                                borderBottom: "1px solid #e1e7ff",
                                                                                fontSize: "14px",
                                                                                color: "#263238",
                                                                            }}
                                                                        >
                                                                            {d.website_c || "(no website)"}
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding: "12px",
                                                                                borderBottom: "1px solid #e1e7ff",
                                                                                textAlign: "right",
                                                                                fontSize: "14px",
                                                                                color: "#1a2b6b",
                                                                                fontWeight: "600",
                                                                            }}
                                                                        >
                                                                            $
                                                                            {Number(
                                                                                d.dealamount || 0
                                                                            ).toLocaleString()}
                                                                        </td>
                                                                    </tr>
                                                                ))}

                                                                {/* TOTAL AMOUNT */}
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            padding: "14px",
                                                                            fontSize: "16px",
                                                                            fontWeight: "700",
                                                                            color: "#1a2b6b",
                                                                            borderTop: "3px solid #4e79ff",
                                                                        }}
                                                                    >
                                                                        Total Amount
                                                                    </td>

                                                                    <td
                                                                        style={{
                                                                            padding: "14px",
                                                                            textAlign: "right",
                                                                            fontSize: "18px",
                                                                            fontWeight: "800",
                                                                            color: "#1a2b6b",
                                                                            borderTop: "3px solid #4e79ff",
                                                                        }}
                                                                    >
                                                                        ${totalAmount.toLocaleString()}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>


                                                    </div>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* ========================= GUIDELINES ========================= */}
                                        <tr><td style={{ padding: "5px" }}>&nbsp;</td></tr>

                                        <tr>
                                            <td style={{ padding: "10px" }}>&nbsp;</td>
                                        </tr>

                                        <tr>
                                            <td>
                                                <p
                                                    style={{
                                                        paddingLeft: "20px",
                                                        color: "#1a2b6b",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Please review the following important guidelines before we proceed:
                                                </p>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style={{ padding: "10px 20px", background: "#e8efff", borderLeft: "3px solid #4e79ff" }}>
                                                <p>DF Link Spam Must Be Under 7%</p>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style={{ padding: "10px 20px", background: "#ffffff", borderLeft: "3px solid #4e79ff" }}>
                                                <p><strong>Article Duration:</strong> 1 year.</p>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style={{ padding: "10px 20px", background: "#ffffff", borderLeft: "3px solid #4e79ff" }}>
                                                <p>Content will undergo <strong>AI detection; editorial fees</strong> apply if flagged.</p>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style={{ padding: "10px 20px", background: "#ffffff", borderLeft: "3px solid #4e79ff" }}>
                                                <p>
                                                    Please review the{" "}
                                                    <a
                                                        style={{
                                                            padding: "5px 10px",
                                                            background: "#d4ddff",
                                                            color: "#1a2b6b",
                                                            textDecoration: "none",
                                                            borderRadius: "4px",
                                                        }}
                                                        href="https://www.outrightcrm.com/blog/elead-crm/"
                                                    >
                                                        Sample Post
                                                    </a>
                                                </p>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style={{ padding: "10px 20px", background: "#ffffff", borderLeft: "3px solid #4e79ff" }}>
                                                <p>Articles must contain a minimum of 900 words.</p>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style={{ padding: "10px 20px", background: "#ffffff", borderLeft: "3px solid #4e79ff" }}>
                                                <p>We will add 2-3 internal links within a Guest Post for SEO purposes.</p>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style={{ padding: "10px 20px", background: "#ffffff", borderLeft: "3px solid #4e79ff" }}>
                                                <p>Most link insertions are done instantly; guest posts are completed within 1-3 business days.</p>
                                            </td>
                                        </tr>

                                        {/* ========================= PAYMENT SECTION ========================= */}

                                        <tr>
                                            <td
                                                style={{
                                                    background: "#ffffff",
                                                    padding: "20px",
                                                    borderLeft: "3px solid #4e79ff",
                                                }}
                                            >
                                                <h3 style={{ color: "#1a2b6b" }}>Payment Methods</h3>

                                                <table style={{ width: "100%" }}>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <img
                                                                    src="http://img.mailinblue.com/6590752/images/682ef211e6090_1747907089.png"
                                                                    alt=""
                                                                    width="13"
                                                                    height="17"
                                                                />{" "}
                                                                PayPal: <strong>pay@outrightcrm.com</strong>
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td>
                                                                <img
                                                                    src="http://img.mailinblue.com/6590752/images/682ef2a81908d_1747907240.png"
                                                                    alt=""
                                                                    width="15"
                                                                    height="15"
                                                                />{" "}
                                                                Payoneer: <strong>ashish@outrightcrm.com</strong>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>

                                        {/* ========================= POLICY LINKS ========================= */}
                                        <tr>
                                            <td>
                                                <table style={{ width: "100%" }} cellSpacing="0" cellPadding="0">
                                                    <tbody>
                                                        <tr>
                                                            {[
                                                                ["URL Policy", "https://www.outrightcrm.com/anchor-url-policy-2/"],
                                                                ["Anchor Text Policy", "https://www.outrightcrm.com/anchor-text-policy/"],
                                                                ["Content Policy", "https://www.outrightcrm.com/policy-for-blog-submissions/"],
                                                            ].map(([label, link]) => (
                                                                <td key={label} align="center">
                                                                    <a
                                                                        style={{
                                                                            padding: "10px 15px",
                                                                            border: "1px solid #4e79ff",
                                                                            fontSize: "14px",
                                                                            color: "#1a2b6b",
                                                                            textDecoration: "none",
                                                                            display: "inline-block",
                                                                            margin: "5px",
                                                                            background: "#eef4ff",
                                                                            borderRadius: "6px",
                                                                        }}
                                                                        href={link}
                                                                    >
                                                                        {label}
                                                                    </a>
                                                                </td>
                                                            ))}
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
            </div>

            <p>&nbsp;</p>
        </>
    );
}
