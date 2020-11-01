import { FETCH_NOTIFICATIONS, NO_NEW_NOTIFICATION } from "../actions/notification";

const initialState = {
    notifications: [],
    newNotification: 0
}

export default (state = initialState, action) => {
    switch(action.type) {
        case FETCH_NOTIFICATIONS:
            return {
                ...state,
                notifications: action.notifications,
                newNotification: action.newNotification
            }
        case NO_NEW_NOTIFICATION:
            return {
                ...state,
                newNotification: 0
            }
        default: return state;
    }
}