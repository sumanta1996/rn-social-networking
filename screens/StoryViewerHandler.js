import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Modal, StyleSheet, Image, ImageBackground, ActivityIndicator, Dimensions, TouchableWithoutFeedback, Animated, TouchableNativeFeedback } from 'react-native';
import { ProgressBar, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { updateStoriesViewd } from '../store/actions/images';
import { setMessages } from '../store/actions/messages';
import { pushMessagesidsToLoggedInUser } from '../store/actions/user';

const StoryViewerHandler = props => {
    const [imageUrls, setImageUrls] = useState(props.storyObj.data);
    const [userid, setUserid] = useState(props.storyObj.id);
    const [index, setIndex] = useState(props.indexStory);
    const [progress, setProgress] = useState(0);
    const [hold, setHold] = useState(false);
    const [disappearHeader, setDisappearHeader] = useState(false);
    const [message, setMessage] = useState('');
    const [refresh, setRefresh] = useState(false);
    const [openViews, setOpenViews] = useState(false);
    const loggedInUser = useSelector(state => state.user.loggedInUserdata);
    const enitreUserDatabase = useSelector(state => state.user.enitreUserDatabase);
    const dispatch = useDispatch();
    let timer;

    const changeImageHandler = event => {
        const screenWidth = Dimensions.get('window').width;
        const posX = event.nativeEvent.locationX;
        if (posX > screenWidth / 2) {
            //console.log(index);
            //console.log(imageUrls.length);
            setProgress(0);
            changeStoryHandler();
        } else {
            if (+index - 1 >= 0) {
                setIndex(+index - 1);
                setProgress(0);
                //dispatch(updateStoriesViewd(userid, imageUrls[index].id));
            }
        }
    }

    const changeStoryHandler = () => {
        setIndex(prevState => {
            if ((+prevState + 1) < imageUrls.length) {
                dispatch(updateStoriesViewd(userid, imageUrls[+prevState + 1].id));
                return +prevState + 1;
            } else {
                return prevState;
            }
        });
    }

    const updateProgressHandler = useCallback(() => {
        setHold(prevHold => {
            if (prevHold !== true) {
                setProgress(prevState => {
                    if (+prevState === 20) {
                        setIndex(prev => {
                            if (prev === imageUrls.length - 1) {
                                modalCloseHandler();
                            }
                            return prev;
                        })
                        changeStoryHandler();
                        return 0;
                    } else {
                        return +prevState + 1
                    }
                });
            }
            return prevHold;
        })
    }, []);

    const modalCloseHandler = async () => {
        if (openViews === true) {
            setOpenViews(false);
            setHold(false);
        } else {
            if (timer) {
                await clearInterval(timer);
            }
            props.closeModal();
        }
    }

    const sendCommentsHandler = async () => {
        const userData = enitreUserDatabase.find(user => user.id === userid);
        const messageIds = userData.messageIds ? userData.messageIds : [];
        let conversationId;
        for (let key in messageIds) {
            if (loggedInUser.messageIds.includes(messageIds[key])) {
                conversationId = messageIds[key];
            }
        }

        if (!conversationId) {
            conversationId = userid + loggedInUser.localId;
            dispatch(pushMessagesidsToLoggedInUser(conversationId));
        }
        setRefresh(true);
        setHold(true);
        const idUrl = userid + '/' + imageUrls[index].id;
        await dispatch(setMessages(userData.token, conversationId, userid, message, false, false, idUrl));
        setMessage('');
        setHold(false);
        setRefresh(false);
    }

    //uncomment to make the timer work again.
    useEffect(() => {
        timer = setInterval(updateProgressHandler, 500);
    }, []);

    return <Modal visible={props.showModal} onRequestClose={modalCloseHandler}>
        {openViews === true ? <View>
            <View style={styles.storyPhotos}>
                {imageUrls.map((url, indexStory) => {
                    return <Image style={indexStory === index? styles.enhancedStory:styles.storyImage} source={{ uri: url.imageUrl }} />
                })}
            </View>
            <View style={styles.viewedStory}>
                <View style={styles.viewCount}>
                    <Ionicons name="md-eye" size={26} style={{ paddingLeft: '5%', paddingRight: 10 }} />
                    <Text>{imageUrls[index].viewedStory ? imageUrls[index].viewedStory.length : 0}</Text>
                </View>
                {imageUrls[index].viewedStory ? imageUrls[index].viewedStory.map(story => {
                    const user = enitreUserDatabase.find(user => user.id === story);
                    return <View key={user.id} style={styles.userDetail}>
                        <Image style={styles.image} source={{ uri: user.profileImage }} />
                        <Text style={styles.username}>{user.fullName}</Text>
                    </View>
                }) : null}
            </View>
        </View> :
            imageUrls.length === 0 ? <View style={styles.centered}>
                <ActivityIndicator size="small" />
            </View> : <TouchableWithoutFeedback onPress={changeImageHandler} onLongPress={() => { setDisappearHeader(true); setHold(true) }}
                onPressOut={() => { setDisappearHeader(false); setHold(false) }}>
                    <ImageBackground progressiveRenderingEnabled={true} style={styles.imageBackgroud} source={{ uri: imageUrls[index].imageUrl }}>
                        {disappearHeader === false ? <React.Fragment>
                            <View style={{ flexDirection: 'row' }}>
                                {imageUrls.map((url, i) => {
                                    return <ProgressBar color="white" progress={(+index === +i) ? +progress / 20 : 0} key={i} style={{ ...styles.bar, width: (Dimensions.get('window').width / imageUrls.length) }} />
                                })}
                            </View>
                            <View style={styles.userDetail}>
                                <Image style={styles.image} source={{ uri: props.profileImage }} />
                                <Text style={styles.username}>{props.username}</Text>
                            </View>
                            {loggedInUser.localId !== userid ? <View style={styles.textBar}>
                                <TextInput selectionColor={'white'} style={styles.input} value={message} multiline
                                    onChangeText={(text) => setMessage(text)} onFocus={() => setHold(true)} onBlur={() => setHold(false)} />
                                {refresh === true ? <ActivityIndicator size="small" color="white" /> :
                                    <Text style={{ width: '10%', height: 60, marginTop: 35, color: "white" }} onPress={sendCommentsHandler}>Send</Text>}
                            </View> : <TouchableNativeFeedback onPress={() => {setOpenViews(true); setHold(true)}}>
                                    <View style={styles.viewedBy}>
                                        <Ionicons size={26} name="md-eye" color="white" />
                                        <Text style={{ color: 'white' }}>Viewed by {imageUrls[index].viewedStory ? imageUrls[index].viewedStory.length : 0}</Text>
                                    </View>
                                </TouchableNativeFeedback>}
                        </React.Fragment> : null}
                    </ImageBackground>
                </TouchableWithoutFeedback>}
    </Modal>
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 10
    },
    userDetail: {
        width: '100%',
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10
    },
    username: {
        fontWeight: 'bold'
    },
    imageBackgroud: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    bar: {
        height: 3,
        borderRadius: 2,
        backgroundColor: '#ccc',
        marginRight: 2
    },
    textBar: {
        position: 'absolute',
        bottom: 2,
        left: 0,
        width: '100%',
        height: 60,
        borderRadius: 30,
        borderColor: 'white',
        borderWidth: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        alignItems: 'center'
    },
    input: {
        width: '90%',
        height: 80,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        color: 'white'
    },
    viewedBy: {
        position: 'absolute',
        bottom: 20,
        left: 10,
        flexDirection: 'row',
        alignItems: 'center',
        width: '25%',
        justifyContent: 'space-between'
    },
    viewedStory: {
        width: '100%',
        height: (Dimensions.get('window').height / 3) * 2,
    },
    viewCount: {
        width: '100%',
        height: 70,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        borderBottomColor: '#ccc',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 10
    },
    storyPhotos: {
        width: '100%',
        height: Dimensions.get('window').height / 3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    storyImage: {
        width: 100,
        height: 150,
        borderRadius: 2,
        marginHorizontal: 10
    },
    enhancedStory: {
        width: 130,
        height: 180,
        borderRadius: 2,
        marginHorizontal: 10
    }
})

export default StoryViewerHandler;