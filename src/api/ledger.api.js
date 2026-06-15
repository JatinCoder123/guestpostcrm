
import { fetchGpc } from "../services/api";
export const getLedger = async ({
    email,
    page = 1,
}) => {
    const data = await fetchGpc({ params: { type: 'get_card_ledger', email, page, page_size: "10" } })

    return data;
};

export const getBrandLedger =
    async ({
        email,
        page = 1,
    }) => {
        const data = await fetchGpc({ params: { type: "brandTimeline", case: "timeline", email, page, page_size: "10" } })

        return data;
    };