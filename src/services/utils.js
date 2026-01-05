import axios from "axios"

export const ManualSideCall = async (entryPoint, email, description, match_no, okHandler) => {

    try {
        const { data } = await axios.get(`${entryPoint}&type=ledger_entry&email=${email}&description=${description}&match_no=${match_no}`)
        console.log('manual side call', data)
        if (data == "ok") {
            okHandler()
        }
    } catch (error) {
        console.log(error)
    }

}