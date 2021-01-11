import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableNativeFeedback, ActivityIndicator, PanResponder, Animated, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import SearchBar from '../components/SearchBar';
import { fetchAllMessages } from '../store/actions/messages';
import { fetchLoggedinuserStories, fetchUserData } from '../store/actions/user';

const DirectMessagesScreen = props => {
    const [position, setPosition] = useState(new Animated.ValueXY());
    const [showSpinner, setShowSpinner] = useState(false);
    const conversationThread = useSelector(state => state.messages.conversationThread);
    const entireUserData = useSelector(state => state.user.enitreUserDatabase);
    const loggedInUser = useSelector(state => state.user.loggedInUserdata);
    const [reload, setReload] = useState(false);
    const dispatch = useDispatch();
    const [allDatas, setAllDatas] = useState([]);
    const [text, setText] = useState('');

    const shouldMove = gestureState => {
        if (gestureState.dx > 20) {
            return 'horizontal';
        } else if (gestureState.dy > 20 && gestureState.dx < 20) {
            return 'vertical';
        }
        else {
            return null;
        }
    }

    const [panResponder, setPanResponder] = useState(PanResponder.create({
        onMoveShouldSetPanResponder: (event, gestureState) => !!shouldMove(gestureState),
        onPanResponderMove: (event, gestureState) => {
            if (shouldMove(gestureState) === 'vertical') {
                if (showSpinner === false) {
                    setShowSpinner(true);
                }
                setPosition({ x: 0, y: gestureState.dy });
                Animated.event(null, {
                    dy: position.y,
                    useNativeDriver: true
                })
            }
            else if (shouldMove(gestureState) === 'horizontal') {
                props.navigation.navigate('HomepageFeed');
            }
        },
        onPanResponderRelease: () => {
            position.flattenOffset();
            refreshHandler();
        }
    }));

    //console.log(conversationThread);

    useEffect(() => {
        if (!conversationThread) {
            setReload(true);
            refreshHandler();
        } else {
            dispatch(fetchAllMessages());
            dispatch(fetchUserData(loggedInUser.localId, true));
            dispatch(fetchLoggedinuserStories());
        }
    }, []);

    const refreshHandler = async () => {
        //setReload(true);
        await dispatch(fetchAllMessages());
        await dispatch(fetchUserData(loggedInUser.localId, true));
        dispatch(fetchLoggedinuserStories());
        setPosition({ x: 0, y: 0 });
        setShowSpinner(false);
        setReload(false);
    }

    const getUserData = id => {
        const index = id.indexOf(loggedInUser.localId);


        let updatedId;
        if (index > 0) {
            updatedId = id.substring(0, index);
        } else {
            updatedId = id.substring(loggedInUser.localId.length);
        }

        return entireUserData.find(user => user.id === updatedId);
    }

    useEffect(() => {
        const updatedAllDatas = [...allDatas];
        for (let key in conversationThread) {
            const index = updatedAllDatas.findIndex(eachData => eachData.id === key);
            const userData = getUserData(key);

            if (index === -1) {
                if (loggedInUser.messageIds && loggedInUser.messageIds.includes(key)) {
                    updatedAllDatas.push({
                        id: key,
                        data: conversationThread[key],
                        userData: userData
                    })
                }
            } else {
                updatedAllDatas[index] = {
                    id: key,
                    data: conversationThread[key],
                    userData: userData
                };
            }
        }
        setAllDatas(updatedAllDatas);

    }, [conversationThread]);

    const conversationHandler = (user, conversationId, isNew) => {
        props.navigation.navigate('Conversation', {
            username: user.username,
            profileImage: user.profileImage,
            userId: user.id,
            token: user.token,
            conversationId: conversationId
        })
    }

    const filterTextHandler = text => {
        setText(text);
    }

    const renderEachHandler = itemData => {
        /* const index = itemData.item.id.indexOf(loggedInUser.localId);
        const newMessageIds = loggedInUser.newMessageIds ? loggedInUser.newMessageIds : [];
        //console.log(loggedInUser.newMessageIds);
        const isNew = newMessageIds.includes(itemData.item.id);

        let updatedId;
        if (index > 0) {
            updatedId = itemData.item.id.substring(0, index);
        } else {
            updatedId = itemData.item.id.substring(loggedInUser.localId.length);
        }

        const userData = entireUserData.find(user => user.id === updatedId); */
        const userData = itemData.item.userData;
        const newMessageIds = loggedInUser.newMessageIds ? loggedInUser.newMessageIds : [];
        const isNew = newMessageIds.includes(itemData.item.id);

        let timeDifference = (new Date() - new Date(itemData.item.data[itemData.item.data.length - 1].time)) / 1000;
        timeDifference /= (60 * 60);
        timeDifference = Math.abs(Math.round(timeDifference));
        const message = itemData.item.data[itemData.item.data.length - 1].isShare ? 'Shared an image' : itemData.item.data[itemData.item.data.length - 1].isUpload ? 'Sent an image' : itemData.item.data[itemData.item.data.length - 1].message

        return <TouchableNativeFeedback onPress={conversationHandler.bind(this, userData, itemData.item.id, isNew)}>
            <View style={styles.eachRow}>
                <Image source={{ uri: userData.profileImage }} style={styles.image} />
                <View style={styles.profileData}>
                    <Text style={styles.user}>{userData.fullName}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.message}>{message}</Text>
                        <Text style={{ ...styles.message, marginLeft: 20 }}>{timeDifference === 0 ? 'Now' : timeDifference.toString() + 'h'}</Text>
                        {isNew && <View style={styles.dot}></View>}
                    </View>
                </View>
            </View>
        </TouchableNativeFeedback>
    }

    if (reload) {
        return <View style={styles.centered}>
            <ActivityIndicator size="small" color="black" />
        </View>
    } else if (!allDatas || allDatas.length === 0) {
        return <View style={styles.centered}>
            <Text>Start a conversation!</Text>
        </View>
    }

    return (
        <React.Fragment>
            {showSpinner === true && <View style={styles.refreshSpinner}>
                <ActivityIndicator size="small" color="black" />
            </View>}
            <Animated.View style={{ flex: 1, transform: [{ translateX: position.x }, { translateY: position.y }] }} {...panResponder.panHandlers}>
                <SearchBar label='Find people' onChangeText={filterTextHandler} />
                <FlatList data={allDatas.filter(data => {
                    const userData = data.userData;
                    return userData.fullName.toLowerCase().includes(text.toLowerCase()) || userData.username.toLowerCase().includes(text.toLowerCase());
                })} renderItem={renderEachHandler} /* onRefresh={refreshHandler} refreshing={reload} */ />
            </Animated.View>
        </React.Fragment>
    )
}

DirectMessagesScreen.navigationOptions = {
    headerTitle: 'Messages',
    headerTintColor: 'green'
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    eachRow: {
        width: '100%',
        height: 70,
        flexDirection: 'row',
        alignItems: 'center'
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginHorizontal: 10
    },
    profileData: {
        width: '80%',
        height: 70,
        justifyContent: 'center'
    },
    user: {
        fontFamily: 'open-sans',
        fontSize: 13,
    },
    message: {
        color: 'grey',
        marginHorizontal: 2
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'dodgerblue',
        position: 'absolute',
        right: 10,
    },
    refreshSpinner: {
        position: 'absolute',
        top: 30,
        left: Dimensions.get('window').width / 2
    },
})

export default DirectMessagesScreen;