import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableNativeFeedback, FlatList, Image, TouchableWithoutFeedback } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch, connect } from 'react-redux';
import SearchBar from '../components/SearchBar';
import { notificationCreator } from '../store/actions/notification';
import { addFollowing, fetchEntireUserDatabase, removeFollowers, removeFollowersLoggedInUser, removeFollowing } from '../store/actions/user';

const FollowersFollowingScreen = props => {
    const dispatch = useDispatch();
    const [active, setActive] = useState(props.navigation.getParam('focusOn'));
    const [userList, setUserList] = useState([]);
    const username = props.navigation.getParam('username');
    const followers = props.navigation.getParam('followers');
    const following = props.navigation.getParam('following');
    const isMyProfile = props.navigation.getParam('isMyProfile');
    const loggedinUser = useSelector(state => state.user.loggedInUserdata);
    const [refresh, setRefresh] = useState();


    const toggleHandler = identifier => setActive(identifier);
    const { entireUserData } = props;

    const fetchUserList = () => {
        setUserList([]);
        //console.log('[Fetched Data] ',entireUserData);
        const updatedUserList = [];
        const arrayToRender = active === 'followers' ? entireUserData.find(user => user.username === username).followers :
            entireUserData.find(user => user.username === username).following;
        if (arrayToRender) {
            arrayToRender.map(each => {
                const userDetail = entireUserData.find(user => user.username === each);
                //console.log(userData.find(user => user.username === each));
                /* updatedUserList.push({
                    username: userDetail.username,
                    fullName: userDetail.fullName,
                    profileImage: userDetail.profileImage
                }); */
                updatedUserList.push(userDetail);
            });
        }
        setUserList(updatedUserList);
    }

    useEffect(() => {
        fetchUserList();
    }, [active, entireUserData, username]);

    const manageFollowersHandler = async (identifier, username, localId) => {
        if (identifier === 'remove') {
            //The only difference between remove and removing from following is that the operation is opposite
            setRefresh(username);
            await dispatch(removeFollowersLoggedInUser(username, localId));
            await dispatch(fetchEntireUserDatabase());
            setRefresh();
        }
        else if (identifier === 'follow') {
            //Add to following list
            setRefresh(username);
            await dispatch(addFollowing(username, localId));
            await dispatch(fetchEntireUserDatabase());
            setRefresh();
            dispatch(notificationCreator(localId, 'Following', loggedinUser.username + ' started following you.', 'Following',
                null, loggedinUser.localId));

        } else {
            //If following then onPress remove from following list.
            setRefresh(username);
            await dispatch(removeFollowing(username, localId));
            await dispatch(fetchEntireUserDatabase());
            setRefresh();
        }
    }

    const eachUserHandler = itemData => {
        console.log(itemData.item);
        const isItMyProfile = loggedinUser.username === itemData.item.username;
        const isFollowing = !!loggedinUser.following.find(user => user === itemData.item.username);
        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={
                    () => props.navigation.navigate('UserProfile', {
                        username: itemData.item.username,
                        id: itemData.item.id
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
                {isMyProfile ? <TouchableNativeFeedback
                    onPress={manageFollowersHandler.bind(this, active === 'followers' ? 'remove' : 'following', itemData.item.username, itemData.item.id)}>
                    <View style={styles.button}>
                        <Text>{active === 'followers' ? 'Remove' : 'Following'}</Text>
                        {refresh && refresh === itemData.item.username && <ActivityIndicator size="small" color="black" />}
                    </View>
                </TouchableNativeFeedback> :
                    !isItMyProfile && <TouchableNativeFeedback
                        onPress={manageFollowersHandler.bind(this, isFollowing ? 'following' : 'follow', itemData.item.username, itemData.item.id)}>
                        <View style={isFollowing ? styles.button : styles.buttonFollow}>
                            <Text>{isFollowing ? 'Following' : 'Follow'}</Text>
                            {refresh && refresh === itemData.item.username && <ActivityIndicator size="small" color="black" />}
                        </View>
                    </TouchableNativeFeedback>}
            </View>)
    }

    const changeTextHandler = text => {
        if (text === '') {
            fetchUserList();
        } else {
            const updatedList = userList.filter(user => user.fullName.toLowerCase().includes(text));
            setUserList(updatedList);
        }
    }

    return (
        <View style={styles.screen}>
            <View style={styles.textContainer}>
                <TouchableNativeFeedback onPress={toggleHandler.bind(this, 'followers')}>
                    <View style={styles.icon}>
                        <Text style={active === 'followers' ? styles.activeText : styles.normalText}>{followers ? followers.length : 0} followers</Text>
                        {active === 'followers' && <View style={styles.horizontalLine}></View>}
                    </View>
                </TouchableNativeFeedback>
                <TouchableNativeFeedback onPress={toggleHandler.bind(this, 'following')}>
                    <View style={styles.icon}>
                        <Text style={active === 'following' ? styles.activeText : styles.normalText}>{following ? following.length : 0} following</Text>
                        {active === 'following' && <View style={styles.horizontalLine}></View>}
                    </View>
                </TouchableNativeFeedback>
            </View>
            <SearchBar label={active === 'followers' ? 'Search followers' : 'Search following'} onChangeText={changeTextHandler} />
            <View>
                {userList.length > 0 && <FlatList data={userList} keyExtractor={(item) => item.username} renderItem={eachUserHandler} />}
            </View>
        </View>
    )
}

FollowersFollowingScreen.navigationOptions = navData => {
    const username = navData.navigation.getParam('username');
    return {
        headerTitle: username,
        headerTintColor: 'green'
    }
}

const styles = StyleSheet.create({
    screen: {
        width: '100%',
        height: '100%'
    },
    textContainer: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 10,
        backgroundColor: 'white',
        elevation: 2
    },
    horizontalLine: {
        width: '100%',
        borderBottomColor: 'black',
        borderBottomWidth: 1
    },
    icon: {
        width: '50%',
        height: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activeText: {
        fontFamily: 'open-sans-bold',
        fontSize: 20,
        color: 'black'
    },
    normalText: {
        fontFamily: 'open-sans-bold',
        fontSize: 20,
        color: '#ccc'
    },
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
        alignItems: 'center',
        flexDirection: 'row'
    },
    buttonFollow: {
        height: 40,
        paddingHorizontal: 10,
        marginHorizontal: 10,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: '#00FFFF',
        flexDirection: 'row'
    }
});

const mapPropsToState = state => {
    return {
        entireUserData: state.user.enitreUserDatabase
    }
}

export default connect(mapPropsToState)(FollowersFollowingScreen);