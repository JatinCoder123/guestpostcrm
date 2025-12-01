import React from "react";

export default function PreviewDeals({
    deals = [],
    totalAmount = 0,
    onSubmit,
    userEmail = "",
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
                    bgcolor="#f4f4f4"
                >
                    <tbody>
                        <tr>
                            <td style={{ padding: "30px" }} width="100%">
                                <table style={{ width: "100%" }} cellSpacing="0" cellPadding="0">
                                    <tbody>
                                        {/* ========================= HEADER ========================= */}
                                        <tr>
                                            <td style={{ padding: "10px" }} bgcolor="#808080" width="100%">
                                                <h2
                                                    style={{
                                                        padding: "10px 20px",
                                                        color: "#fff",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    Our Deal is Confirmed
                                                </h2>

                                                {/* =========================
                                                    PREVIEW CARD (MOVED OUTSIDE TABLE)
                                                ========================== */}
                                                <div
                                                    style={{
                                                        fontFamily: "Arial, sans-serif",
                                                        background: "#eef2f7",
                                                        padding: "30px",
                                                        borderRadius: "12px",
                                                        maxWidth: "650px",
                                                        margin: "0 auto",
                                                        border: "1px solid #d6d9de",
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
                                                            Deals Summary
                                                        </h1>

                                                        {userEmail && (
                                                            <p
                                                                style={{
                                                                    marginTop: "8px",
                                                                    opacity: 0.9,
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
                                                            background: "white",
                                                            padding: "20px",
                                                            borderRadius: "10px",
                                                            border: "1px solid #e2e5ea",
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
                                                                <tr style={{ backgroundColor: "#f1f5fb" }}>
                                                                    <th
                                                                        style={{
                                                                            textAlign: "left",
                                                                            padding: "12px",
                                                                            fontSize: "15px",
                                                                            fontWeight: "700",
                                                                            color: "#333",
                                                                            borderBottom:
                                                                                "2px solid #e0e6ed",
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
                                                                            color: "#333",
                                                                            borderBottom:
                                                                                "2px solid #e0e6ed",
                                                                        }}
                                                                    >
                                                                        Amount
                                                                    </th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                {deals.map((d, i) => (
                                                                    <tr
                                                                        key={i}
                                                                        style={{
                                                                            backgroundColor:
                                                                                i % 2 === 0
                                                                                    ? "#fafbfc"
                                                                                    : "#ffffff",
                                                                            transition: "background 0.2s",
                                                                        }}
                                                                    >
                                                                        <td
                                                                            style={{
                                                                                padding: "12px",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                fontSize: "14px",
                                                                                color: "#444",
                                                                                fontWeight: "500",
                                                                            }}
                                                                        >
                                                                            {d.website_c ||
                                                                                "(no website)"}
                                                                        </td>
                                                                        <td
                                                                            style={{
                                                                                padding: "12px",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                textAlign: "right",
                                                                                fontSize: "14px",
                                                                                color: "#222",
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
                                                                            color: "#1a202c",
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
                                                                            color: "#1a202c",
                                                                            borderTop: "3px solid #4e79ff",
                                                                            textShadow:
                                                                                "0px 1px 2px rgba(0,0,0,0.1)",
                                                                        }}
                                                                    >
                                                                        ${totalAmount.toLocaleString()}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>

                                                        {/* SUBMIT BUTTON */}
                                                        {onSubmit && (
                                                            <div
                                                                style={{
                                                                    textAlign: "center",
                                                                    marginTop: "20px",
                                                                }}
                                                            >
                                                                <button
                                                                    onClick={onSubmit}
                                                                    style={{
                                                                        padding: "12px 26px",
                                                                        background:
                                                                            "linear-gradient(135deg, #4e79ff, #6db6ff)",
                                                                        color: "white",
                                                                        borderRadius: "8px",
                                                                        border: "none",
                                                                        cursor: "pointer",
                                                                        fontSize: "16px",
                                                                        fontWeight: "700",
                                                                        boxShadow:
                                                                            "0px 4px 12px rgba(0,0,0,0.15)",
                                                                        transition: "opacity 0.2s",
                                                                    }}
                                                                >
                                                                    Submit Deals
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* ========================= FOOTER (UNCHANGED) ========================= */}
                                        <tr>
                                            <td style={{ padding: "5px" }}>&nbsp;</td>
                                        </tr>

                                        <tr>
                                            <td style={{ padding: "10px" }}>&nbsp;</td>
                                        </tr>

                                        <tr>
                                            <td width="100%">
                                                <p
                                                    style={{
                                                        paddingLeft: "20px",
                                                        color: "#595959",
                                                    }}
                                                >
                                                    Please review the following important guidelines
                                                    before we proceed:
                                                </p>
                                            </td>
                                        </tr>

                                        {/* ... footer content SAME as your version ... */}
                                        <tr>
                                            <td
                                                style={{
                                                    padding: "10px 20px",
                                                    borderLeft: "3px solid #51609B",
                                                    background: "#f1d1d1",
                                                }}
                                            >
                                                <p>DF Link Spam Must Be Under 7%</p>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td
                                                style={{
                                                    padding: "10px 20px",
                                                    borderLeft: "3px solid #51609B",
                                                    background: "#fff",
                                                }}
                                            >
                                                <p>
                                                    <strong>Article Duration :</strong> 1 year.
                                                </p>
                                            </td>
                                        </tr>

                                        {/* (KEEP ALL OTHER FOOTER ROWS EXACTLY SAME) */}
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
