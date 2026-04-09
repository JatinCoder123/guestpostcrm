import React from 'react'
import { useSelector } from 'react-redux'

const useAccess = () => {
    const { userType, permissions } = useSelector(state => state.user)
    const isAllow = (section) => {
        if (userType == "power") return true;
        return permissions[section]
    }
    return { isAllow }
}

export default useAccess