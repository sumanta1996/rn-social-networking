import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Button, Platform, Alert, Image, ScrollView, KeyboardAvoidingView, TextInput, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { submitImages } from '../store/actions/images';
import firebase from "firebase";

const UploadPhotosScreen = props => {
    const [imageUrl, setImageUrl] = useState([]);
    const [description, setDescription] = useState('');
    const [loader, setLoader] = useState(false);
    const user = useSelector(state => state.user.loggedInUserdata);
    const dispatch = useDispatch();
    useEffect(() => {
        (async () => {
            if (Platform.OS === 'android') {
                const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
                if (status != 'granted') {
                    Alert.alert('Oops!!', 'Sorry you dont have permission to access media.', [{ text: 'Okay' }]);
                }
            }
        })();
    }, [])

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });

        if (!result.cancelled) {
            const updatedImageUrls = [...imageUrl];
            updatedImageUrls.push(result.uri);
            setImageUrl(updatedImageUrls);
        }
    }

    const imageUploadHandler = async () => {
        const uploadedImageUrls = [];
        for (let key in imageUrl) {
            try {
                const response = await fetch(imageUrl[key]);
                const blob = await response.blob();
                const ref = firebase.storage().ref().child('social/' + imageUrl[key].split('/').pop());
                await ref.put(blob);
                const url = await ref.getDownloadURL();
                uploadedImageUrls.push(url);
            } catch (err) {
                console.log(err);
                return;
            }
        }
        return uploadedImageUrls;
    }

    const addPostHandler = useCallback(async () => {
        setLoader(true);
        const uploadedImageUrls = await imageUploadHandler();
        await dispatch(submitImages(uploadedImageUrls, description, user.username));
        setLoader(false);
        props.navigation.goBack();
    });

    return <KeyboardAvoidingView behavior="height" keyboardVerticalOffset={10} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
            <View style={styles.screen}>
                {imageUrl.length === 0 ? <View style={styles.buttonContainer}>
                    <Button title="Add an Image" onPress={pickImage} />
                </View> : <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUrl[0] }} style={styles.image} />
                    </View>}
                <View style={styles.postDetailsContainer}>
                    <Text style={styles.text}>Post Details</Text>
                    <TextInput style={styles.input} placeholder="Enter description" multiline value={description} onChangeText={text => setDescription(text)} />
                    {loader? <ActivityIndicator size="small" color="green" />:<Button title="Add Post" color="green" onPress={addPostHandler} disabled={imageUrl.length === 0} />}
                </View>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: 'center'
    },
    buttonContainer: {
        width: '70%',
        marginVertical: 20
    },
    text: {
        fontFamily: 'open-sans-bold',
        fontSize: 22,
        padding: 20
    },
    postDetailsContainer: {
        width: '100%',
        alignItems: 'center',
    },
    input: {
        width: '80%',
        height: 40,
        marginVertical: 15,
        borderBottomColor: 'black',
        borderBottomWidth: 1,
    },
    imageContainer: {
        width: '100%',
        height: 200
    },
    image: {
        width: '100%',
        height: '100%'
    }
})

export default UploadPhotosScreen;