import { Entypo, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { editProfileHandler, fetchUserData } from '../store/actions/user';
import firebase from "firebase";
import { fetchFeedData } from '../store/actions/images';

const EditProfileScreen = props => {
    const [userid, setUserid] = useState(props.navigation.getParam('userId'));
    const fullnameNav = props.navigation.getParam('fullName');
    const profileimageNav = props.navigation.getParam('profileImage');
    const statusNav = props.navigation.getParam('status');
    const [fullName, setFullname] = useState(fullnameNav);
    const [profileImage, setProfileImage] = useState(profileimageNav);
    const [status, setStatus] = useState(statusNav);
    const [refresh, setRefresh] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        props.navigation.setParams({
            submit: submitHandler,
            refresh: refresh
        });
    }, [fullName, profileImage, status, refresh]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        });

        if (!result.cancelled) {
            setProfileImage(result.uri);
        }
    }

    const imageUploadHandler = async () => {
        try {
            const response = await fetch(profileImage);
            const blob = await response.blob();
            const ref = firebase.storage().ref().child('social/' + profileImage.split('/').pop());
            await ref.put(blob);
            const url = await ref.getDownloadURL();
            return url;
        } catch (err) {
            console.log(err);
            return;
        }
    }

    const submitHandler = async () => {
        setRefresh(true);
        let changedObj = {};
        if (profileImage !== profileimageNav) {
            changedObj = {
                ...changedObj,
                profileImage: await imageUploadHandler()
            }
        }

        if (statusNav !== status) {
            changedObj = {
                ...changedObj,
                status: status
            }
        }
        if (fullName !== fullnameNav) {
            changedObj = {
                ...changedObj,
                fullName: fullName
            }
        }
        
        await dispatch(editProfileHandler(changedObj, userid));
        await dispatch(fetchUserData(userid, true));
        //dispatch(fetchFeedData());
        setRefresh(false);
        props.navigation.goBack();

    }

    return <KeyboardAvoidingView style={{ flex: 1 }} behavior="height" keyboardVerticalOffset={20}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.screen}>
                <Image source={{ uri: profileImage }} style={styles.image} />
                <Text style={styles.textStyle} onPress={pickImage}>Change Profile Photo</Text>
                <View style={styles.input}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput style={styles.textInput} value={fullName} onChangeText={text => setFullname(text)} />

                    <Text style={styles.label}>Bio</Text>
                    <TextInput style={styles.textInput} value={status} onChangeText={text => setStatus(text)} />
                </View>
            </View>
        </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
}

EditProfileScreen.navigationOptions = navData => {
    const submit = navData.navigation.getParam('submit');
    const refresh = navData.navigation.getParam('refresh');
    return {
        headerTitle: 'Edit Profile',
        headerLeft: () => <Entypo name="cross" size={26} onPress={() => navData.navigation.goBack()} />,
        headerRight: () => <View style={{ marginHorizontal: 10 }}>{refresh === true ? <ActivityIndicator size="small" color="black" /> :
            <Ionicons name="md-checkmark" size={26} onPress={submit} />}</View>
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: 'center'
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginVertical: 10
    },
    textStyle: {
        color: 'dodgerblue',
        fontSize: 17,
        marginVertical: 10
    },
    input: {
        width: '100%',
        alignItems: 'flex-start',
        paddingHorizontal: 10
    },
    label: {
        fontSize: 10,
        marginTop: 10
    },
    textInput: {
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        width: '100%',
        fontSize: 16,
        marginBottom: 10
    }
})

export default EditProfileScreen;