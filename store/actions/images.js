export const LIKED_HANDLER = 'LIKED_HANDLER';
export const COMMENT_HANDLER = 'COMMENT_HANDLER';
export const SAVED_HANDLER = 'SAVED_HANDLER';
export const SUBMIT_HANDLER = 'SUBMIT_HANDLER';
export const FETCH_DATA = 'FETCH_DATA';
export const FETCH_COMMENTS = 'FETCH_COMMENTS';

export const likedHandler = (imageId, userId, isLiked) => {
    return {
        type: LIKED_HANDLER,
        imageId: imageId,
        userId: userId,
        isLiked: isLiked
    }
}

export const commentsHandler = (imageId, userId, comments) => {
    return {
        type: COMMENT_HANDLER,
        imageId: imageId,
        userId: userId,
        comments: comments
    }
}

export const saveHandler = (imageId, userId, isSaved) => {
    return {
        type: SAVED_HANDLER,
        imageId: imageId,
        userId: userId,
        isSaved: isSaved
    }
}

export const submitImages = (imageUrls, description, userId) => {
    return {
        type: SUBMIT_HANDLER,
        imageUrls: imageUrls,
        userId: userId,
        description: description
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
                imageUrl: response.imageUrl,
                username: response.username,
                likedPeople: response.likedPeople,
                savedBy: response.savedBy
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
        if(fetchedCommentData) {
            fetchedCommentData.map(eachComment => {
                const user = entireUserDatabase.find(user => user.username===eachComment.username);
                const profilImage = user.profileImage;
                commentsData.push({
                    id: eachComment.id,
                    username: eachComment.username,
                    profileImage: profilImage,
                    comments: eachComment.comments
                })
            })
        }
        dispatch( {
            type: FETCH_COMMENTS,
            fetchedCommentData: commentsData
        })
    }
}