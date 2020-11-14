import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableWithoutFeedback, BackHandler, ScrollView, Image, Button } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import SearchBar from '../components/SearchBar';
import { setMessages } from '../store/actions/messages';
import { pushMessagesidsToLoggedInUser } from '../store/actions/user';

const ShareContentScreen = props => {
    const userDatabaseList = useSelector(state => state.user.enitreUserDatabase);
    const loggedInUser = useSelector(state => state.user.loggedInUserdata);
    const [userDatabase, setuserDatabase] = useState(userDatabaseList);
    const [pressedIds, setPressedIds] = useState([]);
    const dispatch = useDispatch();

    const changeTextHandler = text => {
        setuserDatabase(userDatabaseList.filter(user => (user.username.toLowerCase().includes(text.toLowerCase()) || 
        user.fullName.toLowerCase().includes(text.toLowerCase()))));
    }

    const sendImageHandler = (user) => {
        const updatedPressed = [...pressedIds];
        updatedPressed.push(user.id);
        setPressedIds(updatedPressed);

        let conversationId;
        user.messageIds.map(id => {
            if(loggedInUser.messageIds.includes(id)) {
                conversationId = id;
            }
        });
        if(!conversationId) {
            conversationId = user.id+loggedInUser.localId;
            dispatch(pushMessagesidsToLoggedInUser(conversationId));
        }

        dispatch(setMessages(user.token, conversationId, user.id, props.imageId, true));

    }

    //console.log(props.imageId);
    return <Modal animationType="slide" transparent={true} visible={props.visible} onRequestClose={props.closeModal}>
        <View style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={props.closeModal}>
                <View style={styles.modal}></View>
            </TouchableWithoutFeedback>
            <View style={styles.screen}>
                <SearchBar style={styles.search} onChangeText={changeTextHandler} />
                <ScrollView>
                    {userDatabase.map(user => {
                        return <View key={user.id} style={styles.each}>
                            <Image source={{ uri: user.profileImage }} style={styles.image} />
                            <Text style={styles.name}>{user.fullName}</Text>
                            <TouchableWithoutFeedback onPress={sendImageHandler.bind(this, user)} disabled={pressedIds.includes(user.id)}>
                                <View style={pressedIds.includes(user.id)? styles.buttonDisabled: styles.buttonActive}>
                                    <Text>{pressedIds.includes(user.id)? 'Sent':'Send'}</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    })}
                </ScrollView>
            </View>
        </View>
    </Modal>
}

ShareContentScreen.navigationOptions = {
    headerShown: false
}

const styles = StyleSheet.create({
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
    image: {
        width: 40,
        height: 40,
        borderRadius: 20
    },
    each: {
        width: '100%',
        height: 60,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    name: {
        paddingHorizontal: 20,
        fontFamily: 'open-sans',
        fontSize: 12
    },
    search: {
        marginTop: 10
    },
    buttonActive: {
        position: 'absolute',
        right: 20,
        width: 40,
        height: 30,
        borderRadius: 5,
        backgroundColor: 'dodgerblue',
        margin: 2,
        padding: 2
    },
    buttonDisabled: {
        position: 'absolute',
        right: 20,
        width: 40,
        height: 30,
        borderRadius: 5,
        backgroundColor: '#ccc',
        margin: 2,
        padding: 2
    }
})

export default ShareContentScreen;