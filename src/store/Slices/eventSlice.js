import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY } from "../constants";

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
        updateCount(state, action) {
            if (action.payload === 1) {
                state.count += 1;
                return;
            }
            state.count = 0;

        }

    },
});


export const getEvents = () => {
    return async (dispatch, getState) => {
        dispatch(eventSlice.actions.getEventsRequest());

        try {
            const url =
                `${getState().user.crmEndpoint}&type=recent_activities&user_id=null${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}&page=1&page_size=50`;
            const response = await axios.get(url);

            console.log("🟢 Full API Response:", response);
            console.log("🟢 Response Data:", response.data);

            const data = response.data;

            console.log("📌 Data Count:", data.data_count);
            console.log("📌 Events:", data.data);

            dispatch(
                eventSlice.actions.getEventsSucess({
                    count: 0,
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
            const domain = getState().user.crmEndpoint.split("?")[0];
            const { data } = await axios.post(
                `${domain}?entryPoint=get_post_all&action_type=post_data`,

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
            dispatch(eventSlice.actions.updateCount(1));

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
