import { FETCH_NOTIFICATION_ID, SET_MESSAGES } from "../actions/messages"
import { FETCH_NOTIFICATIONS } from "../actions/notification";

const initialState = {
    conversationThread: {},
    activeThreadId: null,
    newMessageIds: [],
    /* vanishConversationThread: {},
    vanishConversationUserData: {} */
}

/* {
    id: [
        {}, {}, {}
    ],
        id1: [
            {}, {}, {}
        ]
} */

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_MESSAGES:
            let updatedThread = { ...state.conversationThread };
            const id = action.id;
            let updatedArr = [];
            if (updatedThread[id]) {
                updatedArr = [...updatedThread[id]];
            }
            updatedArr.push({
                userId: action.userId,
                message: action.message,
                time: action.time,
                isShare: action.isShare,
                isUpload: action.isUpload,
                repliedId: action.repliedId,
                repliedText: action.repliedText,
                isVanishMode: action.isVanishMode? action.isVanishMode: false
            })
            updatedThread = {
                ...updatedThread,
                [id]: updatedArr
            }
            return {
                ...state,
                conversationThread: updatedThread,
                activeThreadId: id
            }
        case FETCH_NOTIFICATION_ID:
            let updatedConvThread = { ...state.conversationThread };
            updatedConvThread = {
                ...updatedConvThread,
                [action.id]: action.data
            }
            return {
                ...state,
                conversationThread: updatedConvThread,
                activeThreadId: action.id
            }
        case FETCH_NOTIFICATIONS:
            return {
                ...state,
                conversationThread: action.conversationThread
            }
        /* case SET_VANISH_NOTIFICATION_USER_MAPPING:
            const updatedVanishMapping = {...state.vanishConversationUserData};
            updatedVanishMapping[action.conversationId] = action.vanishFlag;
            return {
                ...state,
                vanishConversationUserData: updatedVanishMapping
            }
        case SET_VANISH_NOTIFICATIONS:
            let updatedData = {...state.vanishConversationThread};
            let updatedEachThread = [];
            if(updatedData[action.conversationId]) {
                updatedEachThread = [...updatedData[action.conversationId]];
                updatedEachThread.push({
                    userId: action.userId,
                    message: action.message,
                    time: action.time,
                });
                updatedData = {
                    ...updatedData,
                    [action.conversationId]: updatedEachThread
                }
            }
            return {
                ...state,
                vanishConversationThread: updatedData
            } */

        default: return state;
    }
}