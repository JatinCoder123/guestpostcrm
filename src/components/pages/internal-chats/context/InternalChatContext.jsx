import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    useCallback,
} from "react";

import {
    useSearchParams,
} from "react-router-dom";

import {
    useGetConversations,
    useGetUserChat,
    useSendInternalMessage,
} from "../../../../queries/internalChat.queries";

import {
    useCrmUsers,
} from "../../../../queries/users.queries";


const InternalChatContext =
    createContext(null);


export const InternalChatProvider = ({
    children,
}) => {

    /* ==========================================
       URL SEARCH PARAMS
    ========================================== */

    const [
        searchParams,
        setSearchParams,
    ] = useSearchParams();


    const emailFromUrl =
        searchParams.get("email");


    /* ==========================================
       SELECTED USER
    ========================================== */

    const [
        selectedUser,
        setSelectedUser,
    ] = useState(null);


    /* ==========================================
       START CHAT MODAL
    ========================================== */

    const [
        isStartChatOpen,
        setIsStartChatOpen,
    ] = useState(false);


    /* ==========================================
       MESSAGE DRAFT

       IMPORTANT:
       This state is ONLY for what the user
       is currently typing.

       It is NOT derived from messages,
       conversations, or API responses.
    ========================================== */

    const [
        message,
        setMessage,
    ] = useState("");


    /* ==========================================
       CONVERSATIONS
    ========================================== */

    const conversationsQuery =
        useGetConversations();

    const conversations =
        conversationsQuery.data?.chats ?? [];


    /* ==========================================
       ALL CRM USERS
    ========================================== */

    const usersQuery =
        useCrmUsers();

    const users = useMemo(() => {

        const data =
            usersQuery.data;

        if (Array.isArray(data)) {
            return data;
        }

        return [];

    }, [
        usersQuery.data,
    ]);


    /* ==========================================
       FIND USER BY EMAIL
    ========================================== */

    const findUserByEmail =
        useCallback(
            (email) => {

                if (!email) {
                    return null;
                }

                const normalizedEmail =
                    email
                        .trim()
                        .toLowerCase();


                /* ------------------------------
                   Search CRM users
                ------------------------------ */

                const crmUser =
                    users.find(
                        (user) => {

                            const userEmail =
                                user?.description ??
                                user?.email ??
                                "";

                            return (
                                userEmail
                                    .toLowerCase() ===
                                normalizedEmail
                            );
                        }
                    );


                if (crmUser) {

                    return {
                        email:
                            crmUser?.description ??
                            crmUser?.email,

                        user_id:
                            crmUser?.id ??
                            crmUser?.user_id,

                        name:
                            crmUser?.name ??
                            crmUser?.full_name ??
                            normalizedEmail,
                    };

                }


                /* ------------------------------
                   Search existing conversations
                ------------------------------ */

                const conversation =
                    conversations.find(
                        (item) => {

                            const conversationEmail =
                                item?.email ??
                                item?.to_email ??
                                item?.user_email ??
                                "";

                            return (
                                conversationEmail
                                    .toLowerCase() ===
                                normalizedEmail
                            );
                        }
                    );


                if (conversation) {

                    return {

                        ...conversation,

                        email:
                            conversation?.email ??
                            conversation?.to_email ??
                            conversation?.user_email,

                        user_id:
                            conversation?.user_id ??
                            conversation?.id,

                        name:
                            conversation?.name ??
                            conversation?.user_name ??
                            normalizedEmail,
                    };

                }


                /* ------------------------------
                   Fallback
                ------------------------------ */

                return {

                    email:
                        email.trim(),

                    user_id:
                        null,

                    name:
                        email.trim(),
                };

            },
            [
                users,
                conversations,
            ]
        );


    /* ==========================================
       SELECT USER FROM URL

       IMPORTANT:

       This effect ONLY clears the draft when
       the actual selected user changes.

       Refetching users/conversations will NOT
       clear whatever the user is typing.
    ========================================== */

    useEffect(() => {

        if (!emailFromUrl) {
            return;
        }

        const user =
            findUserByEmail(
                emailFromUrl
            );

        if (!user?.email) {
            return;
        }

        setSelectedUser(
            (previous) => {

                const previousEmail =
                    previous?.email
                        ?.trim()
                        .toLowerCase();

                const nextEmail =
                    user.email
                        ?.trim()
                        .toLowerCase();


                /*
                 * SAME USER
                 *
                 * Very important:
                 *
                 * Do NOT call setMessage here.
                 *
                 * This prevents API/user refetches
                 * from destroying the user's draft.
                 */

                if (
                    previousEmail ===
                    nextEmail
                ) {
                    return previous;
                }


                /*
                 * ACTUALLY CHANGED USER
                 *
                 * Now it is safe to clear the
                 * previous user's draft.
                 */

                setMessage("");

                return user;
            }
        );

    }, [
        emailFromUrl,
        findUserByEmail,
    ]);


    /* ==========================================
       SELECTED USER CHAT
    ========================================== */

    const userChatQuery =
        useGetUserChat({
            to_email:
                selectedUser?.email,
        });


    const messages = useMemo(() => {

        const data =
            userChatQuery.data?.chats;

        if (Array.isArray(data)) {
            return data;
        }

        return [];

    }, [
        userChatQuery.data,
    ]);


    /* ==========================================
       SEND MESSAGE MUTATION
    ========================================== */

    const sendMessageMutation =
        useSendInternalMessage();


    /* ==========================================
       SELECT USER
    ========================================== */

    const selectUser =
        useCallback(
            (user) => {

                if (!user) {
                    return;
                }


                const normalizedUser = {

                    ...user,

                    email:
                        user?.email ??
                        user?.description,

                    user_id:
                        user?.user_id ??
                        user?.id,

                    name:
                        user?.name ??
                        user?.full_name ??
                        user?.email ??
                        user?.description,
                };


                /*
                 * Only clear draft when
                 * actually switching user.
                 */

                setSelectedUser(
                    (previous) => {

                        const previousEmail =
                            previous?.email
                                ?.trim()
                                .toLowerCase();

                        const nextEmail =
                            normalizedUser?.email
                                ?.trim()
                                .toLowerCase();


                        if (
                            previousEmail ===
                            nextEmail
                        ) {
                            return previous;
                        }


                        setMessage("");

                        return normalizedUser;
                    }
                );


                /*
                 * Keep URL in sync.
                 */

                if (
                    normalizedUser.email
                ) {

                    setSearchParams(
                        {
                            email:
                                normalizedUser.email,
                        },
                        {
                            replace: true,
                        }
                    );

                }

            },
            [
                setSearchParams,
            ]
        );


    /* ==========================================
       CLEAR SELECTED USER
    ========================================== */

    const clearSelectedUser =
        useCallback(
            () => {

                setSelectedUser(null);

                /*
                 * Clear draft because there is
                 * no selected conversation anymore.
                 */

                setMessage("");


                /*
                 * Remove email from URL.
                 */

                setSearchParams(
                    {},
                    {
                        replace: true,
                    }
                );

            },
            [
                setSearchParams,
            ]
        );


    /* ==========================================
       START CHAT MODAL
    ========================================== */

    const openStartChat =
        useCallback(
            () => {
                setIsStartChatOpen(true);
            },
            []
        );


    const closeStartChat =
        useCallback(
            () => {
                setIsStartChatOpen(false);
            },
            []
        );


    /* ==========================================
       START CHAT WITH USER
    ========================================== */

    const startChatWithUser =
        useCallback(
            (user) => {

                if (!user) {
                    return;
                }


                const normalizedUser = {

                    email:
                        user?.email ??
                        user?.description,

                    user_id:
                        user?.user_id ??
                        user?.id,

                    name:
                        user?.name ??
                        user?.full_name ??
                        user?.email ??
                        user?.description,
                };


                setSelectedUser(
                    (previous) => {

                        const previousEmail =
                            previous?.email
                                ?.trim()
                                .toLowerCase();

                        const nextEmail =
                            normalizedUser?.email
                                ?.trim()
                                .toLowerCase();


                        if (
                            previousEmail ===
                            nextEmail
                        ) {
                            return previous;
                        }


                        /*
                         * New conversation/user.
                         *
                         * Clear old draft.
                         */

                        setMessage("");

                        return normalizedUser;
                    }
                );


                setIsStartChatOpen(false);


                /*
                 * Update URL.
                 */

                if (
                    normalizedUser.email
                ) {

                    setSearchParams(
                        {
                            email:
                                normalizedUser.email,
                        },
                        {
                            replace: true,
                        }
                    );

                }

            },
            [
                setSearchParams,
            ]
        );


    /* ==========================================
       SET MESSAGE

       Keep this as a direct state setter.

       Typing never waits for an API.
    ========================================== */

    const handleMessageChange =
        useCallback(
            (value) => {
                setMessage(value);
            },
            []
        );


    /* ==========================================
       SEND MESSAGE

       The draft is NOT cleared before the
       request.

       If the request fails, the user's text
       remains in the input.
    ========================================== */

    const sendMessage =
        useCallback(
            async ({
                to_email,
                message: messageText,
            }) => {

                const text =
                    messageText?.trim();


                if (!text) {
                    return false;
                }


                if (!to_email) {
                    return false;
                }


                try {

                    await sendMessageMutation
                        .mutateAsync({
                            to_email,
                            message: text,
                        });


                    /*
                     * Clear ONLY after successful
                     * API request.
                     */

                    setMessage("");


                    /*
                     * Refresh current conversation
                     * after sending.
                     */

                    await userChatQuery.refetch();


                    /*
                     * Refresh conversation list.
                     */

                    await conversationsQuery.refetch();


                    return true;

                } catch (error) {

                    console.error(
                        "Failed to send internal message:",
                        error
                    );


                    /*
                     * IMPORTANT:
                     *
                     * Do NOT clear message here.
                     *
                     * The user keeps what they typed
                     * and can retry.
                     */

                    return false;
                }

            },
            [
                sendMessageMutation,
                userChatQuery.refetch,
                conversationsQuery.refetch,
            ]
        );


    /* ==========================================
       SEND CURRENT INPUT MESSAGE
    ========================================== */

    const sendCurrentMessage =
        useCallback(
            async () => {

                if (
                    !selectedUser?.email
                ) {
                    return;
                }


                const text =
                    message?.trim();


                if (!text) {
                    return;
                }


                await sendMessage({

                    to_email:
                        selectedUser.email,

                    message:
                        text,
                });

            },
            [
                selectedUser?.email,
                message,
                sendMessage,
            ]
        );


    /* ==========================================
       CONTEXT VALUE
    ========================================== */

    const value =
        useMemo(
            () => ({

                /* ------------------------------
                   URL
                ------------------------------ */

                emailFromUrl,


                /* ------------------------------
                   CONVERSATIONS
                ------------------------------ */

                conversations,

                isConversationsLoading:
                    conversationsQuery.isLoading,

                isConversationsFetching:
                    conversationsQuery.isFetching,

                conversationsError:
                    conversationsQuery.error,

                refetchConversations:
                    conversationsQuery.refetch,


                /* ------------------------------
                   ALL CRM USERS
                ------------------------------ */

                users,

                isUsersLoading:
                    usersQuery.isLoading,

                isUsersFetching:
                    usersQuery.isFetching,

                usersError:
                    usersQuery.error,

                refetchUsers:
                    usersQuery.refetch,


                /* ------------------------------
                   SELECTED USER
                ------------------------------ */

                selectedUser,

                setSelectedUser,

                selectUser,

                clearSelectedUser,

                startChatWithUser,


                /* ------------------------------
                   MESSAGES
                ------------------------------ */

                messages,

                isMessagesLoading:
                    userChatQuery.isLoading,

                isMessagesFetching:
                    userChatQuery.isFetching,

                messagesError:
                    userChatQuery.error,

                refetchMessages:
                    userChatQuery.refetch,


                /* ------------------------------
                   MESSAGE INPUT

                   This is the local draft.
                ------------------------------ */

                message,

                setMessage,

                handleMessageChange,


                /* ------------------------------
                   SEND MESSAGE
                ------------------------------ */

                sendMessage,

                sendCurrentMessage,

                isSendingMessage:
                    sendMessageMutation.isPending,

                sendMessageError:
                    sendMessageMutation.error,

                sendMessageSuccess:
                    sendMessageMutation.isSuccess,


                /* ------------------------------
                   START CHAT MODAL
                ------------------------------ */

                isStartChatOpen,

                openStartChat,

                closeStartChat,

            }),
            [

                emailFromUrl,


                conversations,

                conversationsQuery.isLoading,
                conversationsQuery.isFetching,
                conversationsQuery.error,
                conversationsQuery.refetch,


                users,

                usersQuery.isLoading,
                usersQuery.isFetching,
                usersQuery.error,
                usersQuery.refetch,


                selectedUser,


                messages,

                userChatQuery.isLoading,
                userChatQuery.isFetching,
                userChatQuery.error,
                userChatQuery.refetch,


                message,

                handleMessageChange,

                sendMessage,

                sendCurrentMessage,

                sendMessageMutation.isPending,
                sendMessageMutation.error,
                sendMessageMutation.isSuccess,


                isStartChatOpen,

                openStartChat,
                closeStartChat,

                selectUser,
                clearSelectedUser,
                startChatWithUser,

            ]
        );


    return (
        <InternalChatContext.Provider
            value={value}
        >
            {children}
        </InternalChatContext.Provider>
    );
};


export const useInternalChat =
    () => {

        const context =
            useContext(
                InternalChatContext
            );


        if (!context) {

            throw new Error(
                "useInternalChat must be used inside InternalChatProvider"
            );

        }


        return context;
    };