import {
    createContext,
    useContext,
    useMemo,
    useState,
} from "react";

import {
    useGetConversations,
    useGetUserChat,
    useSendInternalMessage,
} from "../../../../queries/internalChat.queries";

import {
    useCrmUsers,
} from "../../../../queries/users.queries";


const InternalChatContext = createContext(null);


export const InternalChatProvider = ({
    children,
}) => {
    /* ==========================================
       SELECTED USER
    ========================================== */

    const [
        selectedUser,
        setSelectedUser,
    ] = useState(null);
    console.log("SELECTD ", selectedUser)

    /* ==========================================
       START CHAT MODAL
    ========================================== */

    const [
        isStartChatOpen,
        setIsStartChatOpen,
    ] = useState(false);


    /* ==========================================
       MESSAGE INPUT
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

       Used inside StartChatModal
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
    }, [usersQuery.data]);


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
    }, [userChatQuery.data]);


    /* ==========================================
       SEND MESSAGE MUTATION
    ========================================== */

    const sendMessageMutation =
        useSendInternalMessage();


    /* ==========================================
       SELECT USER
    ========================================== */

    const selectUser = (user) => {
        if (!user) {
            return;
        }

        setSelectedUser(user);
        setMessage("");
    };


    /* ==========================================
       CLEAR SELECTED USER
    ========================================== */

    const clearSelectedUser = () => {
        setSelectedUser(null);
        setMessage("");
    };


    /* ==========================================
       START CHAT MODAL
    ========================================== */

    const openStartChat = () => {
        setIsStartChatOpen(true);
    };


    const closeStartChat = () => {
        setIsStartChatOpen(false);
    };


    /* ==========================================
       START CHAT WITH USER
    ========================================== */

    const startChatWithUser = (user) => {
        if (!user) {
            return;
        }

        setSelectedUser({ email: user?.description, user_id: user?.id, name: user?.name });
        setMessage("");
        setIsStartChatOpen(false);
    };


    /* ==========================================
       SEND MESSAGE
       
       Receives:
       
       {
           to_email,
           message
       }
    ========================================== */

    const sendMessage = async ({
        to_email,
        message: messageText,
    }) => {
        const text =
            messageText?.trim();

        if (!text) {
            return;
        }

        if (!to_email) {
            return;
        }

        try {
            await sendMessageMutation.mutateAsync({
                to_email,
                message: text,
            });

            /*
             * Clear input after
             * successful message.
             */
            setMessage("");

            /*
             * Refresh selected user's
             * conversation.
             */
            await userChatQuery.refetch();

            /*
             * Refresh conversation list
             * so latest message/time appears
             * in sidebar.
             */
            await conversationsQuery.refetch();

        } catch (error) {
            console.error(
                "Failed to send internal message:",
                error
            );

            /*
             * Let the component know
             * about the error through
             * sendMessageError.
             */
        }
    };


    /* ==========================================
       SEND CURRENT INPUT MESSAGE
       
       Optional helper so components can
       simply call sendCurrentMessage()
    ========================================== */

    const sendCurrentMessage = async () => {
        if (!selectedUser?.email) {
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

            message: text,
        });
    };


    /* ==========================================
       CONTEXT VALUE
    ========================================== */

    const value = useMemo(
        () => ({
            /* ==================================
               CONVERSATIONS
            ================================== */

            conversations,

            isConversationsLoading:
                conversationsQuery.isLoading,

            isConversationsFetching:
                conversationsQuery.isFetching,

            conversationsError:
                conversationsQuery.error,

            refetchConversations:
                conversationsQuery.refetch,


            /* ==================================
               ALL CRM USERS
            ================================== */

            users,

            isUsersLoading:
                usersQuery.isLoading,

            isUsersFetching:
                usersQuery.isFetching,

            usersError:
                usersQuery.error,

            refetchUsers:
                usersQuery.refetch,


            /* ==================================
               SELECTED USER
            ================================== */

            selectedUser,

            setSelectedUser,

            selectUser,

            clearSelectedUser,

            startChatWithUser,


            /* ==================================
               MESSAGES
            ================================== */

            messages,

            isMessagesLoading:
                userChatQuery.isLoading,

            isMessagesFetching:
                userChatQuery.isFetching,

            messagesError:
                userChatQuery.error,

            refetchMessages:
                userChatQuery.refetch,


            /* ==================================
               MESSAGE INPUT
            ================================== */

            message,

            setMessage,


            /* ==================================
               SEND MESSAGE
            ================================== */

            sendMessage,

            sendCurrentMessage,

            isSendingMessage:
                sendMessageMutation.isPending,

            sendMessageError:
                sendMessageMutation.error,

            sendMessageSuccess:
                sendMessageMutation.isSuccess,


            /* ==================================
               START CHAT MODAL
            ================================== */

            isStartChatOpen,

            openStartChat,

            closeStartChat,
        }),
        [
            /* Conversations */

            conversations,

            conversationsQuery.isLoading,

            conversationsQuery.isFetching,

            conversationsQuery.error,

            conversationsQuery.refetch,


            /* Users */

            users,

            usersQuery.isLoading,

            usersQuery.isFetching,

            usersQuery.error,

            usersQuery.refetch,


            /* Selected user */

            selectedUser,


            /* Messages */

            messages,

            userChatQuery.isLoading,

            userChatQuery.isFetching,

            userChatQuery.error,

            userChatQuery.refetch,


            /* Input */

            message,


            /* Mutation */

            sendMessageMutation.isPending,

            sendMessageMutation.error,

            sendMessageMutation.isSuccess,


            /* Modal */

            isStartChatOpen,
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


export const useInternalChat = () => {
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