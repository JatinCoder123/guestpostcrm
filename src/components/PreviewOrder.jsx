export const createPreviewOrder = ({ templateData, order, userEmail }) => {
  let html = templateData?.[0]?.body_html || "";
  const dofollowLink = order?.seo_backlinks?.find(l => l?.link_type == "dofollow")
  const websiteName =
    dofollowLink?.website || dofollowLink?.name || order?.website || "";
  html = html
    .replace("{{ORDER_ID}}", order?.order_id ?? "_")
    .replace("{{NAME}}", userEmail)
    .replace("{{WEBSITE_NAME}}", websiteName)
    .replace("{{ANCHOR_TEXT}}", dofollowLink?.anchor_text_c ?? "")
    .replace("{{NICHE}}", order?.niche ?? dofollowLink?.niche ?? "")
    .replace("{{DATE}}", order?.date_modified_formatted ?? "_")
    .replace("{{STATUS}}", order?.order_status ?? "_")
    .replace("{{ORDER_TYPE}}", order?.order_type)
    .replace("{{AMOUNT}}", order?.total_amount_c ?? "_")
    .replace("{{LINK_backlink_url}}", dofollowLink?.backlink_url ?? "")
    .replace("{{LINK_NAME}}", dofollowLink?.name ?? "")
    .replace("{{LINK_gp_doc_url_c}}", dofollowLink?.gp_doc_url_c ?? "")
    .replace("{{LINK_target_url_c}}", dofollowLink?.target_url_c ?? "")
    .replace("{{Live Link}}", dofollowLink?.target_url_c ?? "")
    .replace("{{LINK_anchor_text_c}}", dofollowLink?.anchor_text_c ?? "")
    .replace("{{Invoice_link}}", order?.invoice_link_c ?? "");
  return html;
};


export const GP_REJECT_TEMPLATE_NAME = "GP_ORDER_REJECT";
export const LI_REJECT_TEMPLATE_NAME = "LI_ORDER_REJECT";

export const isRejectedOrder = (order) =>
  order?.order_status == "rejected_nontechnical";

export const pickOrderTemplate = ({
  order,
  gpTemplate,
  liTemplate,
  gpRejectTemplate,
  liRejectTemplate,
}) => {
  const isGp = order?.order_type == "GUEST POST";
  if (isRejectedOrder(order)) {
    const rejectTemplate = isGp ? gpRejectTemplate : liRejectTemplate;
    if (rejectTemplate?.[0]?.body_html) return rejectTemplate;
  }
  return isGp ? gpTemplate : liTemplate;
};
