// src/store/dealsStore.js
import { create } from "zustand";

export const useDealsStore = create((set) => ({
  deals: [],
  loading: false,
  error: "",

  fetchDeals: async () => {
    set({ loading: true, error: "" });
    try {
      const response = await fetch(
        "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=get_deals&filter=this_week"
      );
      if (!response.ok) throw new Error("Failed to load deals.");

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        const formattedDeals = data.data.map((item) => ({
          date: item.date_entered
            ? new Date(item.date_entered).toLocaleString()
            : "N/A",
          sender: item.email || "Unknown",
          subject: item.status
            ? `Status: ${item.status.toUpperCase()}`
            : "No Subject",
          amount: `$${item.dealamount || "0"}`,
        }));

        set({ deals: formattedDeals });
      } else {
        set({ deals: [] });
      }
    } catch (err) {
      console.error("Error fetching deals:", err);
      set({ error: "Failed to load deals. Please try again." });
    } finally {
      set({ loading: false });
    }
  },
}));
