import axios from "axios"

export const ManualSideCall = async (entryPoint, email, description) => {

    try {
        const response = await axios.get(`${entryPoint}&type=ledger_entry&email=${email}&description=${description}`)
        console.log('manual side call', response)
    } catch (error) {
        console.log(error)
    }

}
