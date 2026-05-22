import { useCommandState } from 'cmdk';
import React, { useContext } from 'react'
import { PageContext } from '../context/pageContext';
import { useDispatch, useSelector } from 'react-redux';
import { useThreadContext } from './useThreadContext';
import { extractEmail } from '../assets/assets';
import { unrepliedAction } from '../store/Slices/unrepliedEmails';
import { useNavigate } from 'react-router-dom';

export const useNext = () => {
    const { emails: inboxEmails } = useSelector((state) => state.unreplied);
    const { superfastReply, setEnteredEmail,
        currentIndex,
        handleDateClick, } = useContext(PageContext);
    const { handleMove } = useThreadContext();
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const moveToNext = (email = '') => {
        const isLast = inboxEmails.length === currentIndex + 1;
        const nextEmailObj = inboxEmails[currentIndex + 1];
        if (isLast) {
            localStorage.removeItem("email");
            setEnteredEmail("");
            navigate("/unreplied-emails");
            return;
        }

        if (!nextEmailObj) {
            localStorage.removeItem("email");
            setEnteredEmail("");

            navigate("/unreplied-emails");
            return;
        }
        console.log("SUPER FAST REPLY", superfastReply);
        dispatch(unrepliedAction.removeUnreplied(email));
        if (superfastReply) {
            handleDateClick({
                email: extractEmail(nextEmailObj?.from || ""),
                nextPrev: true,
            });
            handleMove({
                email: extractEmail(nextEmailObj?.from || ""),
                threadId: nextEmailObj?.thread_id,
                loadAiReply: true,
            });
            return;
        }
        handleDateClick({
            email: extractEmail(nextEmailObj?.from || ""),
            navigate: "/",
            nextPrev: true,
        });


    };
    return { moveToNext }
}
