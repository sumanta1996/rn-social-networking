import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
//import { TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFilteredData } from '../store/actions/user';

const SearchUserScreen = props => {
    const [text, setText] = useState('');
    const userData = useSelector(state => state.user.searchedUsers);
    const dispatch = useDispatch();

    const searchUserHandler = text => setText(text);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (text !== '') {
                dispatch(fetchFilteredData(text));
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [text])

    const childDataHandler = itemData => {
        return (
            <TouchableOpacity onPress={() => props.navigation.navigate('UserProfile', {
                username: itemData.item.username,
                id: itemData.item.id
            })}>
                <View style={styles.eachData}>
                    <Image source={{ uri: itemData.item.profileImage }} style={styles.image} />
                    <Text style={styles.text}>{itemData.item.fullName}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View>
            <View style={styles.searchbar}>
                <TouchableOpacity style={styles.icon} onPress={() => props.navigation.goBack()}>
                    <Ionicons name="md-arrow-back" size={26} />
                </TouchableOpacity>
                <TextInput style={styles.search} placeholder="Search" onChangeText={searchUserHandler} />
            </View>
            {!userData ? <View style={styles.centered}>
                <Text>Type to continue search</Text>
            </View> :
                <FlatList data={userData} keyExtractor={item => item.username} renderItem={childDataHandler} />}
        </View>
    )
}

SearchUserScreen.navigationOptions = navData => {
    return {
        headerShown: false
    }
}

const styles = StyleSheet.create({
    searchbar: {
        width: '100%',
        height: 70,
        flexDirection: 'row',
        paddingTop: 30,
        elevation: 10,
        backgroundColor: 'white',
        shadowColor: 'black',
        shadowOpacity: 0.26,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
    },
    search: {
        width: '90%',
        height: 40,
        backgroundColor: 'transparent',
    },
    icon: {
        justifyContent: 'center',
        marginLeft: 10,
        width: '10%'
    },
    eachData: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginHorizontal: 10
    },
    text: {
        fontFamily: 'open-sans',
        fontSize: 16
    },
    centered: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default SearchUserScreen;