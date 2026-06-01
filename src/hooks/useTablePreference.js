// useTablePreference.js

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    preferencesAction,
    selectTablePreference,
} from "../store/Slices/preferencesSlice";

import { useEffect } from "react";

export const useTablePreference = (
    table
) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(
            preferencesAction.ensureTableExists(
                table
            )
        );
    }, [dispatch, table]);

    return useSelector(
        selectTablePreference(table)
    );
};