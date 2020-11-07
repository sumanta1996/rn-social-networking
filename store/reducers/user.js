import { ADD_FOLLOWING, FETCH_ENTIRE_USER, FETCH_USER_DATA, MERGE_TO_FOLLOWERS, MERGE_TO_FOLLOWING, PUSH_MESSAGE_ID_LOGGED_IN, REMOVE_FOLLOWERS, REMOVE_NEW_MESSAGE_ID, SEARCH_USERS, SET_LOGIN_DATA } from "../actions/user";
import { SUBMIT_HANDLER } from "../actions/images";

const initialState = {
    enitreUserDatabase: [],
    userData: null,
    loggedInUserdata: [],
    searchedUsers: []
}

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_LOGIN_DATA:
            return {
                ...state,
                loggedInUserdata: action.loggedInUser
            }
        case FETCH_USER_DATA:
            return {
                ...state,
                userData: action.userData
            }
        case FETCH_ENTIRE_USER:
            return {
                ...state,
                enitreUserDatabase: action.entireUserDatabase
            }
        case REMOVE_FOLLOWERS:
            let updateLoggedInData = { ...state.loggedInUserdata };
            updateLoggedInData = {
                ...updateLoggedInData,
                followers: action.followers
            }
            return {
                ...state,
                loggedInUserdata: updateLoggedInData
            }
        case MERGE_TO_FOLLOWING:
            let updateUserData = { ...state.userData };
            updateUserData = {
                ...updateUserData,
                following: action.following
            }
            return {
                ...state,
                userData: updateUserData
            }
        case ADD_FOLLOWING:
            let updatedLoggedInData = { ...state.loggedInUserdata };
            updatedLoggedInData = {
                ...updatedLoggedInData,
                following: action.following
            }
            return {
                ...state,
                loggedInUserdata: updatedLoggedInData
            }
        case MERGE_TO_FOLLOWERS:
            let updatedUserData = { ...state.userData };
            updatedUserData = {
                ...updatedUserData,
                followers: action.followers
            }
            return {
                ...state,
                userData: updatedUserData
            }
        case SEARCH_USERS:
            return {
                ...state,
                searchedUsers: state.enitreUserDatabase.filter(data => data.username.toLowerCase().includes(action.text.toLowerCase()) || data.fullName.toLowerCase().includes(action.text.toLowerCase()))
            }
        case SUBMIT_HANDLER:
            const updatedLoggedinUserData = { ...state.loggedInUserdata };
            updatedLoggedinUserData.posts = +updatedLoggedinUserData.posts + 1;

            let updatedEnitreUserDatabase = [...state.enitreUserDatabase];
            const updatedUserIndex = updatedEnitreUserDatabase.findIndex(user => user.username === updatedLoggedinUserData.username);
            updatedEnitreUserDatabase[updatedUserIndex] = updatedLoggedinUserData;

            return {
                ...state,
                loggedInUserdata: updatedLoggedinUserData,
                enitreUserDatabase: updatedEnitreUserDatabase
            }
        case PUSH_MESSAGE_ID_LOGGED_IN:
            const updatedLoggin = { ...state.loggedInUserdata };
            const messageids = updatedLoggin.messageIds? updatedLoggin.messageIds: [];
            if (!messageids.includes(action.conversationId)) {
                messageids.push(action.conversationId);
                return {
                    ...state,
                    loggedInUserdata: {
                        ...state.loggedInUserdata,
                        messageIds: messageids
                    }
                }
            }
        case REMOVE_NEW_MESSAGE_ID: 
            return {
                ...state,
                loggedInUserdata: {
                    ...state.loggedInUserdata,
                    newMessageIds: action.newMessageIds
                }
            }
        default: return state;
    }
}

