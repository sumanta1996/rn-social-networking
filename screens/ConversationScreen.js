import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableHighlight, ActivityIndicator, Image, KeyboardAvoidingView, FlatList, Keyboard, Dimensions, TouchableWithoutFeedback, Modal } from 'react-native';
//import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessagesIdSpecific, setMessages } from '../store/actions/messages';
import { pushMessagesidsToLoggedInUser, removeNewMessagesToUser } from '../store/actions/user';
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
    const threadId = useSelector(state => state.messages.activeThreadId);
    const dispatch = useDispatch();
    const [messageSentLoader, setMessageSentLoader] = useState(false);
    const [keyboardActive, setKeyboardActive] = useState(false);
    const [showTime, setShowTime] = useState();
    const entireUserDatabase = useSelector(state => state.user.enitreUserDatabase);
    const [modalImage, setModalImage] = useState();
    const [showModal, setShowModal] = useState();

    useEffect(() => {
        const listener1 = Keyboard.addListener('keyboardDidShow', () => setKeyboardActive(true));
        const listener2 = Keyboard.addListener('keyboardDidHide', () => setKeyboardActive(false));
        (async () => {
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
    }, []);

    const sendMessageHandler = async () => {
        setMessage('');
        setMessageSentLoader(true);
        await dispatch(setMessages(pushToken, conversationId, userId, message));
        setMessageSentLoader(false);
        if (!conversationId) {
            dispatch(pushMessagesidsToLoggedInUser(userId + loggedInUser.localId));
        }
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
                <Image style={styles.imagePhoto} source={{ uri: item.imageUrl[0] }} />
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
        console.log(item);
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

    const renderDataHandler = itemData => {
        const time = new Date(itemData.item.time);
        const hours = time.getHours();
        const min = time.getMinutes();
        const displayTime = hours.toString() + ':' + min.toString();
        if (itemData.item.userId === loggedInUser.localId) {
            return <TouchableWithoutFeedback onPress={itemData.item.isShare ? showImageHandler.bind(this, itemData) :
                itemData.item.isUpload ? showUploadedImage.bind(this, itemData) : 
                itemData.item.storyUrl? showStoryHandler.bind(this, itemData.item):showTimeHandler.bind(this, itemData.index)}>
                <View style={{ flexGrow: 1 }}>
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
                itemData.item.storyUrl? showStoryHandler.bind(this, itemData.item): showTimeHandler.bind(this, itemData.index)}>
                <View style={{ flexGrow: 1 }}>
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

    if (reload) {
        return <View style={styles.centered}>
            <ActivityIndicator size="small" color="black" />
        </View>
    }

    //keyboardActive === true ? {flexGrow: 1, justifyContent: 'flex-end', paddingBottom: height+65,}:styles.contentStyle

    return <KeyboardAvoidingView style={{ flexGrow: 1 }}>
        {conversationThread && conversationThread[conversationId] ?
            <FlatList ref={ref => { flatListRef = ref }} data={conversationThread[conversationId]} renderItem={renderDataHandler} keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={StyleSheet.flatten([styles.contentStyle, keyboardActive === true ? { paddingBottom: 80 } : { paddingBottom: 65 }])}
                onContentSizeChange={(w, h) => {
                    flatListRef.scrollToOffset({ animated: false, offset: h })
                }} /> : null}
        <View style={styles.conversationBox}>
            <Ionicons size={23} color="black" onPress={uploadImageHandler.bind(this, true)} name="md-camera" />
            <TextInput style={styles.input} multiline onChangeText={text => setMessage(text)} value={message} />
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
        {showModal? <StoryViewerHandler showModal={!!showModal} closeModal={() => setShowModal()} storyObj={showModal.storyObj}
                    profileImage={showModal.user.profileImage} username={showModal.user.username} indexStory={showModal.indexStory} />: null}
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
        justifyContent: 'flex-end'
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
    }
})

export default ConversationScreen;