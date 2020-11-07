import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableHighlight, ActivityIndicator, Image, KeyboardAvoidingView, FlatList, Keyboard, Dimensions, TouchableWithoutFeedback } from 'react-native';
//import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessagesIdSpecific, setMessages } from '../store/actions/messages';
import { pushMessagesidsToLoggedInUser, removeNewMessagesToUser } from '../store/actions/user';
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

    useEffect(() => {
        const listener1 = Keyboard.addListener('keyboardDidShow', () => setKeyboardActive(true));
        const listener2 = Keyboard.addListener('keyboardDidHide', () => setKeyboardActive(false));
        (async () => {
            //setReload(true);
            await dispatch(fetchMessagesIdSpecific(conversationId, false));
            await dispatch(removeNewMessagesToUser(conversationId));
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

    const renderDataHandler = itemData => {
        const time = new Date(itemData.item.time);
        const hours = time.getHours();
        const min = time.getMinutes();
        const displayTime = hours.toString() + ':' + min.toString();
        if (itemData.item.userId === loggedInUser.localId) {
            return <TouchableWithoutFeedback onPress={showTimeHandler.bind(this, itemData.index)}>
                <View style={{ flexGrow: 1 }}>
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <View style={styles.right}>
                            <Text style={styles.text}>{itemData.item.message}</Text>
                        </View>
                        {messageSentLoader && itemData.index === (conversationThread[conversationId].length - 1) && <ActivityIndicator size="small" color="black" />}
                    </View>
                    <View style={{ width: '100%', alignItems: 'flex-end', paddingHorizontal: 10 }}>
                        {showTime && showTime === itemData.index ? <Text>{displayTime}</Text> : null}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        } else {
            return <TouchableWithoutFeedback onPress={showTimeHandler.bind(this, itemData.index)}>
                <View style={{ flexGrow: 1 }}>
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={{ uri: profileImage }} style={styles.image} />
                        <View style={styles.left}>
                            <Text style={styles.text}>{itemData.item.message}</Text>
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
        <FlatList ref={ref => { flatListRef = ref }} data={conversationThread[conversationId]} renderItem={renderDataHandler} keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={StyleSheet.flatten([styles.contentStyle, keyboardActive === true ? { paddingBottom: 80 } : { paddingBottom: 65 }])}
            onContentSizeChange={() => {
                flatListRef.scrollToOffset({ animated: false, offset: Dimensions.get('window').height })
            }} />
        <View style={styles.conversationBox}>
            <TextInput style={styles.input} multiline onChangeText={text => setMessage(text)} value={message} />
            <TouchableHighlight onPress={sendMessageHandler}>
                <Text>Send</Text>
            </TouchableHighlight>
        </View>
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
        paddingLeft: '10%',
        paddingRight: '6%',
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
    }
})

export default ConversationScreen;