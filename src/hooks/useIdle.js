import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import { PageContext } from "../context/pageContext";
import { getLadger } from "../store/Slices/ladger";
import { getEmailsCount, getUnrepliedEmail } from "../store/Slices/unrepliedEmails";
import { getContact, getViewEmail, viewEmailAction } from "../store/Slices/viewEmail";


function useIdle({ idle }) {
    const { setUserIdle, eventQueueRef, setEventQueue, } = useContext(SocketContext);
    const {
        enteredEmail,
        currentIndex,
    } = useContext(PageContext);
    const dispatch = useDispatch();
    const { emails, loading } = useSelector((state) => state.unreplied);
    const [firstEmail, setFirstEmail] = useState(null);

    const refreshLadger = () => {
        if (enteredEmail) {
            dispatch(getLadger({ email: enteredEmail }));
            dispatch(getViewEmail({ email: enteredEmail }));
            dispatch(getContact(enteredEmail));
        } else if (firstEmail) {
            dispatch(getLadger({ email: firstEmail }));
            dispatch(getViewEmail({ email: firstEmail }));
            dispatch(getContact(firstEmail));
        }
        dispatch(getEmailsCount({}))
        dispatch(getUnrepliedEmail({ email: enteredEmail, loading: false }));
    };
    useEffect(() => {
        if (emails?.length > 0) {
            setFirstEmail(
                emails[currentIndex].from?.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0],
            );
        }
    }, [emails?.length, currentIndex]);
    useEffect(() => {
        setUserIdle(idle)
        return () => {
            setUserIdle(true)
            // flushQueue()
        }
    }, [])
    return [refreshLadger
    ];
}

export default useIdle;
