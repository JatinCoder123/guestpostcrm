import { fetchGpc, http } from "../services/api";

export const getMailerSummary = (email) => fetchGpc({ params: { type: "mailer_summary", email } })