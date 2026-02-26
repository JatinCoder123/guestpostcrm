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
export const updateActivity = async (entryPoint, email, last_user, last_user_email, last_activity) => {

    try {
        const { data } = await axios.post(`${entryPoint}&type=last_activity`, {
            email,
            last_activity,
            last_user,
            last_user_email
        })
        showConsole && console.log('Activity Added', data)

    } catch (error) {
        showConsole && console.log(error)
    }

}