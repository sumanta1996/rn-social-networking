import { Entypo, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableHighlight, ActivityIndicator, Image, KeyboardAvoidingView, FlatList, Keyboard,
    Dimensions, TouchableWithoutFeedback, Modal, TouchableNativeFeedback, Animated, PanResponder
} from 'react-native';
//import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { deleteVanishMessages, fetchMessagesIdSpecific, sendMessageNotification, setMessages, setVanishNotifications, setVanishNotificationUserMapping } from '../store/actions/messages';
import { fetchEntireUserDatabase, fetchUserData, pushMessagesidsToLoggedInUser, removeNewMessagesToUser, updateVanishModeData } from '../store/actions/user';
import firebase from "firebase";
import * as ImagePicker from 'expo-image-picker';
import StoryViewerHandler from './StoryViewerHandler';

let flatListRef;

const ConversationScreen = props => {
    const loggedInUser = useSelector(state => state.user.loggedInUserdata);
    const username = props.navigation.getParam('username');
    const userId = props.navigation.getParam('userId');
    const pushToken = props.navigation.getParam('token');
    const conversationId = props.navigation.getParam('conversationId') ? props.navigation.getParam('conversationId') : (userId + loggedInUser.localId);
    const profileImage = props.navigation.getParam('profileImage');
    const [message, setMessage] = useState('');
    const [reload, setReload] = useState(true);
    const conversationThread = useSelector(state => state.messages.conversationThread);
    //const vanishConversationThread = useSelector(state => state.messages.vanishConversationThread);
    //const vanishConversationUserData = useSelector(state => state.messages.vanishConversationUserData);
    const threadId = useSelector(state => state.messages.activeThreadId);
    const dispatch = useDispatch();
    const [messageSentLoader, setMessageSentLoader] = useState(false);
    const [keyboardActive, setKeyboardActive] = useState(false);
    const [showTime, setShowTime] = useState();
    const entireUserDatabase = useSelector(state => state.user.enitreUserDatabase);
    const [modalImage, setModalImage] = useState();
    const [showModal, setShowModal] = useState();
    const [showReplyBar, setReplyBar] = useState(false);
    const [showReplyContainer, setShowReplyContainer] = useState(false);
    const [repliedText, setRepliedText] = useState();
    const [endReached, setEndReached] = useState(false);
    const [vanishMode, setVanishMode] = useState(loggedInUser.vanishModeConversations && loggedInUser.vanishModeConversations.includes(conversationId)? true: false);
    const [scrollEnable, setScrollEnable] = useState(true);
    const [disablePanResponder, setDisablePanResponders] = useState(false);
    const [showVanishLoader, setShowVanishLoader] = useState(false);
    const [triggerNotification, setTriggerNotification] = useState(false);
    let textInputRef;
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [panResponder, setPanResponder] = useState(PanResponder.create({
        onMoveShouldSetResponderCapture: () => true,
        onMoveShouldSetPanResponder: (event, gestureState) => {
            if (gestureState.dy < 0) {
                if(conversationThread[conversationId]) {
                    setScrollEnable(false);
                    return true;
                }else {
                    setScrollEnable(true);
                    return false;
                }
            } else {
                setScrollEnable(true);
                return false;
            }
        },
        onPanResponderGrant: () => {
            setPosition({ x: 0, y: 0 });
        },
        onPanResponderMove: (event, gestureState) => {
            if (gestureState.dy < -300) {
                setDisablePanResponders(prevValue => {
                    if (prevValue === false) {
                        setPosition({ x: 0, y: 0 });
                        setVanishMode(prevData => {
                            const data = !prevData;
                            setTriggerNotification(true);
                            return data;
                        });
                        setShowVanishLoader(false);
                        return true;
                    }
                });
            } else {
                setShowVanishLoader(true);
                setPosition({ x: 0, y: gestureState.dy })
            }
            Animated.event(null, {
                dy: position.y,
                useNativeDriver: true
            })
        },
        onPanResponderRelease: () => {
            setPosition({ x: 0, y: 0 });
            setDisablePanResponders(false);
            setShowVanishLoader(false);
            //Execute on release
        }
    }));

    useEffect(() => {
        if(triggerNotification === true) {
            (async () => {
                dispatch(updateVanishModeData(userId, conversationId, vanishMode));
                const body = loggedInUser.username + (vanishMode === true? ' enabled ': ' disabled ') + 'vanish mode';
                sendMessageNotification(pushToken, 'Message', body, conversationId);
                setTriggerNotification(false);
                if(vanishMode === false) {
                    await dispatch(deleteVanishMessages(conversationId));
                    await dispatch(fetchMessagesIdSpecific(conversationId, false));
                }
            })();
        }
    }, [vanishMode]);

    useEffect(() => {
        const vanishModeConversations = loggedInUser.vanishModeConversations? loggedInUser.vanishModeConversations: [];
        if(vanishModeConversations.includes(conversationId) && vanishMode === false) {
            setVanishMode(true);
        }else if(!vanishModeConversations.includes(conversationId) && vanishMode === true) {
            setVanishMode(false);
        }
    }, [loggedInUser]);

    useEffect(() => {
        const listener1 = Keyboard.addListener('keyboardDidShow', () => setKeyboardActive(true));
        const listener2 = Keyboard.addListener('keyboardDidHide', () => setKeyboardActive(false));
        (async () => {
            dispatch(fetchUserData(loggedInUser.localId, true));
            try {
                await dispatch(fetchMessagesIdSpecific(conversationId, false));
                await dispatch(removeNewMessagesToUser(conversationId));
            } catch (err) {
                console.log(err);
            }
            setReload(false);
        })();

        return () => {
            listener1.remove();
            listener2.remove();
        }
    }, [conversationId]);

    const sendMessageHandler = async () => {
        setMessage('');
        setMessageSentLoader(true);
        /* if (vanishMode === true) {
            const obj = {
                conversationId: conversationId,
                isVanishMode: vanishMode,
                message: message
            }
            await dispatch(sendVanishMessageNotification(pushToken, 'Message', userId+' sends a message in vanish mode.', obj));
            dispatch(setVanishNotifications(conversationId, userId, message));
            setMessageSentLoader(false);
        } else { */
            let repliedObj;
            if (repliedText) {
                repliedObj = {
                    userId: repliedText.userId,
                    message: repliedText.message
                }
            }
            setRepliedText();
            setShowReplyContainer(false);
            await dispatch(setMessages(pushToken, conversationId, userId, message, false, false, null, repliedObj, vanishMode));
            setMessageSentLoader(false);
            console.log(props.navigation.getParam('conversationId'));
            if (!props.navigation.getParam('conversationId')) {
                dispatch(fetchUserData(loggedInUser.localId, true));
                dispatch(fetchEntireUserDatabase());
            }
        //}
    }

    const showTimeHandler = index => {
        if (showTime) {
            if (showTime !== index) {
                setShowTime(index);
            } else {
                setShowTime();
            }
        } else {
            setShowTime(index);
        }
    }

    const componentToRender = (item) => {
        let comp;
        if (item.isShare) {
            const user = entireUserDatabase.find(each => each.username === item.username);
            comp = <View style={styles.imageMessage}>
                <View style={styles.userData}>
                    <Image style={styles.image} source={{ uri: user.profileImage }} />
                    <Text style={{ marginHorizontal: 10 }}>{user.fullName}</Text>
                </View>
                <Image style={styles.imagePhoto} source={{ uri: item.imageUrl[0].uri }} />
            </View>
        } else if (item.isUpload) {
            comp = <Image source={{ uri: item.message }} style={styles.uploadPhoto} />
        } else if (item.storyUrl) {
            comp = <View>
                <View style={{ flexDirection: 'row' }}>
                    <Ionicons size={26} name="md-share-alt" />
                    <Text>Story replied</Text>
                </View>
                <Image source={{ uri: item.storyUrl }} style={styles.story} />
                <Text style={styles.repliedMessage}>{item.message}</Text>
            </View>
        } else {
            comp = <Text style={styles.text}>{item.message}</Text>;
        }

        return comp;
    }

    const showImageHandler = itemData => {
        const user = entireUserDatabase.find(each => each.username === itemData.item.username);
        props.navigation.navigate('ImageData', {
            image: itemData.item,
            user: user,
            isNotLoggedIn: true
        });
    }

    const showUploadedImage = itemData => {
        setModalImage(itemData.item.message);
    }

    const uploadImageHandler = async isCamera => {
        let result;
        const options = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1
        };
        if (isCamera === true) {
            result = await ImagePicker.launchCameraAsync(options);
        } else {
            result = await ImagePicker.launchImageLibraryAsync(options);
        }

        if (!result.cancelled) {
            const image = result.uri;
            try {
                setMessageSentLoader(true);
                const response = await fetch(image);
                const blob = await response.blob();
                const ref = firebase.storage().ref().child('social/' + image.split('/').pop());
                await ref.put(blob);
                const url = await ref.getDownloadURL();
                await dispatch(setMessages(pushToken, conversationId, userId, url, false, true));
                setMessageSentLoader(false);
            } catch (err) {
                console.log(err);
                return;
            }
        }
    }

    const showStoryHandler = (item) => {
        const arr = item.repliedId.split("/");
        const id = arr[0];
        const storyId = arr[1];

        const user = entireUserDatabase.find(user => user.id === id);
        let storyObj = {
            data: [{
                id: storyId,
                imageUrl: item.storyUrl
            }],
            id: id
        }
        setShowModal({
            storyObj: storyObj,
            indexStory: 0,
            user: user
        });
    }

    const toggleReplyBar = itemData => {
        setReplyBar(!showReplyBar);
        setRepliedText(itemData && itemData.item && itemData.item.message ? itemData.item : null);
    }

    const rightLeftTextBox = itemData => {
        return <View style={{ width: '100%', height: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>
            {itemData.item.repliedText && <View style={{ width: '100%', height: '100%', alignItems: 'flex-end' }}>
                <Text>{itemData.item.repliedText.userId === loggedInUser.localId ? 'Replied to yourself' : 'You replied'}</Text>
                <View style={styles.repliedRight}>
                    <Text style={styles.text}>{itemData.item.repliedText.message}</Text>
                </View>
            </View>}
            <View style={styles.right}>
                {componentToRender(itemData.item)}
            </View>
        </View>
    }

    const renderDataHandler = itemData => {
        //Vanish or normal mode.
        const checkWhichModeMessage = itemData.item.isVanishMode? itemData.item.isVanishMode: false;
        if(checkWhichModeMessage === vanishMode) {
            const time = new Date(itemData.item.time);
        const hours = time.getHours();
        const min = time.getMinutes();
        const displayTime = hours.toString() + ':' + min.toString();
        if (itemData.item.userId === loggedInUser.localId) {
            return <TouchableWithoutFeedback onPress={itemData.item.isShare ? showImageHandler.bind(this, itemData) :
                itemData.item.isUpload ? showUploadedImage.bind(this, itemData) :
                    itemData.item.storyUrl ? showStoryHandler.bind(this, itemData.item) : showTimeHandler.bind(this, itemData.index)}
                onLongPress={toggleReplyBar.bind(this, itemData)} delayLongPress={50}>
                <View style={{ flexGrow: 1 }}>
                    {itemData.item.repliedText && <View style={{ width: '100%', alignItems: 'flex-end', paddingHorizontal: 5 }}>
                        <Text style={{ color: 'darkgray' }}>{itemData.item.repliedText.userId === loggedInUser.localId ? 'Replied to yourself' : 'You replied'}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.repliedRight}>
                                <Text style={styles.text}>{itemData.item.repliedText.message}</Text>
                            </View>
                            <View style={styles.verticalLine}></View>
                        </View>
                    </View>}
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <View style={styles.right}>
                            {componentToRender(itemData.item)}
                        </View>
                        {messageSentLoader && itemData.index === (conversationThread[conversationId].length - 1) && <ActivityIndicator size="small" color="black" />}
                    </View>
                    <View style={{ width: '100%', alignItems: 'flex-end', paddingHorizontal: 10 }}>
                        {showTime && showTime === itemData.index ? <Text>{displayTime}</Text> : null}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        } else {
            return <TouchableWithoutFeedback onPress={itemData.item.isShare ? showImageHandler.bind(this, itemData) :
                itemData.item.isUpload ? showUploadedImage.bind(this, itemData) :
                    itemData.item.storyUrl ? showStoryHandler.bind(this, itemData.item) : showTimeHandler.bind(this, itemData.index)}
                onLongPress={toggleReplyBar.bind(this, itemData)} delayLongPress={50}>
                <View style={{ flexGrow: 1 }}>
                    {itemData.item.repliedText && <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', marginLeft: '10%' }}>
                        <Text style={{ color: 'darkgray' }}>{itemData.item.repliedText.userId === itemData.item.userId ? 'Replied to themself' : 'Replied to you'}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.verticalLine}></View>
                            <View style={styles.repliedLeft}>
                                <Text style={styles.text}>{itemData.item.repliedText.message}</Text>
                            </View>
                        </View>
                    </View>}
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={{ uri: profileImage }} style={styles.image} />
                        <View style={styles.left}>
                            {componentToRender(itemData.item)}
                        </View>
                    </View>
                    <View style={{ width: '100%', paddingHorizontal: 50 }}>
                        {showTime && showTime === itemData.index ? <Text>{displayTime}</Text> : null}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        }
        } 
    }

    const bottomActionHandler = text => {
        if (text === 'Reply') {
            setReplyBar(!showReplyBar);
            textInputRef.focus();
            setShowReplyContainer(!showReplyContainer);
        }
    }

    const fetchBottomComponents = text => {
        return <View style={styles.bottomButtons}>
            <TouchableNativeFeedback onPress={bottomActionHandler.bind(this, text)} style={{ width: '100%', height: '100%' }}>
                <Text>{text}</Text>
            </TouchableNativeFeedback>
        </View>
    }

    const toggleEndReachedHandler = () => setEndReached(!endReached);

    if (reload) {
        return <View style={styles.centered}>
            <ActivityIndicator size="small" color="black" />
        </View>
    }

    //keyboardActive === true ? {flexGrow: 1, justifyContent: 'flex-end', paddingBottom: height+65,}:styles.contentStyle

    return <KeyboardAvoidingView style={{ flexGrow: 1 }}>
        {vanishMode === true && <Text style={styles.vanishModeText}>Vanish Mode Enabled</Text>}
        {conversationThread && conversationThread[conversationId] ?
            <Animated.FlatList ref={ref => { flatListRef = ref }} data={conversationThread[conversationId]} renderItem={renderDataHandler} keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{
                    ...StyleSheet.flatten([styles.contentStyle, keyboardActive === true ? { paddingBottom: 80 } : { paddingBottom: 65 }]),
                    transform: [{ translateX: position.x }, { translateY: position.y }]
                }}
                onContentSizeChange={(w, h) => {
                    try{
                        flatListRef.scrollToOffset({ animated: false, offset: h })
                    }catch(err) {
                        console.log('Maybe switched to vanish mode.');
                    }
                }} onEndReached={toggleEndReachedHandler} onEndReachedThreshold={0.2} onMomentumScrollBegin={toggleEndReachedHandler}
                {...panResponder.panHandlers} scrollEnabled={scrollEnable} /> : null}
        {showVanishLoader === true && <View style={styles.vanishText}>
            <ActivityIndicator size={10} color="black" />
            <Text>Swipe up to turn {vanishMode === true ? 'off' : 'on'} Vanish Mode.</Text>
        </View>}
        <View style={StyleSheet.flatten([styles.conversationBox, vanishMode === false ? {} : { borderStyle: 'dotted' }])}>
            <Ionicons size={23} color="black" onPress={uploadImageHandler.bind(this, true)} name="md-camera" />
            <TextInput style={styles.input} multiline onChangeText={text => setMessage(text)} value={message} ref={input => { textInputRef = input }} />
            <TouchableHighlight activeOpacity={0.2} onPress={message.length === 0 ? uploadImageHandler.bind(this, false) : sendMessageHandler}>
                <View style={{ height: '100%', justifyContent: 'center' }}>
                    {message.length === 0 ? <Ionicons name="md-albums" size={26} /> :
                        <Text>Send</Text>}
                </View>
            </TouchableHighlight>
        </View>
        <Modal transparent={true} visible={!!modalImage} onRequestClose={() => setModalImage()}>
            <Image style={styles.modalImage} source={{ uri: modalImage }} />
        </Modal>
        {showModal ? <StoryViewerHandler showModal={!!showModal} closeModal={() => setShowModal()} storyObj={showModal.storyObj}
            profileImage={showModal.user.profileImage} username={showModal.user.username} indexStory={showModal.indexStory} /> : null}
        <Modal animationType="slide" transparent={true} visible={showReplyBar} onRequestClose={toggleReplyBar}>
            <View style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={toggleReplyBar}>
                    <View style={styles.modal}></View>
                </TouchableWithoutFeedback>
                <View style={styles.screen}>
                    {fetchBottomComponents('Reply')}
                    {fetchBottomComponents('Unsend')}
                    {fetchBottomComponents('More')}
                </View>
            </View>
        </Modal>
        {repliedText && showReplyContainer && <View style={styles.bottomTextContainer}>
            <Text style={styles.replyingContainer}>Replying to {repliedText.userId === loggedInUser.localId ? 'yourself' : entireUserDatabase.find(user => user.id === repliedText.userId).fullName}</Text>
            <Text>{repliedText.message}</Text>
            <Entypo name='cross' style={styles.crossStyle} size={24} onPress={() => { setRepliedText(); setShowReplyContainer(false); }} />
        </View>}
    </KeyboardAvoidingView>
}

ConversationScreen.navigationOptions = navData => {
    const username = navData.navigation.getParam('username');
    return {
        headerTitle: username,
        headerTintColor: 'black'
    }
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    contentStyle: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        minWidth: '100%',
        minHeight: Dimensions.get('window').height / 2
    },
    vanishText: {
        width: '100%',
        height: 60,
        position: 'absolute',
        bottom: 55,
        justifyContent: 'center',
        alignItems: 'center'
    },
    conversationBox: {
        width: '100%',
        height: 60,
        position: 'absolute',
        bottom: 2,
        left: 0,
        borderColor: 'black',
        borderRadius: 50,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: '6%',
        backgroundColor: 'white'
    },
    input: {
        width: '80%'
    },
    right: {
        maxWidth: '50%',
        marginHorizontal: 5,
        marginVertical: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#ccc'
    },
    left: {
        maxWidth: '50%',
        marginHorizontal: 5,
        marginVertical: 1,
        alignItems: 'flex-start',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#ccc'
    },
    image: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginHorizontal: 2
    },
    text: {
        margin: 10
    },
    imagePhoto: {
        width: '100%',
        height: '80%',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
    },
    userData: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '20%',
        paddingHorizontal: 2,
        paddingVertical: 10
    },
    imageMessage: {
        maxWidth: Dimensions.get('window').width / 2,
        width: 200,
        height: 200,
        justifyContent: 'space-between'
    },
    uploadPhoto: {
        width: 200,
        height: 200,
        borderRadius: 20
    },
    story: {
        width: 150,
        height: 200,
        borderRadius: 20
    },
    modalImage: {
        width: '100%',
        height: '100%'
    },
    repliedMessage: {
        margin: 10
    },
    modal: {
        width: '100%',
        height: '90%',
        backgroundColor: 'rgba(240, 240, 240, 0.3)',
    },
    screen: {
        width: '100%',
        height: '10%',
        backgroundColor: 'white',
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    bottomButtons: {
        width: '30%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    bottomTextContainer: {
        width: '100%',
        backgroundColor: 'white',
        position: 'absolute',
        left: 0,
        bottom: 62,
        justifyContent: 'center',
        padding: 10
    },
    replyingContainer: {
        fontFamily: 'open-sans',
        color: '#585858'
    },
    crossStyle: {
        position: 'absolute',
        right: 5,
        top: 5
    },
    repliedRight: {
        maxWidth: '50%',
        marginHorizontal: 5,
        marginVertical: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'darkgray'
    },
    repliedLeft: {
        maxWidth: '50%',
        marginHorizontal: 5,
        marginVertical: 1,
        alignItems: 'flex-start',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'darkgray'
    },
    verticalLine: {
        width: 1,
        height: '100%',
        backgroundColor: 'black'
    }, 
    vanishModeText: {
        position: 'absolute',
        marginLeft: Dimensions.get('window').width/2 - 90,
        marginTop: 10
    } 
})

export default ConversationScreen;