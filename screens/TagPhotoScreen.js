import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback, Modal, TextInput, Dimensions, BackHandler, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';

const TagPhotoScreen = props => {
    const [taggedPeople, setTaggedPeople] = useState(props.navigation.getParam('tagged')? props.navigation.getParam('tagged'): []);
    const [image, setImage] = useState(props.navigation.getParam('uri'));
    const index = props.navigation.getParam('index');
    const entireUserDatabase = useSelector(state => state.user.enitreUserDatabase);
    const [filteredUsers, setFilteredUsers] = useState(entireUserDatabase.filter(user => {
        const isTagged = taggedPeople.find(taggedUser => taggedUser.id == user.id);
        return !isTagged;
    }));
    const [coordinates, setCoordinates] = useState({});
    const [pressed, setPressed] = useState(false);
    const [searchedText, setSearchedText] = useState('');

    const handlePress = event => {
        setCoordinates({
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY
        });
    }

    const backHandlerAction = () => {
        console.log('Back pressed');
        let isPressed;
        setPressed(param => {
            isPressed = param;
            return param;
        })
        //console.log(isPressed);
        if (props.navigation.isFocused && isPressed === true) {
            setPressed(false);
            return true;
        } else {
            return false;
        }
    }

    const navigateBack = () => {
        console.log(taggedPeople);
        props.navigation.navigate('AddPhotos', {
            taggedPeople: taggedPeople,
            index: index
        })
    };

    const changeTextHandler = useCallback(text => {
        setSearchedText(text);
        const updatedUsers = entireUserDatabase.filter(user => {
            const isTagged = taggedPeople.find(taggedUser => taggedUser.id == user.id);
            return !isTagged && (user.fullName.toLowerCase().includes(text.toLowerCase()) || user.username.toLowerCase().includes(text.toLowerCase()));
        });
        setFilteredUsers(updatedUsers);
    }, []);

    const taggedPeopleHandler = (id, username) => {
        const obj = {
            id: id,
            username: username,
            ...coordinates
        }
        const updatedTagged = [...taggedPeople];
        updatedTagged.push(obj);
        //console.log(updatedTagged);
        setTaggedPeople(updatedTagged);
        setCoordinates({});
        setPressed(false);
    }

    useEffect(() => {
        props.navigation.setParams({
            changeTextHandler: changeTextHandler,
            text: searchedText,
            navigateBack: navigateBack
        });
    }, [searchedText, changeTextHandler, taggedPeople]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backHandlerAction);
        props.navigation.setParams({
            changeTextHandler: changeTextHandler
        });

        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        props.navigation.setParams({
            pressed: pressed
        })
    }, [pressed]);

    return <View style={styles.screen}>
        {pressed === false ? <TouchableWithoutFeedback onPress={handlePress}>
            <View>
                <Image resizeMode="contain" style={{ ...styles.image, height: Dimensions.get('window').width }} source={{ uri: image.uri }} />
                {coordinates.x ? <View style={{ ...styles.toast, top: coordinates.y, left: coordinates.x }}>
                    <Text onPress={() => setPressed(true)}>Who's this?</Text>
                </View> : null}
                {taggedPeople.length>0? taggedPeople.map(tagged => {
                    return <View key={tagged.id} style={{ ...styles.toast, top: tagged.y, left: tagged.x }}>
                    <Text>{tagged.username}</Text>
                </View>
                }): null}
            </View>
        </TouchableWithoutFeedback> :
            <ScrollView style={styles.users} >
                {filteredUsers.map(user => {
                    return <TouchableWithoutFeedback key={user.id} onPress={taggedPeopleHandler.bind(this, user.id, user.username)}>
                        <View style={styles.eachData}>
                            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
                            <Text style={styles.text}>{user.fullName}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                })}
            </ScrollView>}
    </View>
}

TagPhotoScreen.navigationOptions = navData => {
    const isPressed = navData.navigation.getParam('pressed');

    return {
        headerTitle: () => !isPressed || isPressed === false ? <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Tag People</Text> :
            <View style={{ overflow: 'hidden', height: '100%' }}>
                <TextInput placeholder='Search an user' autoFocus style={styles.textBox} underlineColorAndroid="white"
                    onChangeText={text => {
                        navData.navigation.getParam('changeTextHandler')(text);
                    }} value={navData.navigation.getParam('text')} />
            </View>,
        headerRight: () => {
            return <Text style={{...styles.text, color: 'dodgerblue', marginHorizontal: 10}} onPress={() => {navData.navigation.getParam('navigateBack')()}}>Done</Text>
        }
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    image: {
        width: Dimensions.get('window').width,
    },
    toast: {
        padding: 5,
        borderRadius: 10,
        position: 'absolute',
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center'
    },
    textBox: {
        width: '80%',
        height: 60,
        backgroundColor: 'white',
        marginBottom: -10
    },
    users: {
        width: '100%',
        height: Dimensions.get('window').height - 90,
        backgroundColor: 'white'
    },
    eachData: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginHorizontal: 10
    },
    text: {
        fontFamily: 'open-sans',
        fontSize: 16
    },
})

export default TagPhotoScreen;