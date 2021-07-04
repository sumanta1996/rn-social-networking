import { ADD_FOLLOWING, FETCH_ENTIRE_USER, FETCH_STORY_LOGGEDIN, FETCH_USER_DATA, MERGE_TO_FOLLOWERS, MERGE_TO_FOLLOWING, PUSH_MESSAGE_ID_LOGGED_IN, PUSH_STORY_LOGGEDIN, REMOVE_FOLLOWERS, REMOVE_NEW_MESSAGE_ID, SEARCH_USERS, SET_LOGIN_DATA, UPDATE_STORY_LOGGEDIN, VANISHMODE_LOGGEDIN_USER } from "../actions/user";
import { SUBMIT_HANDLER } from "../actions/images";

const initialState = {
    enitreUserDatabase: [],
    userData: null,
    loggedInUserdata: [],
    searchedUsers: [],
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
            console.log('ACTION: ',action);
            return {
                ...state,
                searchedUsers: state.enitreUserDatabase.filter(data => {
                    if(data && data.username) {
                        return data.username.toLowerCase().includes(action.text.toLowerCase()) || data.fullName.toLowerCase().includes(action.text.toLowerCase());
                    }else {
                        return false;
                    }
                    
                })
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
        case PUSH_STORY_LOGGEDIN:
            const stories = [...state.loggedInUserdata.stories];
            stories.push({
                imageUrl: action.imageUrl,
                time: new Date().toISOString(),
                isNew: true,
                id: action.id
            });
            return {
                ...state,
                loggedInUserdata: {
                    ...state.loggedInUserdata,
                    stories: stories
                }
            }
        case FETCH_STORY_LOGGEDIN:
            return {
                ...state,
                loggedInUserdata: {
                    ...state.loggedInUserdata,
                    stories: action.stories
                }
            }
        case UPDATE_STORY_LOGGEDIN:
            let updatedStories = [...state.loggedInUserdata.stories];
            let storyGotUpdatedIndex = updatedStories.findIndex(story => story.id === action.storyid);
            let storyGotUpdated = updatedStories[storyGotUpdatedIndex];
            storyGotUpdated = {
                ...storyGotUpdated,
                viewedStory: action.viewedStory
            }
            updatedStories[storyGotUpdatedIndex] = storyGotUpdated;
            return {
                ...state,
                loggedInUserdata: {
                    ...state.loggedInUserdata,
                    stories: updatedStories
                }
            }
        case VANISHMODE_LOGGEDIN_USER:
            const updatedDataLoggedIn = { ...state.loggedInUserdata };
            updatedDataLoggedIn.vanishModeConversations = action.vanishModeConversations;
            return {
                ...state,
                loggedInUserdata: updatedDataLoggedIn
            }
            
        default: return state;
    }
}

