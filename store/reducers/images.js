//import { feedData } from "../../data/dummy-data";
import { COMMENT_HANDLER, FETCH_COMMENTS, FETCH_DATA, FETCH_STORIES, LIKED_COMMENT_HANDLER, LIKED_HANDLER, SAVED_HANDLER, SUBMIT_HANDLER, UPDATE_STORIES_USER } from "../actions/images";

const initialState = {
    feedData: [],
    commentsData: [],
    stories: []
}

export default (state = initialState, action) => {
    if (action.type === FETCH_DATA) {
        return {
            ...state,
            feedData: action.feedData
        }
    }
    else if (action.type === LIKED_HANDLER) {
        const updatedFeedData = [...state.feedData];
        let imageData = updatedFeedData.find(feed => feed.id === action.imageId);
        let index = updatedFeedData.findIndex(feed => feed.id === action.imageId);
        let likedPeople = imageData.likedPeople;
        if (action.isLiked) {
            //If true then push
            if (!likedPeople.includes(action.userId)) {
                likedPeople.push(action.userId);
                imageData = {
                    ...imageData,
                    likedPeople: likedPeople
                }
                updatedFeedData[index] = imageData;
            }
        } else {
            //Else disliked thus pop
            if (likedPeople.includes(action.userId)) {
                likedPeople.splice(likedPeople.indexOf(action.userId), 1);
                imageData = {
                    ...imageData,
                    likedPeople: likedPeople
                }
                updatedFeedData[index] = imageData;
            }
        }

        return {
            ...state,
            feedData: updatedFeedData
        }
    } else if (action.type === COMMENT_HANDLER) {
        const updatedFeedData = [...state.feedData];
        let imageData = updatedFeedData.find(feed => feed.id === action.imageId);
        let index = updatedFeedData.findIndex(feed => feed.id === action.imageId);
        let comments = [...imageData.comments] ? imageData.comments : [];
        comments.push({
            id: action.id,
            username: action.userId,
            comments: action.comments,
        });
        imageData.comments = comments;
        updatedFeedData[index] = imageData;

        return {
            ...state,
            feedData: updatedFeedData
        }
    } else if (action.type === LIKED_COMMENT_HANDLER) {
        const updatedFeedData = [...state.feedData];
        let imageData = updatedFeedData.find(feed => feed.id === action.imageId);
        let index = updatedFeedData.findIndex(feed => feed.id === action.imageId);
        imageData = {
            ...imageData,
            comments: action.comments
        }
        updatedFeedData[index] = imageData;

        return {
            ...state,
            feedData: updatedFeedData
        }
    } else if (action.type === SAVED_HANDLER) {
        const updatedFeedData = [...state.feedData];
        let imageData = updatedFeedData.find(feed => feed.id === action.imageId);
        let index = updatedFeedData.findIndex(feed => feed.id === action.imageId);
        let savedBy = imageData.savedBy;
        if (action.isSaved) {
            //If true then push
            if (!savedBy.includes(action.userId)) {
                savedBy.push(action.userId);
                imageData = {
                    ...imageData,
                    savedBy: savedBy
                }
                updatedFeedData[index] = imageData;
            }
        } else {
            //Else not saved thus pop if exist
            if (savedBy.includes(action.userId)) {
                savedBy.splice(savedBy.indexOf(action.userId), 1);
                imageData = {
                    ...imageData,
                    savedBy: savedBy
                }
                updatedFeedData[index] = imageData;
            }
        }

        return {
            ...state,
            feedData: updatedFeedData
        }
    }
    else if (action.type === SUBMIT_HANDLER) {
        const updatedFeedData = [...state.feedData];
        updatedFeedData.unshift({
            id: action.id,
            imageUrl: action.imageUrls,
            description: action.description,
            username: action.userId,
            likedPeople: [],
            savedBy: [],
        })
        return {
            ...state,
            feedData: updatedFeedData
        }
    }
    else if (action.type === FETCH_COMMENTS) {
        return {
            ...state,
            commentsData: action.fetchedCommentData
        }
    }
    else if (action.type === FETCH_STORIES) {
        return {
            ...state,
            stories: action.stories
        }
    } else if (action.type === UPDATE_STORIES_USER) {
        //console.log(state.stories);
        let storyObj = state.stories.find(story => story.id === action.userid);
        const index = state.stories.findIndex(story => story.id === action.userid);
        let data = [...storyObj.data];
        const indexStoryToUpdate = data.findIndex(each => each.id === action.storyId);
        let dataModified = {...data[indexStoryToUpdate]};
        dataModified = {...dataModified, viewedStory: action.viewedStory};
        data[indexStoryToUpdate] = dataModified;
        
        storyObj = {
            ...storyObj,
            data: data
        }
        let updatedArr = [...state.stories];
        updatedArr[index] = storyObj;

        return {
            ...state,
            stories: updatedArr
        }
    }
    else {
        return state;
    }
}