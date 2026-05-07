import { showConsole } from "../assets/assets";
import { apiRequest, fetchGpc } from "./api";

let CURRENT_USER = {
  name: "GPC",
  description: "GPC",
};
export const setCurrentUser = (currentUser) => {
  CURRENT_USER = currentUser;
  return;
};
export const updateActivity = async (email, last_activity) => {
  try {
    const data = await fetchGpc({
      method: "POST",
      params: { type: "last_activity" },
      body: {
        email,
        last_activity,
        last_user: CURRENT_USER.name,
        last_user_email: CURRENT_USER.description,
      },
    });
    showConsole && console.log("Activity Added", data);
  } catch (error) {
    showConsole && console.log(error);
  }
};
export const createLedgerEntry = async ({
  domain,
  email,
  thread_id,
  message_id,
  group = "General",
  items = [],
  okHandler,
}) => {
  try {
    const payload = {
      email,
      thread_id,
      message_id,
      group,
      item: items,
    };
    const data = await fetchGpc({
      method: "POST",
      body: payload,
      params: { type: "make_ledger" },
    });

    showConsole && console.log("Ledger Created", data);
    okHandler();
  } catch (error) {
    showConsole && console.log("Ledger API Failed", error);
  }
};

export const buildLedgerItem = ({
  status,
  detail,
  ladgerState,
  user,
  parent_name,
}) => ({
  status,
  detail,
  prompt_id: ladgerState.prompt_id || "",
  prompt_ledger_id: ladgerState.prompt_ledger_id || "",
  parent_id: ladgerState.parent_id || "",
  parent_name,
  template_id: ladgerState.template_id || "",
  assigned_user_id: user?.id || "",
});

export const applyHashtag = async ({
  domain,
  email,
  memo_no,
  method = "GET",
}) => {
  try {
    const { data } = await fetchGpc({
      method,
      params: { type: "hashtag", email, memo_no: memo_no },
    });

    showConsole && console.log("Hashtag Applied", data);
    return data;
  } catch (error) {
    showConsole && console.log("Hashtag API Failed", error);
  }
};


export const generatePDF = async (html, id = "invoice") => {
  try {
    const response = await fetch("https://socket.guestpostcrm.com/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: `<p>&nbsp;</p>
<table style="width: 100%;" border="0" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td align="center">
<table style="margin: 32px auto; background: #fefefe; border: 2px solid #d7d7d7; width: 720px;" border="0" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td style="padding: 24px;">
<table style="background: #f9fbff; border: 1px solid #cfd9f0; width: 100%;" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td style="padding: 20px;" align="center">
<h1 style="font-size: 22px; font-weight: 800; margin: 0; color: #23315f;">New Discounted Offer</h1>
<p style="font-size: 13px; color: #5d6470; margin: 8px 0 0 0;">&nbsp;</p>
</td>
</tr>
</tbody>
</table>
<br>
<table style="font-size: 14px; border: 1px solid #d7d7d7; width: 100%;" border="0" cellspacing="0" cellpadding="0">
<thead>
<tr>
<th style="background: #353f66; color: #fff; padding: 10px 8px; font-size: 15px;" align="left">Website</th>
<th style="background: #353f66; color: #fff; padding: 10px 8px; font-size: 15px;" align="center">Offer Price</th>
<th style="background: #353f66; color: #fff; padding: 10px 8px; font-size: 15px;" align="center">Niche</th>
</tr>
</thead>
<tbody>
<tr style="background: #ffffff;">
<td style="padding: 8px 6px;"><a style="color: #0b1b4a; text-decoration: none; font-weight: bold;" href="https://www.outrightcrm.com">OutRightCRM.com</a></td>
<td style="padding: 8px 6px; font-weight: bold; color: #1e7b35;" align="center">$120</td>
<td style="padding: 8px 6px;">Software Technology (AI, CRM, Online Tools, Web Development)</td>
</tr>
</tbody>
</table>
<table style="background: #f9fafc; border: 1px solid #cfd9f0; margin-top: 20px; width: 100%;" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td style="padding: 16px;">
<h3 style="margin: 0 0 8px 0; color: #23315f; text-align: center;"><span style="text-decoration: underline;">Offer Guidelines</span></h3>
<ul style="margin: 0; padding-left: 20px; line-height: 1.6; font-size: 14px; color: #1f2330;">
<li>DF Link Spam Score Must Be Less Than 10%</li>
<li>Article Duration: 1 year</li>
<li>Content will undergo AI detection; editorial fees apply if flagged</li>
<li>Please review the <a style="color: #4253a6;" href="https://www.outrightcrm.com/blog/crushon-ai/">Sample Post</a></li>
<li>Articles must contain a minimum of 900 words</li>
<li>2&ndash;3 internal links will be added for SEO purposes</li>
<li>Most link insertions are done instantly; guest posts within 1&ndash;3 business days</li>
</ul>
</td>
</tr>
</tbody>
</table>
<table style="background: #f9fff9; border: 1px solid #b6d7b9; margin-top: 20px; width: 100%;" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td style="padding: 16px; font-size: 14px; text-align: center;"><strong>PayPal:</strong> pay@outrightcrm.com &nbsp;&nbsp; | &nbsp;&nbsp; <strong>Payoneer:</strong> ashish@outrightcrm.com</td>
</tr>
</tbody>
</table>
<p style="text-align: center; margin-top: 20px; font-size: 13px;"><a style="color: #4253a6; text-decoration: none;" href="https://www.outrightcrm.com/anchor-url-policy-2/">URL Policy</a> | <a style="color: #4253a6; text-decoration: none;" href="https://www.outrightcrm.com/anchor-text-policy/">Anchor Text Policy</a> | <a style="color: #4253a6; text-decoration: none;" href="https://www.outrightcrm.com/policy-for-blog-submissions/">Content Policy</a></p>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>`
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }

    // ✅ get blob directly
    const blob = await response.blob();

    // ✅ convert blob → file
    const file = new File([blob], `${id}.pdf`, {
      type: "application/pdf",
    });
    console.log("Converted File:", file);

    return file;
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};

