import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, PanResponder } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useDispatch, useSelector } from 'react-redux';
import CardView from '../components/CardView';
import HeaderButton from '../components/HeaderButton';
import { fetchFeedData, likedHandler, saveHandler } from '../store/actions/images';
import { fetchNotifications, notificationCreator } from '../store/actions/notification';
import LayoutScreen from './LayoutScreen';
import * as Notifications from 'expo-notifications';
import { setActivity } from '../store/actions/ActiveBar';

export let flatListRef;
let moveToIndex = true;

const HomepageFeedScreen = props => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const userData = useSelector(state => state.user.enitreUserDatabase);
    const loggedInUser = useSelector(state => state.user.loggedInUserdata);
    const feedData = useSelector(state => state.images.feedData);
    var indexToStart = props.navigation.getParam('index') ? +props.navigation.getParam('index') : 0;
    const dispatch = useDispatch();
    const userDataFromProfile = props.navigation.getParam('userData');
    const [filteredData, setFilteredData] = useState(props.navigation.getParam('userData') ? props.navigation.getParam('userData') : []);
    moveToIndex = userDataFromProfile ? true : false;

    const notificationRecievedHandler = notification => {
        console.log('Triggered Notifications');
        dispatch(fetchNotifications());
    }

    const actionOnNotificationHandler = notification => {
        if (notifications.length === 0) {
            dispatch(fetchNotifications());
        }
        dispatch(setActivity('NotificationFeed'));
        props.navigation.navigate('Notification');
    }

    const refreshHandler = useCallback(async () => {
        if (!userDataFromProfile) {
            setIsRefreshing(true);
            await dispatch(fetchFeedData());
            await dispatch(fetchNotifications());
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        refreshHandler();
        Notifications.addNotificationReceivedListener(notificationRecievedHandler);

        Notifications.addNotificationResponseReceivedListener(actionOnNotificationHandler);
    }, []);

    useEffect(() => {
        /* const fetchedFilteredData = !!userDataFromProfile ? userDataFromProfile : feedData ? feedData.filter(data => {
            //This is for people who I follow
            if (loggedInUser.following.includes(data.username)) {
                return data;
                //This is for my profile photo
            } else if (data.username === loggedInUser.username) {
                return data;
            }
        }) : null; */
        if (!userDataFromProfile && feedData) {
            //console.log('This renderiing as its homepage');
            const fetchedFilteredData = feedData.filter(data => {
                //This is for people who I follow
                if (loggedInUser.following.includes(data.username)) {
                    return data;
                    //This is for my profile photo
                } else if (data.username === loggedInUser.username) {
                    return data;
                }
            });
            setFilteredData(fetchedFilteredData);
        }
    }, [feedData])

    useEffect(() => {
        if (moveToIndex) {
            const position = 600 * (+indexToStart);
            if (indexToStart === filteredData.length - 1) {
                setTimeout(() => {
                    flatListRef.scrollToEnd({
                        animated: false
                    });
                }, 50)
            } else {
                flatListRef.scrollToOffset({ animated: false, offset: position });
            }
        }
    }, [indexToStart, filteredData]);

    const renderCardHandler = itemData => {
        if (!userData || userData.length === 0) {
            return;
        }
        const user = userData.find(user => user.username === itemData.item.username);
        return <CardView image={itemData.item.imageUrl} description={itemData.item.description} fullName={user.fullName} profileImage={user.profileImage} likedPeople={itemData.item.likedPeople.length}
            saved={itemData.item.savedBy.includes(loggedInUser.username)}
            onSave={(saved) => {
                dispatch(saveHandler(itemData.item.id, loggedInUser.username, saved))
            }}
            onPress={() => props.navigation.navigate('UserProfile', {
                //user: user
                username: itemData.item.username,
                id: user.id
            })}
            onLikesPress={() => {
                props.navigation.navigate('Likes', {
                    username: user.username,
                    likedPeople: itemData.item.likedPeople
                });
            }}
            onComment={() => props.navigation.navigate('Comments', {
                imageId: itemData.item.id,
                //comments: itemData.item.comments
            })}
            isItLiked={itemData.item.likedPeople.includes(loggedInUser.username)}
            liked={(isLiked) => {
                if (isLiked && user.id !== loggedInUser.localId) {
                    dispatch(notificationCreator(user.id, 'Likes', loggedInUser.username + ' liked your photo', 'Liked photo', itemData.item.id, loggedInUser.localId));
                }
                dispatch(likedHandler(itemData.item.id, loggedInUser.username, isLiked))
            }} />
    }

    if (!filteredData) {
        return <LayoutScreen navigation={props.navigation}>
            <View style={styles.centered}>
                <Text>No posts yet. Add some.</Text>
            </View>
        </LayoutScreen>
    }

    if (props.navigation.getParam('hideBottomBar')) {
        return (
            <FlatList ref={ref => { flatListRef = ref }} initialNumToRender={filteredData.length} onScrollToIndexFailed={err => {
                console.log(err);
                flatListRef.scrollToOffset({ animated: true, offset: 0 });
            }} onRefresh={refreshHandler} refreshing={isRefreshing} data={filteredData} renderItem={renderCardHandler} />)
    }

    return <LayoutScreen navigation={props.navigation}>
        <View style={{ marginBottom: 50 }}>
            <FlatList ref={ref => { flatListRef = ref }} initialNumToRender={filteredData.length} onScrollToIndexFailed={err => {
                console.log(err);
                flatListRef.scrollToOffset({ animated: true, offset: 660 * (+indexToStart) });
            }} onRefresh={refreshHandler} refreshing={isRefreshing} data={filteredData} renderItem={renderCardHandler} />
        </View>
    </LayoutScreen>
}

HomepageFeedScreen.navigationOptions = navData => {
    const isImageDetails = !!navData.navigation.getParam('userData')
    return {
        headerTitle: isImageDetails ? 'Posts' : 'Homepage',
        headerTintColor: '#ff6f00',
        headerRight: () => {

            return !isImageDetails ? <HeaderButtons HeaderButtonComponent={HeaderButton}>
                <Item iconName="md-search" title="Search" onPress={() => navData.navigation.navigate('Search')} />
                <Item iconName="md-notifications-outline" title="Direct Messages" onPress={() => navData.navigation.navigate('DirectMessages')} />
            </HeaderButtons> : null
        }
    }
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomBar: {
        width: '100%',
        height: 50,
        justifyContent: 'space-evenly',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'white'
    }
})

export default HomepageFeedScreen;