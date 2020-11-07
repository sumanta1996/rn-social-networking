export const SET_MESSAGES = 'SET_MESSAGES';
export const FETCH_NOTIFICATION_ID = 'FETCH_NOTIFICATION_ID';
export const FETCH_NOTIFICATIONS = 'FETCH_NOTIFICATIONS';

//pushToken of the message we sending to
//conversationId if exist 
//userId of the user we sending to
//message content
export const setMessages = (pushToken, conversationId, userId, message) => {
    return async (dispatch, getState) => {
        const loggedInUser = getState().user.loggedInUserdata;
        const timestamp = new Date().toISOString();

        if (conversationId) {
            dispatch({
                type: SET_MESSAGES,
                id: conversationId,
                userId: loggedInUser.localId,
                message: message,
                time: timestamp
            })
            const response = await fetch(`https://rn-social-networking.firebaseio.com/messages/${conversationId}.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: loggedInUser.localId,
                    message: message,
                    time: timestamp
                })
            })
            if (response.ok) {
                await setMessageIdToUser(userId, conversationId);
                await setMessageIdToUser(loggedInUser.localId, conversationId);
                await setNewMessagesToUser(userId, conversationId);
                await sendMessageNotification(pushToken, 'Message', loggedInUser.username + ' sends you a message', conversationId);
            }

        } else {
            //If new conversation thread
            const id = userId + loggedInUser.localId; //Conversation thread id
            dispatch({
                type: SET_MESSAGES,
                id: id,
                userId: loggedInUser.localId,
                message: message,
                time: timestamp
            })
            const response = await fetch(`https://rn-social-networking.firebaseio.com/messages/${id}.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: loggedInUser.localId,
                    message: message,
                    time: timestamp
                })
            });
            if (response.ok) {
                await setMessageIdToUser(userId, id);
                await setMessageIdToUser(loggedInUser.localId, id);
                await setNewMessagesToUser(userId, id);
                await sendMessageNotification(pushToken, 'Message', loggedInUser.username + ' sends you a message', id);
            }
        }
    }
}

export const fetchMessagesIdSpecific = (messageId, isNew) => {
    return async dispatch => {
        const response = await fetch(`https://rn-social-networking.firebaseio.com/messages/${messageId}.json`, {
            method: 'GET'
        });
        if (response.ok) {
            const resData = await response.json();
            let messageData = [];
            var totalKeys = Object.keys(resData).length;
            var counter = 0;

            for (let key in resData) {
                if (counter === totalKeys - 1 && isNew) {
                    messageData.push({
                        ...resData[key],
                        isNew: true
                    });
                } else {
                    messageData.push(resData[key]);
                }
                counter = counter + 1;
            }

            dispatch({
                type: FETCH_NOTIFICATION_ID,
                id: messageId,
                data: messageData
            })
        }
    }
}

export const fetchAllMessages = () => {
    return async (dispatch, getState) => {
        let response = await fetch('https://rn-social-networking.firebaseio.com/messages.json', {
            method: 'GET'
        });
        let resData = await response.json();
        let conversationThread = {};
        for (let key in resData) {
            const data = [];
            for (let key1 in resData[key]) {
                data.push(resData[key][key1]);
            }

            conversationThread = {
                [key]: data,
                ...conversationThread
            }
        }

        /* const loggedInUser = getState().user.loggedInUserdata;
        response = await fetch(`https://rn-social-networking.firebaseio.com/users/${loggedInUser.localId}.json`, {
            method: 'GET'
        });
        let newMessageIds = [];
        if (response.ok) {
            resData = await response.json();
            newMessageIds = resData.newMessageIds;
        } */


        dispatch({
            type: FETCH_NOTIFICATIONS,
            conversationThread: conversationThread
        })
    }
}

const sendMessageNotification = async (pushToken, title, body, conversationId) => {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'accept-encoding': 'gzip, deflate',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            to: pushToken,
            title: title,
            body: body,
            data: {
                conversationId: conversationId
            }
        })
    });
}

const setMessageIdToUser = async (userId, conversationId) => {
    const url = `https://rn-social-networking.firebaseio.com/users/${userId}.json`;

    const response = await fetch(url, {
        method: 'GET'
    });
    const resData = await response.json();
    //console.log(userId);
    const messageIds = resData.messageIds ? resData.messageIds : [];
    if (!messageIds.includes(conversationId)) {
        messageIds.push(conversationId);

        await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messageIds: messageIds
            })
        })
    }
}

export const setNewMessagesToUser = async (userId, messageId) => {
    const url = `https://rn-social-networking.firebaseio.com/users/${userId}.json`;

    const response = await fetch(url, {
        method: 'GET'
    });
    const resData = await response.json();
    const newMessageIds = resData.newMessageIds ? resData.newMessageIds : [];
    if (!newMessageIds.includes(messageId)) {
        newMessageIds.push(messageId);

        await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                newMessageIds: newMessageIds
            })
        })
    }
}