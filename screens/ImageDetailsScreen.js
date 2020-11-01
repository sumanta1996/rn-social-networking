import React from 'react';
import { StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import CardView from '../components/CardView';
import { likedHandler, saveHandler } from '../store/actions/images';

const ImageDetailsScreen = props => {
    const dispatch = useDispatch();
    const image = props.navigation.getParam('image');
    const user = props.navigation.getParam('user');
    const loggedInUser = useSelector(state => state.user.loggedInUserdata);

    return <CardView image={image.imageUrl} description={image.description} fullName={loggedInUser.fullName} profileImage={loggedInUser.profileImage} likedPeople={image.likedPeople.length}
        saved={image.savedBy.includes(loggedInUser.username)}
        onSave={(saved) => {
            dispatch(saveHandler(image.id, loggedInUser.username, saved))
        }}
        onPress={() => props.navigation.navigate('UserProfile', {
            //user: user
            username: image.username,
            id: loggedInUser.localId
        })}
        onLikesPress={() => {
            props.navigation.navigate('Likes', {
                username: user.username,
                likedPeople: image.likedPeople
            });
        }}
        onComment={() => props.navigation.navigate('Comments', {
            imageId: image.id,
        })}
        isItLiked={image.likedPeople.includes(loggedInUser.username)}
        liked={(isLiked) => {
            dispatch(likedHandler(image.id, loggedInUser.username, isLiked))
        }} />
}

ImageDetailsScreen.navigationOptions = {
        headerTitle: 'Photo'
}

export default ImageDetailsScreen;