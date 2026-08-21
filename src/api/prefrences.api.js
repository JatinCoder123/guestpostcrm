import axios from "axios";
import { http } from "../services/api";

export const fetchLayout = async () => {
    const data = await axios.get('https://kartikey.guestpostcrm.com/index.php?entryPoint=flexibility&global_component_name=Sidebar')
    if (data?.status) return data.data
    return {}
}
export const updateLayout = async ({ module, id, payload }) => {
    return await http({
        endpoint: 'https://kartikey.guestpostcrm.com/index.php',
        method: "POST",
        body: {
            action: 'update',
            module: module,
            id: id,
            data: payload
        }
    })
}   