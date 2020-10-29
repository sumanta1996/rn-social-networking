import { ADD_FOLLOWING, FETCH_USER_DATA, REMOVE_FOLLOWERS, SEARCH_USERS } from "../actions/user";
import { userData, feedData } from '../../data/dummy-data';
import { SUBMIT_HANDLER } from "../actions/images";

const initialState = {
    enitreUserDatabase: userData,
    userData: null,
    loggedInUserdata: userData.find(user => user.username === 'r.das'),
    searchedUsers: []
}

export default (state = initialState, action) => {
    const manageFollowHandler = () => {
        const updateUserDatabase = [...state.enitreUserDatabase];
        const index = state.enitreUserDatabase.findIndex(user => user.username === action.username);
        let updateduserData = state.enitreUserDatabase.find(user => user.username === action.username);
        let updatedDatas = action.identifier === 'followers' ? updateduserData.followers : updateduserData.following;

        const indexActionPerformedUser = state.enitreUserDatabase.findIndex(
            user => user.username === (action.identifier ? action.userTobeRemoved : action.userTobeAdded));
        if (action.identifier) {
            const indexUserRemoved = state.enitreUserDatabase.findIndex(user => user.username === action.userTobeRemoved);
            let updatedUserRemovedData = state.enitreUserDatabase.find(user => user.username === action.userTobeRemoved);
            //For the user we gonna remove it gonna be opposite of what it is.
            let updatedUserRemovedFollowData = action.identifier === 'followers' ? updatedUserRemovedData.following : updatedUserRemovedData.followers;
            updatedUserRemovedFollowData = updatedUserRemovedFollowData.filter(data => data !== action.username);
            const identifier = action.identifier === 'followers' ? 'following' : 'followers';
            updatedUserRemovedData = {
                ...updatedUserRemovedData,
                [identifier]: updatedUserRemovedFollowData
            }
            updateUserDatabase[indexUserRemoved] = updatedUserRemovedData;

            //Removing users
            updatedDatas = updatedDatas.filter(data => data !== action.userTobeRemoved);
        } else {
            const indexUserRemoved = state.enitreUserDatabase.findIndex(user => user.username === action.userTobeAdded);
            let updatedUserRemovedData = state.enitreUserDatabase.find(user => user.username === action.userTobeAdded);

            let updatedUserRemovedFollowData = updatedUserRemovedData.followers;
            updatedUserRemovedFollowData.push(action.username);
            updatedUserRemovedData = {
                ...updatedUserRemovedData,
                [action.identifier]: updatedUserRemovedFollowData
            }
            updateUserDatabase[indexUserRemoved] = updatedUserRemovedData;

            //Adding users
            updatedDatas.push(action.userTobeAdded);
        }
        updateduserData = {
            ...updateduserData,
            [action.identifier]: updatedDatas
        };
        updateUserDatabase[index] = updateduserData;
        return updateUserDatabase;
    }

    switch (action.type) {
        case FETCH_USER_DATA:
            if (action.isItLoggedInProfile) {
                return {
                    ...state,
                    loggedInUserdata: state.enitreUserDatabase.find(user => user.username === action.username)
                }
            } else {
                return {
                    ...state,
                    userData: state.enitreUserDatabase.find(user => user.username === action.username)
                }
            }
        case REMOVE_FOLLOWERS:
            return {
                ...state,
                enitreUserDatabase: manageFollowHandler()
            }
        case ADD_FOLLOWING:
            return {
                ...state,
                enitreUserDatabase: manageFollowHandler()
            }
        case SEARCH_USERS:
            return {
                ...state,
                searchedUsers: state.enitreUserDatabase.filter(data => data.username.toLowerCase().includes(action.text.toLowerCase()) || data.fullName.toLowerCase().includes(action.text.toLowerCase()))
            }
        case SUBMIT_HANDLER:
            const updatedLoggedinUserData = { ...state.loggedInUserdata };
            updatedLoggedinUserData.posts = +updatedLoggedinUserData.posts + 1;

            let updatedEnitreUserDatabase = [ ...state.enitreUserDatabase ];
            const updatedUserIndex = updatedEnitreUserDatabase.findIndex(user => user.username === updatedLoggedinUserData.username);
            updatedEnitreUserDatabase[updatedUserIndex] = updatedLoggedinUserData;

            return {
                ...state,
                loggedInUserdata: updatedLoggedinUserData,
                enitreUserDatabase: updatedEnitreUserDatabase
            }
        default: return state;
    }
}

