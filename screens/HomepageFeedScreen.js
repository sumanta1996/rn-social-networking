import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, PanResponder, AsyncStorage, Image, TouchableWithoutFeedback, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useDispatch, useSelector } from 'react-redux';
import CardView from '../components/CardView';
import HeaderButton from '../components/HeaderButton';
import { fetchFeedData, fetchStories, likedHandler, saveHandler, updateStoriesViewd } from '../store/actions/images';
import { fetchNotifications, notificationCreator } from '../store/actions/notification';
import LayoutScreen from './LayoutScreen';
import * as Notifications from 'expo-notifications';
import { setActivity } from '../store/actions/ActiveBar';
import { fetchMessagesIdSpecific } from '../store/actions/messages';
import { fetchEntireUserDatabase, fetchLoggedinuserStories, fetchUserData, pushMessagesidsToLoggedInUser, pushStoryToLoggedinuser, uploadStories } from '../store/actions/user';
import { Ionicons } from '@expo/vector-icons';
import firebase from "firebase";
import * as ImagePicker from 'expo-image-picker';
import StoryViewerHandler from './StoryViewerHandler';
import { HeaderBackButton } from 'react-navigation-stack';

export let flatListRef;
let moveToIndex = true;

const HomepageFeedScreen = props => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [storyLoader, setStoryLoader] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [storyViewedAll, setStoryViewedAll] = useState(true);
    const [indexStory, setIndexStory] = useState(0);
    const userData = useSelector(state => state.user.enitreUserDatabase);
    const loggedInUser = useSelector(state => state.user.loggedInUserdata);
    const feedData = useSelector(state => state.images.feedData);
    var indexToStart = props.navigation.getParam('index') ? +props.navigation.getParam('index') : 0;
    const dispatch = useDispatch();
    const userDataFromProfile = props.navigation.getParam('userData');
    const [filteredData, setFilteredData] = useState(props.navigation.getParam('userData') ? props.navigation.getParam('userData') : []);
    const storiesData = useSelector(state => state.images.stories);

    moveToIndex = userDataFromProfile ? true : false;

    const shouldMove = gestureState => {
        if (gestureState.dx < -30) {
            return true;
        } else {
            false;
        }
    }

    const [panResponder, setPanResponder] = useState(PanResponder.create({
        onMoveShouldSetPanResponder: (event, gestureState) => shouldMove(gestureState),
        onPanResponderMove: (event, gestureState) => {
            if (shouldMove(gestureState) === true) {
                props.navigation.navigate('DirectMessages');
            }
        }
    }));

    const notificationRecievedHandler = useCallback(async notification => {
        console.log('Triggered Notifications');
        if (notification.request.content.title !== 'Message') {
            dispatch(fetchNotifications());
            dispatch(fetchUserData(loggedInUser.localId, true));
        } else {
            const id = notification.request.content.data.conversationId;
            if (id) {
                dispatch(fetchEntireUserDatabase());
                dispatch(fetchMessagesIdSpecific(id, true));
                dispatch(pushMessagesidsToLoggedInUser(id));
                dispatch(fetchUserData(loggedInUser.localId, true));
            }
        }
    })

    const actionOnNotificationHandler = event => {
        console.log(event);
        if (event.notification.request.content.title !== 'Message') {
            dispatch(setActivity('NotificationFeed'));
            props.navigation.navigate('Notification');
        } else {
            props.navigation.navigate('DirectMessages');
        }
    }

    const refreshHandler = useCallback(async () => {
        if (!userDataFromProfile) {
            setIsRefreshing(true);
            await dispatch(fetchFeedData());
            await dispatch(fetchEntireUserDatabase());
            await dispatch(fetchNotifications());
            await dispatch(fetchLoggedinuserStories());
            await dispatch(fetchStories());
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        refreshHandler();
        Notifications.addNotificationReceivedListener(notificationRecievedHandler);

        Notifications.addNotificationResponseReceivedListener(actionOnNotificationHandler);

        props.navigation.setParams({
            uploadStory: uploadStoryHandler
        })
    }, []);

    useEffect(() => {
        if (loggedInUser.newMessageIds) {
            props.navigation.setParams({
                noti: loggedInUser.newMessageIds.length
            })
        }
        let flag = false;
        if (loggedInUser.stories) {
            loggedInUser.stories.map(story => {
                if (!story.viewedStory) {
                    flag = true;
                } else if (!story.viewedStory.includes(loggedInUser.localId)) {
                    flag = true;
                }
            })
        }
        setStoryViewedAll(flag);
    }, [loggedInUser]);

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
                if (loggedInUser.following && loggedInUser.following.includes(data.username)) {
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

    const uploadStoryHandler = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1
        });

        if (!result.cancelled) {
            const image = result.uri;
            try {
                setStoryLoader(true);
                const response = await fetch(image);
                const blob = await response.blob();
                const ref = firebase.storage().ref().child('social/' + image.split('/').pop());
                await ref.put(blob);
                const url = await ref.getDownloadURL();
                await dispatch(uploadStories(loggedInUser.localId, url));
                setStoryLoader(false);
            } catch (err) {
                console.log(err);
                return;
            }
        }
    }

    const renderCardHandler = itemData => {
        if (!userData || userData.length === 0) {
            return;
        }
        const user = userData.find(user => user.username === itemData.item.username);
        return <CardView id={itemData.item.id} image={itemData.item.imageUrl} description={itemData.item.description} fullName={user.fullName} profileImage={user.profileImage} likedPeople={itemData.item.likedPeople.length}
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

    const storyPressHandler = (id, storyObjs) => {
        setShowModal(id);
        //console.log(storyObjs);
        let storyKey;

        for (let key in storyObjs) {
            const viewedStory = storyObjs[key].viewedStory ? storyObjs[key].viewedStory : [];
            if (!viewedStory.includes(loggedInUser.localId)) {
                setIndexStory(key);
                storyKey = storyObjs[key].id;
                break;
            }
        }
        //console.log(storyKey)
        if (storyKey) {
            dispatch(updateStoriesViewd(id, storyKey));
        }
    }

    //const stories = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
    const renderStoryHandler = itemData => {
        const user = userData.find(user => user.id === itemData.item.id);
        let flag = false;
        itemData.item.data.map(story => {
            if (!story.viewedStory) {
                flag = true;
            } else if (!story.viewedStory.includes(loggedInUser.localId)) {
                flag = true;
            }
        });
        return <TouchableOpacity onPress={storyPressHandler.bind(this, itemData.item.id, itemData.item.data)}>
            <View style={flag === true ? styles.ring : { ...styles.ring, borderColor: '#ccc' }}>
                <Image style={styles.story} source={{ uri: user.profileImage }} />
                {showModal && itemData.item.id === showModal && <StoryViewerHandler navigation={props.navigation} showModal={!!showModal} closeModal={() => setShowModal()} storyObj={itemData.item}
                    profileImage={user.profileImage} username={user.username} indexStory={indexStory} />}
            </View>
        </TouchableOpacity>
    }

    /* if (!isRefreshing && (!filteredData || filteredData.length === 0)) {
        return <LayoutScreen navigation={props.navigation}>
            <View style={styles.centered} {...panResponder.panHandlers}>
                <Text>No posts yet. Add some.</Text>
            </View>
        </LayoutScreen>
    } */

    if (props.navigation.getParam('hideBottomBar')) {
        return (
            <FlatList ref={ref => { flatListRef = ref }} initialNumToRender={filteredData.length} onScrollToIndexFailed={err => {
                console.log(err);
                flatListRef.scrollToOffset({ animated: true, offset: 0 });
            }} onRefresh={refreshHandler} refreshing={isRefreshing} data={filteredData} renderItem={renderCardHandler} />)
    }

    return <LayoutScreen navigation={props.navigation}>
        <ScrollView style={{ marginBottom: 50 }} {...panResponder.panHandlers} refreshControl={<RefreshControl onRefresh={refreshHandler} refreshing={isRefreshing} />}>
            <View style={{ flexDirection: 'row' }}>
                <TouchableWithoutFeedback onPress={loggedInUser.stories && loggedInUser.stories.length > 0 ? storyPressHandler.bind(this, loggedInUser.localId, loggedInUser.stories) : uploadStoryHandler}>
                    <View style={loggedInUser.stories && loggedInUser.stories.length > 0 ? storyViewedAll === true ? styles.ringMyIcon : { ...styles.ringMyIcon, borderColor: '#ccc' } : styles.marginMyIcon}>
                        <Image style={styles.myIcon} source={{ uri: loggedInUser.profileImage }} />
                        {loggedInUser.stories && loggedInUser.stories.length > 0 ? null : <View style={styles.plus}>
                            <Ionicons name="md-add" size={20} color="white" />
                        </View>}
                        {storyLoader === true && <View style={styles.loader}>
                            <ActivityIndicator size="small" color="white" />
                        </View>}
                        {showModal && loggedInUser.localId === showModal && <StoryViewerHandler navigation={props.navigation} showModal={!!showModal} closeModal={() => setShowModal()} storyObj={{ data: loggedInUser.stories, id: loggedInUser.localId }}
                            profileImage={loggedInUser.profileImage} username={loggedInUser.username} indexStory={indexStory} />}
                    </View>
                </TouchableWithoutFeedback>
                <FlatList horizontal showsHorizontalScrollIndicator={false} data={storiesData} renderItem={renderStoryHandler}
                    keyExtractor={item => item.id} />
            </View>
            {!isRefreshing && (!filteredData || filteredData.length === 0) ? <View style={styles.centered}>
                <Text>No posts yet. Add some.</Text>
            </View> :
                <FlatList ref={ref => { flatListRef = ref }} initialNumToRender={filteredData.length} onScrollToIndexFailed={err => {
                    console.log(err);
                    flatListRef.scrollToOffset({ animated: true, offset: 660 * (+indexToStart) });
                }} data={filteredData} renderItem={renderCardHandler} />}
        </ScrollView>
    </LayoutScreen>
}

HomepageFeedScreen.navigationOptions = navData => {
    const isImageDetails = !!navData.navigation.getParam('userData');
    const number = navData.navigation.getParam('noti');
    const uploadStory = navData.navigation.getParam('uploadStory');

    return {
        headerTitle: isImageDetails ? 'Posts' : 'Homepage',
        headerTintColor: '#ff6f00',
        headerLeft: props => navData.navigation.getParam('hideBottomBar') ? <HeaderBackButton  {...props} /> : <Ionicons name="md-camera" size={26} style={{ paddingHorizontal: 10 }} onPress={uploadStory} />,
        headerRight: () => {

            return !isImageDetails ? <HeaderButtons HeaderButtonComponent={HeaderButton}>
                <Item iconName="md-search" title="Search" onPress={() => navData.navigation.navigate('Search')} />
                <Item iconName="md-chatbubbles" title="Direct Messages" onPress={() => navData.navigation.navigate('DirectMessages')} />
                {number > 0 && <View style={styles.notificationNumber}>
                    <Text style={{ color: 'white' }}>{number}</Text>
                </View>}
            </HeaderButtons> : null
        }
    }
}

const styles = StyleSheet.create({
    centered: {
        width: '100%',
        height: Dimensions.get('window').height - 200,
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
    },
    notificationNumber: {
        position: 'absolute',
        right: -8,
        top: -10,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#DC143C',
        margin: 5,
        paddingHorizontal: 5
    },
    story: {
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden'
    },
    ring: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'transparent',
        borderWidth: 4,
        borderColor: 'red',
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    stories: {
        height: 70
    },
    plus: {
        position: 'absolute',
        bottom: 2,
        left: 45,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'dodgerblue',
        borderWidth: 2,
        borderColor: 'white'
    },
    ringMyIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'transparent',
        borderWidth: 4,
        borderColor: 'red',
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    marginMyIcon: {
        margin: 10
    },
    myIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
    },
    loader: {
        position: 'absolute',
        bottom: 20,
        left: 25,
    }
})

export default HomepageFeedScreen;