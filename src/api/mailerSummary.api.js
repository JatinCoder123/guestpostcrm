import { fetchGpc } from "../services/api";

export const getMailerSummary = (email) => fetchGpc({ params: { type: "mailer_summary", email } })
export const regenMailerSummary = (email) => fetchGpc({ params: { type: "regenerate_summary" }, body: { email }, method: "POST" })