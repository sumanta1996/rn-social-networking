export const FETCH_NOTIFICATIONS = 'FETCH_NOTIFICATIONS';
export const NO_NEW_NOTIFICATION = 'NO_NEW_NOTIFICATION';

export const notificationCreator = (id, type, body, title, imageId, operationDoneBy, data) => {
    return async (dispatch, getState) => {
        let updatedUserDatas = [];
        if (type === 'Mentioned' && data.usersMentioned.length > 0) {
            for (let key in data.usersMentioned) {
                const userid = getState().user.enitreUserDatabase.find(eachUser => eachUser.username === data.usersMentioned[key]).id;
                const response = await fetch(`https://rn-social-networking.firebaseio.com/users/${userid}.json`, {
                    method: 'GET',
                });
                let resData;
                if (response.ok) {
                    resData = await response.json();
                    updatedUserDatas.push({
                        ...resData,
                        id: userid
                    })
                }
            }
        } else {
            const response = await fetch(`https://rn-social-networking.firebaseio.com/users/${id}.json`, {
                method: 'GET',
            });
            //let userData;
            let resData
            if (response.ok) {
                resData = await response.json();
                updatedUserDatas.push({
                    ...resData,
                    id: id
                })
            }
        }
        for (let key in updatedUserDatas) {
            const userData = updatedUserDatas[key];
            let shouldSend = false;
            if (userData.token) {
                console.log('Token exist');
                shouldSend = true;
            } else {
                //Check whether token exist or not from firebase
            }
            //If token exist then only send notification.
            if (shouldSend) {
                try {
                    await fetch('https://exp.host/--/api/v2/push/send', {
                        method: 'POST',
                        headers: {
                            'accept': 'application/json',
                            'accept-encoding': 'gzip, deflate',
                            'content-type': 'application/json'
                        },
                        body: JSON.stringify({
                            to: userData.token,
                            title: title,
                            body: body,

                        })
                    });
                } catch (err) {
                    console.log(err);
                }
            }

            //But if the user exist then save it in firebase.
            if (userData) {
                const notifications = userData.notifications ? userData.notifications : [];
                let shouldUpdateDb = true;
                notifications.map(each => {
                    if (type === 'Mentioned') {
                        shouldUpdateDb = true;
                    } else if (type === 'Comments') {
                        shouldUpdateDb = true;
                    } else if (type === 'Following') {
                        if (each.operationDoneBy === operationDoneBy && each.type === type) {
                            shouldUpdateDb = false;
                        }
                    } else if (each.type === type && each.operationDoneBy === operationDoneBy && each.imageId === imageId) {
                        shouldUpdateDb = false;
                    }
                })
                if (shouldUpdateDb) {
                    if (type === 'Following') {
                        notifications.push({
                            operationDoneBy: operationDoneBy,
                            type: type,
                            isNew: true,
                        });
                    } else {
                        notifications.push({
                            operationDoneBy: operationDoneBy,
                            imageId: imageId,
                            type: type,
                            isNew: true,
                            comments: type === 'Comments' ? data.comments : null
                        });
                    }
                    await fetch(`https://rn-social-networking.firebaseio.com/users/${userData.id}.json`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            notifications: notifications
                        })
                    })
                }
            }
        }
    }
}

export const fetchNotifications = () => {
    return async (dispatch, getState) => {
        const localId = getState().user.loggedInUserdata.localId;
        const enitreUserDatabase = getState().user.enitreUserDatabase;
        const feedData = getState().images.feedData;
        let newNotification = 0;
        const response = await fetch(`https://rn-social-networking.firebaseio.com/users/${localId}.json`, {
            method: 'GET'
        });
        if (response.ok) {
            const resData = await response.json();
            const notifications = resData.notifications ? resData.notifications : [];
            let updateNotificationData = [];
            notifications.map(each => {
                let pushedObject = {};
                if (each.isNew == true) {
                    newNotification = newNotification + 1;
                }
                //Fetch Image Details
                if (each.type !== 'Following') {
                    feedData.map(feed => {
                        if (feed.id === each.imageId) {
                            pushedObject = {
                                ...pushedObject,
                                image: feed
                            }
                        }
                    })
                }

                //Fetch User details
                enitreUserDatabase.map(user => {
                    if (user.id === each.operationDoneBy) {
                        pushedObject = {
                            ...pushedObject,
                            user: user
                        }
                    }
                });
                pushedObject = {
                    ...pushedObject,
                    type: each.type,
                    comments: each.type === 'Comments' ? each.comments : null
                }
                updateNotificationData.push(pushedObject);
            })
            dispatch({
                type: FETCH_NOTIFICATIONS,
                notifications: updateNotificationData.reverse(),
                newNotification: newNotification
            })
        }

    }
}

export const setNoNewNotification = () => {
    return async (dispatch, getState) => {
        dispatch({
            type: NO_NEW_NOTIFICATION
        });
        const localId = getState().user.loggedInUserdata.localId;
        const response = await fetch(`https://rn-social-networking.firebaseio.com/users/${localId}.json`, {
            method: 'GET'
        });
        if (response.ok) {
            const resData = await response.json();
            const notifications = resData.notifications? resData.notifications: [];
            const updateNotificationData = [];
            notifications.map(each => {
                if (each.isNew === true) {
                    updateNotificationData.push({
                        ...each,
                        isNew: false
                    })
                } else {
                    updateNotificationData.push(each);
                }
            })
            await fetch(`https://rn-social-networking.firebaseio.com/users/${localId}.json`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notifications: updateNotificationData
                })
            });
            fetchNotifications();
        }

    }
}