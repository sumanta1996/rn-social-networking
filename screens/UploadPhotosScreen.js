import React, { useEffect, useState, useCallback } from 'react';
import {
    StyleSheet, View, Text, Platform, Alert, Image, ScrollView, KeyboardAvoidingView, TextInput, ActivityIndicator,
    TouchableWithoutFeedback
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { submitImages } from '../store/actions/images';
import firebase from "firebase";
import { notificationCreator } from '../store/actions/notification';

const UploadPhotosScreen = props => {
    const [imageUrl, setImageUrl] = useState([props.navigation.getParam('imageObj')]);
    const [description, setDescription] = useState('');
    const [loader, setLoader] = useState(false);
    const user = useSelector(state => state.user.loggedInUserdata);
    const dispatch = useDispatch();
    const tagged = props.navigation.getParam('taggedPeople');
    const [err, setErr] = useState();

    useEffect(() => {
        let updatedImageUrls = [...imageUrl];
        const index = props.navigation.getParam('index');
        updatedImageUrls[+index] = {
            ...updatedImageUrls[+index],
            tagged: tagged
        }
        setImageUrl(updatedImageUrls);
        //setTaggedPeople(tagged);
    }, [tagged]);

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
            aspect: [1, 1],
            quality: 1
        });

        if (!result.cancelled) {
            const updatedImageUrls = [...imageUrl];
            updatedImageUrls.push(result);
            setImageUrl(updatedImageUrls);
        }
    }

    const imageUploadHandler = async () => {
        const uploadedImageUrls = [];
        for (let key in imageUrl) {
            try {
                const response = await fetch(imageUrl[key].uri);
                const blob = await response.blob();
                const ref = firebase.storage().ref().child('social/' + imageUrl[key].uri.split('/').pop());
                await ref.put(blob);
                const url = await ref.getDownloadURL();
                uploadedImageUrls.push({
                    uri: url,
                    width: imageUrl[key].width,
                    height: imageUrl[key].height,
                    taggedPeople: imageUrl[key].tagged? imageUrl[key].tagged: [] 
                });
            } catch (err) {
                console.log(err);
                return;
            }
        }
        return uploadedImageUrls;
    }

    const addPostHandler = useCallback(async () => {
        if (description.length > 0 && imageUrl.length > 0) {
            setLoader(true);
            const uploadedImageUrls = await imageUploadHandler();
            const imageId = await dispatch(submitImages(uploadedImageUrls, description, user.username));
            setLoader(false);
            uploadedImageUrls.map(image => {
                const taggedPeople = image.taggedPeople;
                taggedPeople.map(tagg => {
                    dispatch(notificationCreator(tagg.id, 'Tagged', user.username + ' tagged you in a photo.', 'Tagged photo', imageId, user.localId));
                })
            })
            
            props.navigation.goBack();
        } else {
            setErr('Please enter a description to add photos.');
        }
    });

    const descriptionHandler = text => {
        setErr();
        setDescription(text);
    }

    useEffect(() => {
        props.navigation.setParams({
            addPost: addPostHandler,
            loader: loader
        });
    }, [description, imageUrl, loader]);

    return <KeyboardAvoidingView behavior="height" keyboardVerticalOffset={10} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
            <View style={styles.screen}>
                {/* {imageUrl.length === 0 ? <View style={styles.buttonContainer}>
                    <Button title="Add an Image" onPress={pickImage} />
                </View> : <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUrl[0] }} style={styles.image} />
                    </View>}
                <View style={styles.postDetailsContainer}>
                    <Text style={styles.text}>Post Details</Text>
                    <TextInput style={styles.input} placeholder="Enter description" multiline value={description} onChangeText={text => setDescription(text)} />
                    {loader? <ActivityIndicator size="small" color="green" />:<Button title="Add Post" color="green" onPress={addPostHandler} disabled={imageUrl.length === 0} />}
                </View> */}
                <View style={{ width: '80%' }}>
                    <TextInput style={styles.input} placeholder="Enter description" multiline value={description} onChangeText={descriptionHandler} />
                    {err? <Text style={{color: 'red'}}>{err}</Text>: null}
                    <TouchableWithoutFeedback>
                        <View style={{ ...styles.addMore, marginTop: 40 }}>
                            <View style={styles.hr}></View>
                            <Text>Add More Photos</Text>
                            <View style={styles.hr}></View>
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={() => props.navigation.navigate('TagPhoto', { uri: imageUrl[0], tagged: imageUrl[0].tagged?imageUrl[0].tagged: [], index: 0 })}>
                        <View style={{ ...styles.addMore }}>
                            <Text style={{ marginTop: 10 }}>{imageUrl[0].tagged && imageUrl[0].tagged.length > 0 ? 'Tagged ' + imageUrl[0].tagged.length + ' people' : 'Tag Photos'}</Text>
                            <View style={styles.hr}></View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <Image source={{ uri: imageUrl[0].uri }} style={styles.image} />
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
}

UploadPhotosScreen.navigationOptions = navData => {
    const loader = navData.navigation.getParam('loader');
    return {
        headerRight: () => loader === true ? <ActivityIndicator size="small" color="black" style={{ marginHorizontal: 10 }} /> :
            <TouchableWithoutFeedback onPress={() => { navData.navigation.getParam('addPost')() }}>
                <Text style={{ marginHorizontal: 10 }}>Post</Text>
            </TouchableWithoutFeedback>
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        margin: 10
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
        width: '70%',
    },
    imageContainer: {
        width: '100%',
        height: 200,
        marginTop: 10,
        marginRight: 10,
        alignItems: 'flex-end'
    },
    image: {
        width: '20%',
        height: 80,
        borderRadius: 10
    },
    addMore: {
        width: '100%',
        height: 40,
        justifyContent: 'space-between'
    },
    hr: {
        width: '90%',
        height: 1,
        backgroundColor: '#ccc'
    }
})

export default UploadPhotosScreen;