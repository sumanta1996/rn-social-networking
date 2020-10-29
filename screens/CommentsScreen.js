import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, ScrollView, TouchableHighlight, TouchableOpacity, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { commentsHandler, fetchCommentsData } from '../store/actions/images';
import { fetchFilteredData } from '../store/actions/user';

const CommentsScreen = props => {
    const loggedInUser = useSelector(state => state.user.loggedInUserdata);
    const commentsData = useSelector(state => state.images.commentsData);
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
        dispatch(fetchCommentsData(imageId))
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
    }

    const renderComment = itemData => {
        return <View style={styles.commentTab}>
            <Image source={{uri: itemData.item.profileImage}} style={styles.image} />
            <Text style={styles.usernameText}>{itemData.item.username} :</Text>
            <Text>{itemData.item.comments}</Text>
        </View>
    }

    return (
        <View style={{ flex: 1, position: 'relative' }}>
            <FlatList data={commentsData} renderItem={renderComment} />
            {showUsers && <ScrollView style={styles.userList}>
                {searchedUsers.map(user => <TouchableHighlight key={user.username} onPress={mentionedUserHandler.bind(this, user.username)}>
                    <View style={{ flexDirection: 'row' }}>
                        <Image source={{ uri: user.profileImage }} style={styles.image} />
                        <View>
                            <Text style={styles.fullName}>{user.fullName}</Text>
                            <Text style={styles.username}>{user.username}</Text>
                        </View>
                    </View>
                </TouchableHighlight>)}
            </ScrollView>}
            <View style={styles.hr}></View>
            <View style={styles.commentInput}>
                <Image source={{ uri: loggedInUser.profileImage }} style={styles.imageContainer} />
                <TextInput blurOnSubmit={false} ref={ref => textRef = ref} style={styles.input} placeholder={"Comment as " + loggedInUser.username + " ..."} value={comments} onChangeText={commentHandler} />
                <TouchableOpacity activeOpacity={0.5} disabled={comments.length === 0} onPress={postCommentsHandler}>
                    <View style={{ width: 50, marginHorizontal: 10 }}>
                        <Text style={{ color: comments.length > 0 ? 'blue' : '#ccc' }}>Post</Text>
                    </View>
                </TouchableOpacity>
            </View>

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
        width: '100%',
        height: 50,
        margin: 10,
        alignItems: 'center'
    }
})

export default CommentsScreen;