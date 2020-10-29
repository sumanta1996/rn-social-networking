import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableNativeFeedback, ScrollView, Modal, ActivityIndicator, InteractionManager } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import ImageTile from '../components/ImageTile';
import { fetchUserData } from '../store/actions/user';

let images = [];

const UserProfile = props => {
    const [isReady, setIsReady] = useState(true);
    const [active, setActive] = useState('grid');
    const [showModal, setShowModal] = useState(false);
    const [url, setUrl] = useState();
    const [loader, setLoader] = useState(false);
    const dispatch = useDispatch();
    let user = props.navigation.getParam('user') ? props.navigation.getParam('user') : props.myProfile;
    const userDatabase = useSelector(state => state.user.enitreUserDatabase);
    const feedData = useSelector(state => state.images.feedData);

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

    useEffect(() => {
        const isItLoggedInProfile = props.navigation.getParam('user') ? false : true;
        dispatch(fetchUserData(user.username, isItLoggedInProfile));
    }, [userDatabase]);

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
            isLoggedIn: props.isLoggedIn
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

    if (loader) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="green" />
            </View>
        )
    }

    return (
        <ScrollView style={styles.iconContainer}>
            <View style={styles.profileDetails}>
                <Image source={{ uri: user.profileImage }} style={styles.image} />
                <View style={styles.userCounts}>
                    <Text style={styles.textBold}>{user.posts}</Text>
                    <Text style={styles.customFont}>Posts</Text>
                </View>
                <TouchableNativeFeedback onPress={followersFollowingHandler.bind(this, 'followers')}>
                    <View style={styles.userCounts}>
                        <Text style={styles.textBold}>{user.followers.length}</Text>
                        <Text style={styles.customFont}>Followers</Text>
                    </View>
                </TouchableNativeFeedback>
                <TouchableNativeFeedback onPress={followersFollowingHandler.bind(this, 'following')}>
                    <View style={styles.userCounts}>
                        <Text style={styles.textBold}>{user.following.length}</Text>
                        <Text style={styles.customFont}>Following</Text>
                    </View>
                </TouchableNativeFeedback>
            </View>
            <View style={styles.details}>
                <Text style={{ fontFamily: 'open-sans-bold' }}>{user.fullName}</Text>
                <Text>{user.status}</Text>
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
            {active === 'grid' && <FlatList numColumns={3} data={images}
                renderItem={itemData => <ImageTile image={itemData.item.imageUrl} onPress={imageDetailsHandler.bind(this, itemData.index)} onLongPress={modalHandler.bind(this, itemData.item.imageUrl[0])}
                    onPressOut={pressOutHandler} />} />}
        </ScrollView>
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
})

export default UserProfile;