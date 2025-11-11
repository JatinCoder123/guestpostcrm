import { create } from "zustand";

export const useOrdersStore = create((set) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=get_orders&filter=this_week"
      );
      const data = await response.json();

      if (data.success) {
        set({ orders: data.data, loading: false });
      } else {
        set({ error: "Failed to fetch orders", loading: false });
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));
