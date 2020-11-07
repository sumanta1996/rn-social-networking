import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableNativeFeedback, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMessages } from '../store/actions/messages';
import { fetchUserData } from '../store/actions/user';

const DirectMessagesScreen = props => {
    const conversationThread = useSelector(state => state.messages.conversationThread);
    const entireUserData = useSelector(state => state.user.enitreUserDatabase);
    const loggedInUser = useSelector(state => state.user.loggedInUserdata);
    const [reload, setReload] = useState(false);
    const dispatch = useDispatch();
    const [allDatas, setAllDatas] = useState([]);

    //console.log(conversationThread);

    useEffect(() => {
        (async () => {
            setReload(true);
            await dispatch(fetchAllMessages());
            await dispatch(fetchUserData(loggedInUser.localId, true));
            setReload(false);
        })();
    }, []);

    useEffect(() => {
        const updatedAllDatas = [...allDatas];
        for (let key in conversationThread) {
            const index = updatedAllDatas.findIndex(eachData => eachData.id === key);
            if (index === -1) {
                if (loggedInUser.messageIds.includes(key)) {
                    updatedAllDatas.push({
                        id: key,
                        data: conversationThread[key]
                    })
                }
            } else {
                updatedAllDatas[index] = {
                    id: key,
                    data: conversationThread[key]
                };
            }
        }
        setAllDatas(updatedAllDatas);

    }, [conversationThread]);

    const conversationHandler = (user, conversationId, isNew) => {
        props.navigation.navigate('Conversation', {
            username: user.username,
            profileImage: user.profileImage,
            userId: user.id,
            token: user.token,
            conversationId: conversationId
        })
    }

    const renderEachHandler = itemData => {
        const index = itemData.item.id.indexOf(loggedInUser.localId);
        const newMessageIds = loggedInUser.newMessageIds? loggedInUser.newMessageIds: [];
        console.log(loggedInUser.newMessageIds);
        const isNew = newMessageIds.includes(itemData.item.id);

        let updatedId;
        if (index > 0) {
            updatedId = itemData.item.id.substring(0, index);
        } else {
            updatedId = itemData.item.id.substring(loggedInUser.localId.length);
        }

        const userData = entireUserData.find(user => user.id === updatedId);

        let timeDifference = (new Date() - new Date(itemData.item.data[itemData.item.data.length - 1].time)) / 1000;
        timeDifference /= (60 * 60);
        timeDifference = Math.abs(Math.round(timeDifference));

        return <TouchableNativeFeedback onPress={conversationHandler.bind(this, userData, itemData.item.id, isNew)}>
            <View style={styles.eachRow}>
                <Image source={{ uri: userData.profileImage }} style={styles.image} />
                <View style={styles.profileData}>
                    <Text style={styles.user}>{userData.fullName}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.message}>{itemData.item.data[itemData.item.data.length - 1].message}</Text>
                        <Text style={{ ...styles.message, marginLeft: 20 }}>{timeDifference === 0 ? 'Now' : timeDifference.toString() + 'h'}</Text>
                        {isNew && <View style={styles.dot}></View>}
                    </View>
                </View>
            </View>
        </TouchableNativeFeedback>
    }

    if(reload) {
        return <View style={styles.centered}>
            <ActivityIndicator size="small" color="black" />
        </View>
    }

    return (
        <FlatList data={allDatas} renderItem={renderEachHandler} />
    )
}

DirectMessagesScreen.navigationOptions = {
    headerTitle: 'Messages',
    headerTintColor: 'green'
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    eachRow: {
        width: '100%',
        height: 70,
        flexDirection: 'row',
        alignItems: 'center'
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginHorizontal: 10
    },
    profileData: {
        width: '80%',
        height: 70,
        justifyContent: 'center'
    },
    user: {
        fontFamily: 'open-sans',
        fontSize: 13,
    },
    message: {
        color: 'grey',
        marginHorizontal: 2
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'dodgerblue',
        position: 'absolute',
        right: 10,
    }
})

export default DirectMessagesScreen;