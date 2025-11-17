import { create } from "zustand";

export const useOffersStore = create((set) => ({
  offers: [],
  loading: false,
  error: null,

  fetchOffers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=get_offers&filter=this_week"
      );

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log("Fetched Offers:", data);

      if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
        const formattedOffers = data.data.map((item) => ({
          id: item.id,
          date: new Date(item.date_entered).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          sender: item.name || "Unknown Sender",
          subject: item.description || "No subject",
          amount:
            item.client_offer_c && item.client_offer_c !== "N/A"
              ? `$${item.client_offer_c}`
              : "N/A",
        }));

        set({ offers: formattedOffers });
      } else {
        set({ offers: [] });
      }
    } catch (err) {
      console.error("Fetch error:", err);
      set({ error: "Failed to load offers. Please try again." });
    } finally {
      set({ loading: false });
    }
  },
}));
