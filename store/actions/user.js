import { SUBMIT_HANDLER } from "./images";

export const FETCH_USER_DATA = 'FETCH_USER_DATA';
export const REMOVE_FOLLOWERS = 'REMOVE_FOLLOWERS';
export const ADD_FOLLOWING = 'ADD_FOLLOWING';
export const SEARCH_USERS = 'SEARCH_USERS';

export const fetchUserData = (username, isItLoggedInProfile) => {
    return {
        type: FETCH_USER_DATA,
        username: username,
        isItLoggedInProfile: isItLoggedInProfile
    }
}

export const removeFollowers = (username, identifier, userTobeRemoved) => {
    return {
        type: REMOVE_FOLLOWERS,
        username: username,
        identifier: identifier,
        userTobeRemoved: userTobeRemoved
    }
}

export const addFollowing = (username, userTobeAdded) => {
    return {
        type: ADD_FOLLOWING,
        username: username,
        userTobeAdded: userTobeAdded
    }
}

export const fetchFilteredData = searchText => {
    return {
        type: SEARCH_USERS,
        text: searchText
    }
}