import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, ScrollView, TouchableHighlight, TouchableOpacity, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { commentsHandler, fetchCommentsData } from '../store/actions/images';
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
    const searchedUsers = useSelector(state => state.user.searchedUsers);

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

    const renderComment = itemData => {
        let finalText = [];
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
        return <View style={styles.commentTab}>
            <Image source={{ uri: itemData.item.profileImage }} style={styles.image} />
            <Text style={styles.usernameText}>{itemData.item.username} :</Text>
            <View style={{ paddingRight: 10, marginRight: 10 }}>
                <Text>{finalText.map(text => {
                    return text;
                })}</Text>
            </View>
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
        margin: 10
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
        height: 50,
        margin: 10,
        alignItems: 'center'
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default CommentsScreen;