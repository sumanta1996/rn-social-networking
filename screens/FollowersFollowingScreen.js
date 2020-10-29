import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableNativeFeedback, FlatList, Image, TouchableWithoutFeedback } from 'react-native';
import { useSelector, useDispatch, connect } from 'react-redux';
import SearchBar from '../components/SearchBar';
import { addFollowing, removeFollowers } from '../store/actions/user';

const FollowersFollowingScreen = props => {
    const dispatch = useDispatch();
    const [active, setActive] = useState(props.navigation.getParam('focusOn'));
    const [userList, setUserList] = useState([]);
    const username = props.navigation.getParam('username');
    const followers = props.navigation.getParam('followers');
    const following = props.navigation.getParam('following');
    const isMyProfile = props.navigation.getParam('isMyProfile');
    const loggedinUser = useSelector(state => state.user.loggedInUserdata);


    const toggleHandler = identifier => setActive(identifier);
    const { entireUserData } = props;

    const fetchUserList = () => {
        setUserList([]);
        //console.log('[Fetched Data] ',entireUserData);
        const updatedUserList = [];
        const arrayToRender = active === 'followers' ? entireUserData.find(user => user.username === username).followers :
            entireUserData.find(user => user.username === username).following;
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
        setUserList(updatedUserList);
    }

    useEffect(() => {
        fetchUserList();
    }, [active, entireUserData]);

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
                        user: itemData.item
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
                    onPress={manageFollowersHandler.bind(this, active === 'followers' ? 'followers' : 'following', itemData.item.username)}>
                    <View style={styles.button}>
                        <Text>{active === 'followers' ? 'Remove' : 'Following'}</Text>
                    </View>
                </TouchableNativeFeedback> :
                    !isItMyProfile && <TouchableNativeFeedback
                        onPress={manageFollowersHandler.bind(this, isFollowing ? 'following' : 'follow', itemData.item.username)}>
                        <View style={isFollowing ? styles.button : styles.buttonFollow}>
                            <Text>{isFollowing ? 'Following' : 'Follow'}</Text>
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
                        <Text style={active === 'followers' ? styles.activeText : styles.normalText}>{followers.length} followers</Text>
                        {active === 'followers' && <View style={styles.horizontalLine}></View>}
                    </View>
                </TouchableNativeFeedback>
                <TouchableNativeFeedback onPress={toggleHandler.bind(this, 'following')}>
                    <View style={styles.icon}>
                        <Text style={active === 'following' ? styles.activeText : styles.normalText}>{following.length} following</Text>
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
});

const mapPropsToState = state => {
    return {
        entireUserData: state.user.enitreUserDatabase
    }
}

export default connect(mapPropsToState)(FollowersFollowingScreen);