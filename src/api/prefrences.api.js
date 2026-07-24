import axios from "axios";
import { http } from "../services/api";

export const fetchLayout = async () => {
    const data = await axios.get('https://kartikey.guestpostcrm.com/index.php?entryPoint=flexibility&global_component_name=Sidebar')
    if (data?.status) return data.data
    return {}
}