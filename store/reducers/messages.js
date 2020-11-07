import { FETCH_NOTIFICATION_ID, SET_MESSAGES } from "../actions/messages"
import { FETCH_NOTIFICATIONS } from "../actions/notification";

const initialState = {
    conversationThread: {},
    activeThreadId: null,
    newMessageIds: []
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
                time: action.time
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
        default: return state;
    }
}