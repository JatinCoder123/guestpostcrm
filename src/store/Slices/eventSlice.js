import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY, CREATE_DEAL_URL, MODULE_URL } from "../constants";

const eventSlice = createSlice({
    name: "events",
    initialState: {
        loading: false,
        adding: false,
        events: [],
        count: 0,
        error: null,
        message: null,
    },
    reducers: {
        getEventsRequest(state) {
            state.loading = true;
            state.error = null;
        },
        getEventsSucess(state, action) {
            const { count, events } = action.payload;
            state.loading = false;
            state.events = events;
            state.count = count;
            state.error = null;
        },
        getEventsFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        addEventRequest(state) {
            state.adding = true;
            state.message = null;
            state.error = null;
        },
        addEventSucess(state, action) {
            state.adding = false;
            state.message = action.payload;
            state.error = null;
        },
        addEventFailed(state, action) {
            state.adding = false;
            state.message = null;
            state.error = action.payload;
        },
        clearAllErrors(state) {
            state.error = null;
        },
        clearAllMessages(state) {
            state.message = null;
        },
        UpdateEvents(state, action) {
            state.events = action.payload;
        },
    },
});


export const getEvents = () => {
    return async (dispatch) => {
        dispatch(eventSlice.actions.getEventsRequest());

        try {
<<<<<<< HEAD
            const url =
                "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=recent_activities&user_id=61969816-f675-6711-080f-692d30ad2e1c&filter=last_90_days&page=1&page_size=50";

            console.log("📡 Fetching From URL:", url);

            const response = await axios.get(url);

            console.log("🟢 Full API Response:", response);
            console.log("🟢 Response Data:", response.data);

=======
            let response;
            if (email) {
                response = await axios.get(
                    `${getState().user.crmEndpoint
                    }&id=${getState().user.id}=${filter}&email=${email}&page=1&page_size=50`
                );
            } else {
                response = await axios.get(
                    `${getState().user.crmEndpoint
                    }&type=get_deals&filter=${filter}&page=1&page_size=50`
                );
            }
>>>>>>> 02cbb21587c2967fb20f961055883b2ff0dbdad2
            const data = response.data;

            console.log("📌 Data Count:", data.data_count);
            console.log("📌 Events:", data.data);

            dispatch(
                eventSlice.actions.getEventsSucess({
                    count: data.data_count ?? 0,
                    events: data.data ?? [],
                })
            );

            dispatch(eventSlice.actions.clearAllErrors());
        } catch (error) {
            console.error("❌ Fetch Error:", error);
            dispatch(eventSlice.actions.getEventsFailed("Fetching Event Failed"));
        }
    };
};



export const addEvent = (event) => {
    return async (dispatch, getState) => {
        dispatch(eventSlice.actions.addEventRequest());
        try {
            console.log(event);
            const { data } = await axios.post(
                `${MODULE_URL}&action_type=post_data`,

                {
                    parent_bean: {
                        module: "outr_recent_activity",
                        name: event.email,
                        thread_id: event.thread_id,
                        recent_activity: event.recent_activity,
                        assigned_user_id: getState().user.id,
                    },
                },
                {
                    headers: {
                        "X-Api-Key": `${CREATE_DEAL_API_KEY}`,
                        "Content-Type": "aplication/json",
                    },
                }
            );
            console.log(`Add Event`, data);

            dispatch(
                eventSlice.actions.addEventSucess("Event Added Successfully")
            );
            dispatch(eventSlice.actions.clearAllErrors());
        } catch (error) {
            dispatch(eventSlice.actions.addEventFailed("Event Adding Failed"));
        }
    };
};

export const eventActions = eventSlice.actions;
export default eventSlice.reducer;
