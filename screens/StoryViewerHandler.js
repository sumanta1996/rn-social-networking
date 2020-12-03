import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, Image, ImageBackground, ActivityIndicator, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { useDispatch } from 'react-redux';
import { updateStoriesViewd } from '../store/actions/images';

const StoryViewerHandler = props => {
    const [imageUrls, setImageUrls] = useState(props.storyObj.data);
    const [userid, setUserid] = useState(props.storyObj.id);
    const [index, setIndex] = useState(props.indexStory);
    const dispatch = useDispatch();

    const changeImageHandler = event => {
        const screenWidth = Dimensions.get('window').width;
        const posX = event.nativeEvent.locationX;
        if (posX > screenWidth / 2) {
            console.log(index);
            console.log(imageUrls.length);
            if ((+index + 1) < imageUrls.length) {
                setIndex(+index + 1);
                dispatch(updateStoriesViewd(userid, imageUrls[+index+1].id));
            }
        } else {
            if (+index - 1 >= 0) {
                setIndex(+index - 1);
                //dispatch(updateStoriesViewd(userid, imageUrls[index].id));
            }
        }
    }

    return <Modal visible={props.showModal} onRequestClose={props.closeModal}>
        {imageUrls.length === 0 ? <View style={styles.centered}>
            <ActivityIndicator size="small" />
        </View> : <TouchableWithoutFeedback onPress={changeImageHandler}><ImageBackground style={styles.imageBackgroud} source={{ uri: imageUrls[index].imageUrl }}>
            <View style={{ flexDirection: 'row' }}>
                {imageUrls.map((url, i) => {
                return <View key={i} style={{ ...styles.bar, width: (Dimensions.get('window').width / imageUrls.length), backgroundColor: (+index === +i) ? '#ccc' : 'white' }}></View>})}
            </View>
            <View style={styles.userDetail}>
                <Image style={styles.image} source={{ uri: props.profileImage }} />
                <Text style={styles.username}>{props.username}</Text>
            </View>
        </ImageBackground></TouchableWithoutFeedback>}
    </Modal>
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 10
    },
    userDetail: {
        width: '100%',
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10
    },
    username: {
        fontWeight: 'bold'
    },
    imageBackgroud: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    bar: {
        height: 3,
        borderRadius: 2,
        backgroundColor: 'white',
        marginRight: 2
    }
})

export default StoryViewerHandler;