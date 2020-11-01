import React, { useEffect, useState, useCallback } from 'react';
import LayoutScreen from './LayoutScreen';
import { View, Text, StyleSheet, TouchableNativeFeedback, FlatList, Image, TouchableHighlight } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, notificationCreator } from '../store/actions/notification';
import { ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { addFollowing, fetchEntireUserDatabase, removeFollowing } from '../store/actions/user';

const NotificationScreen = props => {
    const [refresh, setRefresh] = useState();
    const notifications = useSelector(state => state.notification.notifications);
    const loggedInUser = useSelector(state => state.user.loggedInUserdata)
    const [loader, setLoader] = useState(false);
    const [isRefresh, setIsRefresh] = useState(false);
    const dispatch = useDispatch();

    const refreshHandler = useCallback(async () => {
        setIsRefresh(true);
        await dispatch(fetchNotifications());
        setIsRefresh(false);
    }, []);

    const clickHandler = itemData => {
        props.navigation.navigate('ImageData', {
            image: itemData.item.image,
            user: itemData.item.user
        })
    }

    const manageFollowHandler = async (isFollowing, username, localId) => {
        if (isFollowing) {
            //If following then onPress remove from following list.
            setRefresh(username);
            await dispatch(removeFollowing(username, localId));
            await dispatch(fetchEntireUserDatabase());
            setRefresh();
        } else {
            //Add to following list
            setRefresh(username);
            await dispatch(addFollowing(username, localId));
            await dispatch(fetchEntireUserDatabase());
            setRefresh();
            dispatch(notificationCreator(localId, 'Following', loggedInUser.username + ' started following you.', 'Following',
                null, loggedInUser.localId));
        }
    }

    const renderItemHandler = itemData => {
        let text = '';
        let isFollowing = false;

        if (itemData.item.type === 'Likes') {
            text = itemData.item.user.username + ' liked your photo.';
        } else if (itemData.item.type === 'Comments') {
            text = itemData.item.user.username + ' commented "' + itemData.item.comments + '" on your photo.';
        } else if (itemData.item.type === 'Mentioned') {
            text = itemData.item.user.username + ' mentioned you in a photo.';
        } else if (itemData.item.type === 'Following') {
            text = itemData.item.user.username + ' started following you.';
            if (loggedInUser.following.includes(itemData.item.user.username)) {
                isFollowing = true;
            }
        }
        return <TouchableNativeFeedback onPress={clickHandler.bind(this, itemData)}>
            <View style={styles.eachBar}>
                <View style={styles.profileData}>
                    <Image source={{ uri: itemData.item.user.profileImage }} style={styles.image} />
                    <Text>{text}</Text>
                </View>
                {itemData.item.type === 'Following' ? <TouchableHighlight style={styles.common} onPress={manageFollowHandler.bind(this, isFollowing, itemData.item.user.username, itemData.item.user.id)}>
                    <View style={isFollowing === true ? styles.followingButton : styles.followButton}>
                        {isFollowing === true && <Ionicons name="md-arrow-dropdown" size={22} color="black" />}
                        <Text>{isFollowing === true ? 'Following' : 'Follow'}</Text>
                        {refresh && refresh=== itemData.item.user.username && <ActivityIndicator size="small" color="black" />}
                    </View>
                </TouchableHighlight> :
                    <Image source={{ uri: itemData.item.image.imageUrl[0] }} style={styles.photo} />}
            </View>
        </TouchableNativeFeedback>
    }

    if (loader) {
        return <View style={styles.centered}>
            <ActivityIndicator size="small" color="black" />
        </View>
    }

    return (
        <LayoutScreen navigation={props.navigation}>
            <FlatList onRefresh={refreshHandler} refreshing={isRefresh} data={notifications} keyExtractor={(item, index) => index.toString()} renderItem={renderItemHandler} />
        </LayoutScreen>

    )
}

NotificationScreen.navigationOptions = {
    headerTitle: 'Activity',
    headerTintColor: 'orange'
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    eachBar: {
        flexDirection: 'row',
        width: '100%',
        height: 60,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 10
    },
    photo: {
        width: 50,
        height: 50,
        marginHorizontal: 10
    },
    profileData: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '70%'
    },
    common: {
        width: '25%',
        height: '50%',
        marginHorizontal: 5
    },
    followButton: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 7,
        backgroundColor: 'dodgerblue',
        flexDirection: 'row'
    },
    followingButton: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 7,
        flexDirection: 'row',
        borderColor: '#ccc',
        borderWidth: 1
    },
})

export default NotificationScreen;