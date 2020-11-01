import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableNativeFeedback } from 'react-native';
import { useSelector } from 'react-redux';

const SavedScreen = props => {
    const allDatas = ['All Posts'];
    //const savedData = useSelector(state => state.user.saved);
    const feedData = useSelector(state => state.images.feedData);
    const savedData = feedData.filter(feed => feed.savedBy.includes('r.das'));
    /* useEffect(() => {
        let data = [];
        data = feedData.filter(feed => feed.savedBy.includes('r.das'));
        setSavedData(data);
    }, [savedData, feedData]); */

    const onPressHandler = headerName => {
        props.navigation.navigate('SavedPosts', {
            headerName: headerName
        });
    }

    const renderItemHandler = itemData => {
        return <TouchableNativeFeedback onPress={onPressHandler.bind(this, itemData.item)}>
            <View style={styles.each}>
                <View style={styles.block}>
                    <View style={styles.imageContainer}>
                        <Image style={styles.image} source={{ uri: savedData[0] ? savedData[0].imageUrl[0] : '' }} />
                        <Image style={styles.image} source={{ uri: savedData[1] ? savedData[1].imageUrl[0] : '' }} />
                    </View>
                    <View style={styles.imageContainer}>
                        <Image style={styles.image} source={{ uri: savedData[2] ? savedData[2].imageUrl[0] : '' }} />
                        <Image style={styles.image} source={{ uri: savedData[3] ? savedData[3].imageUrl[0] : '' }} />
                    </View>
                </View>
                <View style={styles.textContainer}>
                    <Text>{itemData.item}</Text>
                </View>
            </View>
        </TouchableNativeFeedback>
    }

    if(!savedData || savedData.length === 0) {
        return <View style={styles.centered}>
            <Text>No saved post yet. Add some!!!</Text>
        </View>
    }

    return <FlatList columnWrapperStyle={styles.screen} data={allDatas} numColumns={2} keyExtractor={item => item} renderItem={renderItemHandler} />
}

SavedScreen.navigationOptions = {
    headerTitle: 'Saved',
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },  
    each: {
        width: '45%',
        height: 210
    },
    block: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        overflow: 'hidden'
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    screen: {
        justifyContent: 'space-between',
        padding: 10
    },
    imageContainer: {
        width: '100%',
        height: '50%',
        flexDirection: 'row'
    },
    image: {
        width: '50%',
        height: '100%'
    }
})

export default SavedScreen;