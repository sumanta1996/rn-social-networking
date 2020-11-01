import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableWithoutFeedback, Image, TouchableNativeFeedback } from 'react-native';
import { useDispatch, useSelector, connect } from 'react-redux';
import SearchBar from '../components/SearchBar';
import { addFollowing, removeFollowers } from '../store/actions/user';

const LikeScreen = props => {
    const [userList, setUserList] = useState([]);
    const username = props.navigation.getParam('username');
    const likedPeople = props.navigation.getParam('likedPeople');
    const loggedinUser = useSelector(state => state.user.loggedInUserdata);
    const { entireUserData } = props;
    const dispatch = useDispatch();

    const fetchUserList = () => {
        setUserList([]);
        //console.log('[Fetched Data] ',entireUserData);
        const updatedUserList = [];
        likedPeople.map(each => {
            const userDetail = entireUserData.find(user => user.username === each);
            updatedUserList.push(userDetail);
        });
        setUserList(updatedUserList);
    }

    useEffect(() => {
        fetchUserList();
    }, []);

    const manageFollowersHandler = (identifier, userTobeRemoved) => {
        if (identifier === 'follow') {
            dispatch(addFollowing(loggedinUser.username, userTobeRemoved))
        } else {
            dispatch(removeFollowers(loggedinUser.username, identifier, userTobeRemoved));
        }
    }

    const eachUserHandler = itemData => {
        const isItMyProfile = loggedinUser.username === itemData.item.username;
        const isFollowing = !!loggedinUser.following.find(user => user === itemData.item.username);
        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={
                    () => props.navigation.navigate('UserProfile', {
                        user: itemData.item.username
                    })
                }>
                    <View style={styles.userDetails}>
                        <View style={styles.imageContainer} >
                            <Image source={{ uri: itemData.item.profileImage }} style={styles.image} />
                        </View>
                        <View>
                            <Text style={styles.boldText}>{itemData.item.username}</Text>
                            <Text style={styles.normalText}>{itemData.item.fullName}</Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                {!isItMyProfile && <TouchableNativeFeedback
                    onPress={manageFollowersHandler.bind(this, isFollowing ? 'following' : 'follow', itemData.item.username)}>
                    <View style={isFollowing ? styles.button : styles.buttonFollow}>
                        <Text>{isFollowing ? 'Following' : 'Follow'}</Text>
                    </View>
                </TouchableNativeFeedback>}
            </View>)
    }

    return <FlatList data={userList} keyExtractor={(item) => item.username} renderItem={eachUserHandler} />
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 80,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    userDetails: {
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    imageContainer: {
        width: 70,
        height: 70,
        margin: 10
    },
    image: {
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
    },
    button: {
        height: 40,
        paddingHorizontal: 10,
        marginHorizontal: 10,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center'
    },
    buttonFollow: {
        height: 40,
        paddingHorizontal: 10,
        marginHorizontal: 10,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        backgroundColor: '#00FFFF'
    }
})

const mapPropsToState = state => {
    return {
        entireUserData: state.user.enitreUserDatabase
    }
}

export default connect(mapPropsToState)(LikeScreen);