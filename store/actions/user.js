import { AsyncStorage } from 'react-native';
import * as Permissions from 'expo-permissions';
import * as Notifications from 'expo-notifications';

export const FETCH_USER_DATA = 'FETCH_USER_DATA';
export const REMOVE_FOLLOWERS = 'REMOVE_FOLLOWERS';
export const ADD_FOLLOWING = 'ADD_FOLLOWING';
export const SEARCH_USERS = 'SEARCH_USERS';
export const LOGIN = 'LOGIN';
export const SET_LOGIN_DATA = 'SET_LOGIN_DATA';
export const FETCH_ENTIRE_USER = 'FETCH_ENTIRE_USER';

export const MERGE_TO_FOLLOWERS = 'MERGE_TO_FOLLOWERS';
export const MERGE_TO_FOLLOWING = 'MERGE_TO_FOLLOWING';

export const removeFollowers = (username, identifier, userTobeRemoved) => {
    return {
        type: REMOVE_FOLLOWERS,
        username: username,
        identifier: identifier,
        userTobeRemoved: userTobeRemoved
    }
}

export const removeFollowing = (userTobeRemoved, idRemovedUser) => {
    return async (dispatch, getState) => {
        const username = getState().user.loggedInUserdata.username;
        const localId = getState().user.loggedInUserdata.localId;

        //Remove users to followers of the addedUser.
        let response = await fetch(`https://rn-social-networking.firebaseio.com/users/${idRemovedUser}.json`, {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error('There seems to be some problem. Contact Admin.');
        }

        let removedUserDetails = await response.json();
        const followers = removedUserDetails.followers;
        let index = followers.findIndex(user => user === username);
        followers.splice(index, 1);
        response = await fetch(`https://rn-social-networking.firebaseio.com/users/${idRemovedUser}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                followers: followers
            })
        });
        if (response.ok) {
            dispatch({
                type: MERGE_TO_FOLLOWERS,
                followers: followers
            })
        }

        //Remove users from following to loggedInuser.
        response = await fetch(`https://rn-social-networking.firebaseio.com/users/${localId}.json`, {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error('There seems to be some problem. Contact Admin.');
        }
        let loggedInUser = await response.json();
        const following = loggedInUser.following;
        index = following.findIndex(user => user === userTobeRemoved);
        following.splice(index, 1);

        response = await fetch(`https://rn-social-networking.firebaseio.com/users/${localId}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                following: following
            })
        });

        dispatch({
            type: ADD_FOLLOWING,
            following: following
        })
    }
}

export const addFollowing = (userTobeAdded, idAddedUser) => {
    return async (dispatch, getState) => {
        const username = getState().user.loggedInUserdata.username;
        const localId = getState().user.loggedInUserdata.localId;

        //Add users to followers of the addedUser.
        let response = await fetch(`https://rn-social-networking.firebaseio.com/users/${idAddedUser}.json`, {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error('There seems to be some problem. Contact Admin.');
        }

        let addedUserDetails = await response.json();
        const followers = addedUserDetails.followers ? addedUserDetails.followers : [];
        followers.push(username);
        response = await fetch(`https://rn-social-networking.firebaseio.com/users/${idAddedUser}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                followers: followers
            })
        });
        if (response.ok) {
            dispatch({
                type: MERGE_TO_FOLLOWERS,
                followers: followers
            })
        }

        //Add users to following to loggedInuser.
        response = await fetch(`https://rn-social-networking.firebaseio.com/users/${localId}.json`, {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error('There seems to be some problem. Contact Admin.');
        }
        let loggedInUser = await response.json();
        const following = loggedInUser.following ? loggedInUser.following : [];
        following.push(userTobeAdded);

        response = await fetch(`https://rn-social-networking.firebaseio.com/users/${localId}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                following: following
            })
        });

        dispatch({
            type: ADD_FOLLOWING,
            following: following
        })
    }
}

export const removeFollowersLoggedInUser = (userTobeRemoved, idRemovedUser) => {
    return async (dispatch, getState) => {
        const username = getState().user.loggedInUserdata.username;
        const localId = getState().user.loggedInUserdata.localId;

        //Remove users from following of the removedUser.
        let response = await fetch(`https://rn-social-networking.firebaseio.com/users/${idRemovedUser}.json`, {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error('There seems to be some problem. Contact Admin.');
        }

        let removedUserDetails = await response.json();
        const following = removedUserDetails.following;
        let index = following.findIndex(user => user === username);
        following.splice(index, 1);
        response = await fetch(`https://rn-social-networking.firebaseio.com/users/${idRemovedUser}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                following: following
            })
        });

        //TODO
        if (response.ok) {
            dispatch({
                type: MERGE_TO_FOLLOWING,
                following: following
            })
        }

        //Remove users from followers of loggedInuser.
        response = await fetch(`https://rn-social-networking.firebaseio.com/users/${localId}.json`, {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error('There seems to be some problem. Contact Admin.');
        }
        let loggedInUser = await response.json();
        const followers = loggedInUser.followers;
        index = followers.findIndex(user => user === userTobeRemoved);
        followers.splice(index, 1);

        response = await fetch(`https://rn-social-networking.firebaseio.com/users/${localId}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                followers: followers
            })
        });

        dispatch({
            type: REMOVE_FOLLOWERS,
            followers: followers
        })
    }
}

export const fetchFilteredData = searchText => {
    return {
        type: SEARCH_USERS,
        text: searchText
    }
}

export const login = (email, password) => {
    return async dispatch => {
        let response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAOA-42HV4pasMPJPSrzuFvdoD-r0uTFHo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                returnSecureToken: true
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            let message = 'Something went wrong!'
            if (errData.error.message === 'EMAIL_NOT_FOUND') {
                message = 'Please enter a valid email address.';
            } else if (errData.error.message === 'INVALID_PASSWORD') {
                message = 'Please enter a valid password.';
            } else if (errData.error.message === 'USER_DISABLED') {
                message = 'Contact your Admin. Your account is deactivated.'
            }
            throw new Error(message);
        }

        const resData = await response.json();
        const tokenExpiry = new Date(new Date().getTime() + (+resData.expiresIn) * 1000);
        const localId = resData.localId;
        saveToStorage(resData.idToken, localId, tokenExpiry);

        response = await fetch(`https://rn-social-networking.firebaseio.com/users/${localId}.json`, {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error('There seems to be some problem. Contact Admin.');
        }

        let loggedInUser = await response.json();
        loggedInUser = {
            ...loggedInUser,
            localId: localId
        }
        dispatch({
            type: SET_LOGIN_DATA,
            loggedInUser: loggedInUser
        })

    }
}

export const fetchUserData = (userId, isItLoggedInProfile) => {
    return async dispatch => {
        const response = await fetch(`https://rn-social-networking.firebaseio.com/users/${userId}.json`, {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error('There seems to be some problem. Contact Admin.');
        }

        let loggedInUser = await response.json();
        if (isItLoggedInProfile) {
            loggedInUser = {
                ...loggedInUser,
                localId: userId
            }
            dispatch({
                type: SET_LOGIN_DATA,
                loggedInUser: loggedInUser
            })
        } else {
            loggedInUser = {
                ...loggedInUser,
                localId: userId
            }
            dispatch({
                type: FETCH_USER_DATA,
                userData: loggedInUser
            })
        }

    }
}

export const fetchEntireUserDatabase = () => {
    return async dispatch => {
        const response = await fetch('https://rn-social-networking.firebaseio.com/users.json', {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error('There seems to be some problem. Contact Admin.');
        }

        let resData = await response.json();
        let entireUserDatabase = [];
        for (let key in resData) {
            entireUserDatabase.push({
                id: key,
                username: resData[key].username,
                fullName: resData[key].fullName,
                profileImage: resData[key].profileImage,
                posts: resData[key].posts,
                following: resData[key].following,
                followers: resData[key].followers,
                status: resData[key].status,
                token: resData[key].token
            })
        }

        dispatch({
            type: FETCH_ENTIRE_USER,
            entireUserDatabase: entireUserDatabase
        })


    }
}

export const setPushToken = () => {
    return async (dispatch, getState) => {
        const loggedInUser = getState().user.loggedInUserdata;

        let pushToken;
        let statusObj = await Permissions.getAsync(Permissions.NOTIFICATIONS);
        if (statusObj.status !== 'granted') {
            statusObj = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        }
        if (statusObj.status !== 'granted') {
            pushToken = null;
        } else {
            pushToken = (await Notifications.getExpoPushTokenAsync()).data;
        }

        let status = false;

        if (loggedInUser.token) {
            if (loggedInUser.token !== pushToken) {
                //Push token exist but got changed i.e. changed mobile
                status = true;
            }
        } else {
            //Push token doesn't exist
            status = true;
        }

        if (status === true) {
            await fetch(`https://rn-social-networking.firebaseio.com/users/${loggedInUser.localId}.json`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: pushToken
                })

            })
            const updatedLoggedInData = {
                ...loggedInUser,
                token: pushToken
            }
            dispatch({
                type: SET_LOGIN_DATA,
                loggedInUser: updatedLoggedInData
            })
        }
    }
}

const saveToStorage = (token, userId, expiresIn) => {
    AsyncStorage.setItem('userData', JSON.stringify({
        token: token,
        userId: userId,
        expiresIn: expiresIn.toISOString()
    }))
}