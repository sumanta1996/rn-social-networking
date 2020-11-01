export const LIKED_HANDLER = 'LIKED_HANDLER';
export const COMMENT_HANDLER = 'COMMENT_HANDLER';
export const SAVED_HANDLER = 'SAVED_HANDLER';
export const SUBMIT_HANDLER = 'SUBMIT_HANDLER';
export const FETCH_DATA = 'FETCH_DATA';
export const FETCH_COMMENTS = 'FETCH_COMMENTS';

export const likedHandler = (imageId, userId, isLiked) => {
    return async dispatch => {
        let response = await fetch(`https://rn-social-networking.firebaseio.com/feed/${imageId}.json`, {
            method: 'GET'
        });
        if (!response.ok) {
            //Throw error
        }

        const data = await response.json();
        let likedPeople = data.likedPeople ? data.likedPeople : [];

        if (isLiked) {
            if (!likedPeople.includes(userId)) {
                likedPeople.push(userId);
            }
        } else {
            const index = likedPeople.findIndex(user => user === userId);
            likedPeople.splice(index, 1);
        }
        response = await fetch(`https://rn-social-networking.firebaseio.com/feed/${imageId}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                likedPeople: likedPeople
            })
        })
        dispatch({
            type: LIKED_HANDLER,
            imageId: imageId,
            userId: userId,
            isLiked: isLiked
        })
    }
}

export const commentsHandler = (imageId, userId, comments) => {
    return async dispatch => {
        let response = await fetch(`https://rn-social-networking.firebaseio.com/feed/${imageId}.json`, {
            method: 'GET'
        });
        if (!response.ok) {
            //Throw error
        }

        const data = await response.json();
        let commentsData = data.comments ? data.comments : [];
        const id = new Date().toString();
        commentsData.push({
            id: id,
            username: userId,
            comments: comments,
            isLiked: false
        });

        response = await fetch(`https://rn-social-networking.firebaseio.com/feed/${imageId}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                comments: commentsData
            })
        });

        dispatch({
            type: COMMENT_HANDLER,
            id: id,
            imageId: imageId,
            userId: userId,
            comments: comments
        });
    }
}

export const saveHandler = (imageId, userId, isSaved) => {
    return async dispatch => {
        let response = await fetch(`https://rn-social-networking.firebaseio.com/feed/${imageId}.json`, {
            method: 'GET'
        });
        if (response.ok) {
            let resData = await response.json();
            const savedBy = resData.savedBy ? resData.savedBy : [];
            if (isSaved === true) {
                if (!savedBy.includes(userId)) {
                    savedBy.push(userId);
                }
            } else {
                if (savedBy.includes(userId)) {
                    const index = savedBy.findIndex(user => user === userId);
                    savedBy.splice(index, 1);
                }
            }

            response = await fetch(`https://rn-social-networking.firebaseio.com/feed/${imageId}.json`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    savedBy: savedBy
                })
            });
            dispatch({
                type: SAVED_HANDLER,
                imageId: imageId,
                userId: userId,
                isSaved: isSaved
            })
        }
    }
}

export const submitImages = (imageUrls, description, userId) => {
    return async (dispatch, getState) => {
        const loggedInUserdata = getState().user.loggedInUserdata;
        let response = await fetch('https://rn-social-networking.firebaseio.com/feed.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageUrl: imageUrls,
                description: description,
                username: loggedInUserdata.username,
                likedPeople: [],
                comments: [],
                savedBy: []
            })
        });
        if (!response.ok) {
            throw new Error('Submission failed');
        }
        const resData = await response.json();

        response = await fetch(`https://rn-social-networking.firebaseio.com/users/${loggedInUserdata.localId}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                posts: +loggedInUserdata.posts + 1
            })
        })
        dispatch({
            type: SUBMIT_HANDLER,
            id: resData.name,
            imageUrls: imageUrls,
            userId: userId,
            description: description
        })
    }
}

export const fetchFeedData = () => {
    return async dispatch => {
        let response = await fetch('https://rn-social-networking.firebaseio.com/feed.json', {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error('Something went wrong');
        }
        response = await response.json();
        const feedData = [];
        for (let key in response) {
            feedData.push({
                id: key,
                imageUrl: response[key].imageUrl,
                description: response[key].description,
                username: response[key].username,
                likedPeople: response[key].likedPeople ? response[key].likedPeople : [],
                comments: response[key].comments ? response[key].comments : [],
                savedBy: response[key].savedBy ? response[key].savedBy : []
            })
        }
        dispatch({
            type: FETCH_DATA,
            feedData: feedData
        })
    }
}

export const fetchCommentsData = imageId => {
    return (dispatch, getState) => {
        let commentsData = [];
        let fetchedCommentData = getState().images.feedData.find(feed => feed.id === imageId).comments;
        const entireUserDatabase = getState().user.enitreUserDatabase;
        if (fetchedCommentData) {
            fetchedCommentData.map(eachComment => {
                const user = entireUserDatabase.find(user => user.username === eachComment.username);
                const profilImage = user.profileImage;
                commentsData.push({
                    id: eachComment.id,
                    username: eachComment.username,
                    profileImage: profilImage,
                    comments: eachComment.comments
                })
            })
        }
        dispatch({
            type: FETCH_COMMENTS,
            fetchedCommentData: commentsData
        })
    }
}