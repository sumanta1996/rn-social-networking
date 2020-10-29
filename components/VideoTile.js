import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableNativeFeedback, Modal, BackHandler } from 'react-native';
import { Video } from 'expo-av';
import { Entypo } from '@expo/vector-icons';

const VideoTile = props => {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', () => {
            console.log('Back pressed');
            setShowModal(false);
        })
    }, []);

    if (showModal) {
        return (
            <Modal animationType="slide" style={styles.modal} statusBarTranslucent={true}>
                <View style={styles.videoPlay}>
                    <Entypo name="cross" size={50} style={styles.icon} color="black" onPress={() => setShowModal(false)} />
                    <Video source={{ uri: props.video }} isMuted={true} style={styles.videoModal} shouldPlay isLooping resizeMode="cover" />
                </View>
            </Modal>
        )
    }

    return (
        <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('red', false)} onPress={() => setShowModal(true)}>
            <View style={styles.videoContainer}>
                <Video source={{ uri: props.video }} isMuted={true} style={styles.video} shouldPlay isLooping resizeMode="cover" />
            </View>
        </TouchableNativeFeedback>)
}

const styles = StyleSheet.create({
    videoContainer: {
        width: '33.33%',
        height: 300,
        padding: 2,
        position: 'absolute',
        right: 0,
        top: 30
    },
    video: {
        width: '100%',
        height: '100%'
    },
    videoPlay: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    videoModal: {
        width: '100%',
        height: '70%'
    },
    icon: {
        position: 'absolute',
        right: 0,
        top: 15
    },
    modal: {
        backgroundColor: 'black'
    }
})

export default VideoTile;