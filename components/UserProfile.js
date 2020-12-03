import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableNativeFeedback, ScrollView, Modal, ActivityIndicator, TouchableHighlight, PanResponder, Animated, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import ImageTile from '../components/ImageTile';
import { notificationCreator } from '../store/actions/notification';
import { addFollowing, fetchEntireUserDatabase, removeFollowing } from '../store/actions/user';

let images = [];

const UserProfile = props => {
    const [refresh, setRefresh] = useState(false);
    const [active, setActive] = useState('grid');
    const [showModal, setShowModal] = useState(false);
    const [url, setUrl] = useState();
    const [loader, setLoader] = useState(false);
    const dispatch = useDispatch();
    let user = props.user ? props.user : props.myProfile;
    const userDatabase = useSelector(state => state.user.enitreUserDatabase);
    const feedData = useSelector(state => state.images.feedData);
    const isFollowing = props.isFollowing;
    const loggedInUser = useSelector(state => state.user.loggedInUserdata);

    //Add pan responders here to refresh
    const [position, setPosition] = useState(new Animated.ValueXY());
    const [showSpinner, setShowSpinner] = useState(false);
    const [panResponder, setPanResponder] = useState(PanResponder.create({
        onMoveShouldSetResponderCapture: () => true,
        onMoveShouldSetPanResponder: (event, gestureState) => gestureState.dy > 10 ? true : false,
        onPanResponderGrant: () => {
            setPosition({ x: 0, y: 0 });
        },
        onPanResponderMove: (event, gestureState) => {
            if (gestureState.dy < 150) {
                if (showSpinner === false) {
                    setShowSpinner(true);
                }
                setPosition({ x: 0, y: gestureState.dy })
            }
            Animated.event(null, {
                dy: position.y,
                useNativeDriver: true
            })
        },
        onPanResponderRelease: () => {
            position.flattenOffset();
            fetchUserData();
        }
    }));

    const fetchUserData = async () => {
        await props.onRefresh();
        setPosition({ x: 0, y: 0 });
        setShowSpinner(false);
    }


    const fetchImageData = () => {
        setLoader(true);
        images = feedData.filter(image => image.username === user.username);
        setLoader(false);
    }
    useEffect(() => {
        props.navigation.setParams({
            username: user.username
        });
        fetchImageData();
        props.navigation.addListener('willFocus', () => {
            console.log('focused');
            fetchImageData();
        });
    }, []);

    const iconTappedHandler = identifier => {
        setActive(identifier);
    }

    const followersFollowingHandler = identifier => {
        props.navigation.navigate('FollowersFollowing', {
            username: user.username,
            followers: user.followers,
            following: user.following,
            focusOn: identifier,
            isMyProfile: !!props.myProfile
        });
    }

    const imageDetailsHandler = index => {
        props.navigation.navigate('ImageDetails', {
            userData: images,
            index: index,
            isLoggedIn: props.isLoggedIn,
            hideBottomBar: true
        });
    }

    const modalHandler = url => {
        setShowModal(true);
        setUrl(url);
    }

    const pressOutHandler = () => {
        setShowModal(false);
        setUrl();
    }

    const manageFollowHandler = async () => {
        if (isFollowing) {
            //If following then onPress remove from following list.
            setRefresh(true);
            await dispatch(removeFollowing(props.user.username, props.user.localId));
            await dispatch(fetchEntireUserDatabase());
            setRefresh(false);
        } else {
            //Add to following list
            setRefresh(true);
            await dispatch(addFollowing(props.user.username, props.user.localId));
            await dispatch(fetchEntireUserDatabase());
            setRefresh(false);
            dispatch(notificationCreator(props.user.localId, 'Following', loggedInUser.username + ' started following you.', 'Following',
                null, loggedInUser.localId));
        }
    }

    const messageHandler = () => {
        const messageIdsLoggedIn = loggedInUser.messageIds ? loggedInUser.messageIds : [];
        const messageIdsProfile = user.messageIds ? user.messageIds : [];
        let conversationId;
        messageIdsLoggedIn.map(each => {
            messageIdsProfile.map(each1 => {
                if (each === each1) {
                    conversationId = each1;
                }
            })
        })
        console.log('conversationid: ', conversationId);
        props.navigation.navigate('Conversation', {
            username: user.username,
            profileImage: user.profileImage,
            userId: user.localId,
            token: user.token,
            conversationId: conversationId
        })
    }

    const editProfileHandler = () => {
        props.navigation.navigate('EditProfile', {
            fullName: user.fullName,
            profileImage: user.profileImage,
            status: user.status,
            userId: user.localId
        })
    }

    if (loader || !user) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="green" />
            </View>
        )
    }

    return (
        <View>
            {showSpinner === true && <View style={styles.refreshSpinner}>
                <ActivityIndicator size="small" color="black" />
            </View>}
            <Animated.ScrollView style={{ ...styles.iconContainer, transform: [{ translateX: position.x }, { translateY: position.y }] }} {...panResponder.panHandlers}>
                <View style={styles.profileDetails}>
                    <Image source={{ uri: user.profileImage }} style={styles.image} />
                    <View style={styles.userCounts}>
                        <Text style={styles.textBold}>{user.posts}</Text>
                        <Text style={styles.customFont}>Posts</Text>
                    </View>
                    <TouchableNativeFeedback onPress={followersFollowingHandler.bind(this, 'followers')}>
                        <View style={styles.userCounts}>
                            <Text style={styles.textBold}>{user.followers ? user.followers.length : 0}</Text>
                            <Text style={styles.customFont}>Followers</Text>
                        </View>
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback onPress={followersFollowingHandler.bind(this, 'following')}>
                        <View style={styles.userCounts}>
                            <Text style={styles.textBold}>{user.following ? user.following.length : 0}</Text>
                            <Text style={styles.customFont}>Following</Text>
                        </View>
                    </TouchableNativeFeedback>
                </View>
                <View style={styles.details}>
                    <Text style={{ fontFamily: 'open-sans-bold' }}>{user.fullName}</Text>
                    <Text>{user.status}</Text>
                    {user.username !== loggedInUser.username ? <View style={styles.buttons}>
                        <TouchableHighlight style={styles.common} onPress={manageFollowHandler}>
                            <View style={isFollowing === true ? styles.followingButton : styles.followButton}>
                                {isFollowing === true && <Ionicons name="md-arrow-dropdown" size={22} color="black" />}
                                <Text>{isFollowing === true ? 'Following' : 'Follow'}</Text>
                                {refresh && <ActivityIndicator size="small" color="black" />}
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight style={styles.messageButton} onPress={messageHandler}>
                            <Text>Message</Text>
                        </TouchableHighlight>
                    </View> : <TouchableHighlight style={styles.buttons} onPress={editProfileHandler}>
                            <View style={styles.editProfile}>
                                <Text>Edit Profile</Text>
                            </View>
                        </TouchableHighlight>}
                </View>
                <View style={styles.iconbars}>
                    <View style={styles.icons}>
                        <Ionicons name="md-grid" size={30} onPress={iconTappedHandler.bind(this, 'grid')} />
                        {active === 'grid' && <View style={styles.horizontalLine}></View>}
                    </View>
                    <View style={styles.icons}>
                        <Ionicons name="md-people" size={30} onPress={iconTappedHandler.bind(this, 'people')} />
                        {active === 'people' && <View style={styles.horizontalLine}></View>}
                    </View>
                </View>
                {showModal && url ? <Modal transparent={true} visible={showModal} animationType="fade">
                    <View style={styles.modal}>
                        <View style={styles.modalLook}>
                            <Image style={styles.imageContainer} source={{ uri: url }} />
                        </View>
                    </View>
                </Modal> : null}

                {active === 'grid' && images.length !== 0 ? <FlatList numColumns={3} data={images}
                    renderItem={itemData => <ImageTile image={itemData.item.imageUrl} onPress={imageDetailsHandler.bind(this, itemData.index)} onLongPress={modalHandler.bind(this, itemData.item.imageUrl[0])}
                        onPressOut={pressOutHandler} />} /> : <View style={styles.noPost}>
                        <Text>No posts yet. Add some</Text>
                    </View>}
            </Animated.ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    screen: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50
    },
    profileDetails: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 5
    },
    userCounts: {
        width: '20%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    details: {
        padding: 10
    },
    iconContainer: {
        width: '100%',
        height: 600
    },
    iconContainerDrawer: {
        width: '50%',
        height: 600
    },
    iconbars: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    },
    horizontalLine: {
        width: '100%',
        borderBottomColor: 'black',
        borderBottomWidth: 1
    },
    icons: {
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    textBold: {
        fontFamily: 'open-sans-bold'
    },
    customFont: {
        fontFamily: 'open-sans'
    },
    modalImage: {
        width: '100%',
        height: 400
    },
    modal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    imageContainer: {
        width: '100%',
        height: '80%',
    },
    modalLook: {
        width: '95%',
        height: 500,
        borderRadius: 20,
        borderColor: 'black',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.00,
        elevation: 24,
    },
    blurViewStyle: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
    },
    buttons: {
        flexDirection: 'row',
        width: '100%',
        height: 30,
        justifyContent: 'space-around',
        marginVertical: 10
    },
    common: {
        width: '40%',
        height: '100%',
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
    messageButton: {
        width: '40%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 7,
        borderColor: '#ccc',
        borderWidth: 1
    },
    refreshSpinner: {
        position: 'absolute',
        top: 30,
        left: Dimensions.get('window').width / 2
    },
    editProfile: {
        width: '93%',
        height: '100%',
        marginRight: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 7,
        flexDirection: 'row',
        borderColor: '#ccc',
        borderWidth: 1
    },
    noPost: {
        width: '100%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default UserProfile;