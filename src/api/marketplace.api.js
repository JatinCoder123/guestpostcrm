// orders.api.js

import { queryClient } from "../lib/queryClient";
import { fetchGpc } from "../services/api";
import { buildLedgerItem, createLedgerEntry, updateActivity } from "../services/utils";
export const getMarketPlaces = async () => await fetchGpc({ params: { type: "get_marketplace" } })

export const addMarketPlace = async ({ email, brand = false }) => {
    let domain = brand ? email.split('@')[1] : '';
    const data = await fetchGpc({ method: "POST", params: { type: 'setMarketPlace' }, body: { email, domain } });
    updateActivity(email, "Add To MarketPlace")
    createLedgerEntry({
        email: email,
        group: "Activity",
        items: [buildLedgerItem({ status: "Marketplace-Added", detail: `email: {${email}}` })],
    });
    return data

};
export const removeMarketPlace = async ({ email, id }) => {
    const data = await fetchGpc({ params: { type: 'delete_record', module_name: "outr_marketplace", record_id: id } })
    updateActivity(email, "Remove From MarketPlace")
    createLedgerEntry({
        email: email,
        group: "Activity",
        items: [buildLedgerItem({ status: "Marketplace-Removed", detail: `email: {${email}}` })],
    });
    return data

};
