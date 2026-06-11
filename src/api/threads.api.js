import { fetchGpc, http } from "../services/api";
export const getThreadByEmail = async (email) => await fetchGpc({ params: { type: "view_email", email } })
export const getThreadByThreadId = async (email, thread_id) => await fetchGpc({ params: { type: "view_thread", thread_id, email } });
export const getDuplicateThreads = async (email) => await fetchGpc({ params: { type: "get_dupliacte_threads", email } });