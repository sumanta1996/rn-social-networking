import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, ScrollView, TouchableHighlight, TouchableOpacity, FlatList, Modal, TouchableWithoutFeedback } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { commentLikedHandler, commentsHandler, fetchCommentsData } from '../store/actions/images';
import { notificationCreator } from '../store/actions/notification';
import { fetchFilteredData } from '../store/actions/user';

const CommentsScreen = props => {
    const loggedInUser = useSelector(state => state.user.loggedInUserdata);
    const commentsData = useSelector(state => state.images.commentsData);
    const userData = useSelector(state => state.user.enitreUserDatabase);
    const [loader, setLoader] = useState(false);
    const feedData = useSelector(state => state.images.feedData);
    const imageId = props.navigation.getParam('imageId');
    const [comments, setComments] = useState('');
    const [showUsers, setShowUsers] = useState(false);
    const [commentLikedId, setCommentLikedId] = useState();
    const searchedUsers = useSelector(state => state.user.searchedUsers);
    const [showModal, setShowModal] = useState(false);
    const [likedData, setLikedData] = useState([]);

    const dispatch = useDispatch();
    let textRef;

    useEffect(() => {
        if (showUsers) {
            const searchTextArr = comments.split("@");
            const searchText = searchTextArr[searchTextArr.length - 1];
            dispatch(fetchFilteredData(searchText));
        }
    }, [showUsers, comments]);

    useEffect(() => {
        (async () => {
            setLoader(true);
            await dispatch(fetchCommentsData(imageId));
            setLoader(false);
        })()
    }, [feedData, imageId]);

    const commentHandler = text => {
        if (text.endsWith("@")) {
            setShowUsers(true);
        } else if (text.endsWith(" ")) {
            setShowUsers(false);
        }
        setComments(text);
    }

    const mentionedUserHandler = username => {
        const searchTextArr = comments.split("@");
        let totalText = "";
        searchTextArr.map((each, index) => {
            if (index === 0) {
                totalText = totalText + each;
            } else if (index === searchTextArr.length - 1) {
                totalText = totalText + "@".concat(username);
            } else {
                totalText = totalText + "@".concat(each);
            }
            return;
        });

        setComments(totalText);
        setShowUsers(false);
    }

    const postCommentsHandler = () => {
        dispatch(commentsHandler(imageId, loggedInUser.username, comments));
        setComments('');
        const username = feedData.find(feed => feed.id === imageId).username;
        const user = userData.find(each => each.username === username);
        let usersMentioned = [];
        if (comments.includes('@')) {
            let commentsArr = comments.split('@');
            commentsArr.map((each, index) => {
                if (index > 0) {
                    let updatedArr = each.split(' ');
                    usersMentioned.push(updatedArr[0].trim());
                }
            })
        }
        if (user.username !== loggedInUser.username || usersMentioned.length > 0) {
            if (usersMentioned.length > 0) {
                dispatch(notificationCreator(user.id, 'Mentioned', loggedInUser.username + ' mentioned you in a photo.', 'Mentioned on photo',
                    imageId, loggedInUser.localId, {
                    comments: comments,
                    usersMentioned: usersMentioned
                }));
            } else {
                dispatch(notificationCreator(user.id, 'Comments', loggedInUser.username + ' commented on your photo.', 'Commented on photo',
                    imageId, loggedInUser.localId, {
                    comments: comments,
                    usersMentioned: usersMentioned
                }));
            }
        }
    }

    const pressHandler = username => {
        const user = userData.find(user => user.username === username);
        props.navigation.navigate('UserProfile', {
            username: username,
            id: user.id
        })
    }

    const commentsLikedHandler = (commentId, isLiked) => {
        dispatch(commentLikedHandler(imageId, commentId, isLiked));
    }

    const fetchIsLikedFromData = itemData => {
        return itemData.item.likedPeople && itemData.item.likedPeople.includes(loggedInUser.localId) ? true : false
    }

    const likeScreenHandler = itemData => {
        setShowModal(true);
        const ids = itemData.item.likedPeople;
        const likedData = [];
        ids.map(id => {
            const user = userData.find(eachUser => eachUser.id === id);
            likedData.push(user);
        });
        setLikedData(likedData);
    }

    const renderComment = itemData => {
        let finalText = [];
        let isLiked;
        if (commentLikedId) {
            if (commentLikedId.id === itemData.item.id) {
                isLiked = commentLikedId.isLiked
            } else {
                isLiked = fetchIsLikedFromData(itemData);
            }
        } else {
            isLiked = fetchIsLikedFromData(itemData);
        }

        if (itemData.item.comments.includes('@')) {
            const updatedText = itemData.item.comments.split('@');
            updatedText.map((text, index) => {
                if (index > 0) {
                    let spaceSeparatedArr = text.split(' ');
                    spaceSeparatedArr.map((each, indexNum) => {
                        if (indexNum === 0) {
                            finalText.push(<Text key={each} style={{ color: 'blue' }} onPress={pressHandler.bind(this, each)}>@{each} </Text>);
                            //finalText = finalText+' '+<Text style={{color: 'blue'}} onPress={pressHandler.bind(this, each)}>each </Text>+' '
                        } else {
                            finalText.push(each + ' ');
                            //finalText = finalText+' '+each
                        }
                    })
                } else {
                    finalText.push(text + ' ');
                    //finalText = finalText+text;
                }
            })
        } else {
            finalText.push(itemData.item.comments + ' ');
            //finalText = itemData.item.comments;
        }
        //finalText=<Text>{finalText}</Text>;
        //console.log(finalText);
        return <View style={{ width: '100%' }}>
            <View style={styles.commentTab}>
                <Image source={{ uri: itemData.item.profileImage }} style={styles.image} />
                <Text style={{ marginTop: 5 }}><Text style={styles.usernameText}>{itemData.item.username} :</Text> {finalText.map(text => text)}</Text>
            </View>
            {itemData.item.likedPeople && itemData.item.likedPeople.length > 0 ?
                <Text style={styles.likeCount} onPress={likeScreenHandler.bind(this, itemData)}>{itemData.item.likedPeople.length + " like"}</Text> : null}
            <Ionicons name={isLiked === true ? "md-heart" : "md-heart-empty"} size={15} color={isLiked === true ? "red" : "black"} style={styles.likeButton}
                onPress={() => {
                    isLiked = !isLiked;
                    setCommentLikedId({
                        id: itemData.item.id,
                        isLiked: isLiked
                    });
                    commentsLikedHandler(itemData.item.id, isLiked);
                }} />
        </View>
    }

    const userCommentComponent = (<View><View style={styles.hr}></View>
        <View style={styles.commentInput}>
            <Image source={{ uri: loggedInUser.profileImage }} style={styles.imageContainer} />
            <TextInput blurOnSubmit={false} ref={ref => textRef = ref} style={styles.input} placeholder={"Comment as " + loggedInUser.username + " ..."} value={comments} onChangeText={commentHandler} />
            <TouchableOpacity activeOpacity={0.5} disabled={comments.length === 0} onPress={postCommentsHandler}>
                <View style={{ width: 50, marginHorizontal: 10 }}>
                    <Text style={{ color: comments.length > 0 ? 'blue' : '#ccc' }}>Post</Text>
                </View>
            </TouchableOpacity>
        </View></View>)

    if (commentsData.length === 0 && !loader) {
        return <View style={{ flex: 1 }}>
            <View style={styles.centered}>
                <Text>No comments yet. Add some</Text>
            </View>
            {userCommentComponent}
        </View>
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList data={commentsData} renderItem={renderComment} contentContainerStyle={{ paddingBottom: 90 }} />
            {showUsers && <ScrollView style={styles.userList}>
                {searchedUsers.map(user => <TouchableHighlight key={user.username} onPress={mentionedUserHandler.bind(this, user.username)}>
                    <View style={{ flexDirection: 'row', backgroundColor: '#ccc' }}>
                        <Image source={{ uri: user.profileImage }} style={styles.image} />
                        <View>
                            <Text style={styles.fullName}>{user.fullName}</Text>
                            <Text style={styles.username}>{user.username}</Text>
                        </View>
                    </View>
                </TouchableHighlight>)}
            </ScrollView>}
            {userCommentComponent}
            <Modal animationType="slide" transparent={true} visible={showModal} onRequestClose={() => setShowModal(!showModal)}>
                <View style={{ flex: 1 }}>
                    <TouchableWithoutFeedback onPress={() => setShowModal(!showModal)}>
                        <View style={styles.modal}></View>
                    </TouchableWithoutFeedback>
                    <View style={styles.screen}>
                        <FlatList data={likedData} renderItem={itemData => <View>
                            <TouchableWithoutFeedback onPress={() => {
                                setShowModal(false);
                                props.navigation.navigate('UserProfile', {
                                    user: itemData.item.username,
                                    id: itemData.item.id
                                })
                            }}>
                                <View style={styles.userDetails}>
                                    <View style={styles.imageUserContainer} >
                                        <Image source={{ uri: itemData.item.profileImage }} style={styles.userImage} />
                                    </View>
                                    <View>
                                        <Text style={styles.boldText}>{itemData.item.username}</Text>
                                        <Text style={styles.normalText}>{itemData.item.fullName}</Text>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>} />
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    hr: {
        position: 'absolute',
        width: '100%',
        height: 2,
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        bottom: 80,
        left: 0
    },
    commentInput: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    input: {
        marginLeft: 20,
        width: '70%'
    },
    imageContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 10,
    },
    userList: {
        position: 'absolute',
        bottom: 81,
        width: '30%',
        height: 100,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10,
        marginHorizontal: '20%'
    },
    image: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginHorizontal: 10,
        marginTop: 10
    },
    fullName: {
        fontFamily: 'open-sans-bold',
        fontSize: 12
    },
    username: {
        fontFamily: 'open-sans',
        fontSize: 11
    },
    usernameText: {
        fontFamily: 'open-sans-bold',
        fontSize: 14,
        marginHorizontal: 5
    },
    commentTab: {
        flexDirection: 'row',
        width: '80%',
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    likeButton: {
        position: 'absolute',
        right: 5,
        top: 15
    },
    likeCount: {
        marginLeft: '20%',
    },
    modal: {
        width: '100%',
        height: '30%',
        backgroundColor: 'rgba(240, 240, 240, 0.3)',
    },
    screen: {
        width: '100%',
        height: '70%',
        backgroundColor: 'white',
        borderRadius: 15
    },
    userDetails: {
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    imageUserContainer: {
        width: 70,
        height: 70,
        margin: 10
    },
    userImage: {
        width: '100%',
        height: '100%',
        borderRadius: 35,
    },
    boldText: {
        fontFamily: 'open-sans-bold'
    },
    normalText: {
        fontFamily: 'open-sans',
        color: '#585858'
    }
})

export default CommentsScreen;