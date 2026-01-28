import axios from "axios"
import { showConsole } from "../assets/assets"

export const ManualSideCall = async (entryPoint, email, description, match_no, okHandler) => {

    try {
        const { data } = await axios.get(`${entryPoint}&type=ledger_entry&email=${email}&description=${description}&match_no=${match_no}`)
        showConsole && console.log('manual side call', data)
        if (data == "ok") {
            okHandler()
        }
    } catch (error) {
        showConsole && console.log(error)
    }

}