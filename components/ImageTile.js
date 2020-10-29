import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableNativeFeedback } from 'react-native';

const ImageTile = props => {
    const [longPressCnt, setLongPressCnt] = useState(0);
    const longPressHandler = () => {
        setLongPressCnt(1);
        props.onLongPress();
    }

    const pressOutHandler = () => {
        if (longPressCnt === 1) {
            setLongPressCnt(0);
            props.onPressOut();
        }
    }

    return (
        <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('red', false)} onPress={props.onPress} onLongPress={longPressHandler} onPressOut={pressOutHandler}>
            <View style={styles.imageContainer}>
                {props.image.length > 1 && <View style={styles.album}>
                    <Ionicons name="md-albums" size={15} color="white" />
                </View>}
                <Image style={styles.image} source={{ uri: props.image[0] }} />
            </View>
        </TouchableNativeFeedback>)
}

const styles = StyleSheet.create({
    imageContainer: {
        width: '33.33%',
        height: 120,
        padding: 2
    },
    image: {
        width: '100%',
        height: '100%'
    },
    album: {
        position: 'absolute',
        right: 5,
        top: 5,
        zIndex: 10
    }
})

export default ImageTile;