import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, Text, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import ImageTile from '../components/ImageTile';

const SavedPostScreen = props => {
    const feedData = useSelector(state => state.images.feedData);
    const loggedInUser = useSelector(state => state.user.loggedInUserdata);
    const images = feedData.filter(feed => feed.savedBy.includes(loggedInUser.username));
    
    /* useEffect(() => {
        let data = [];
        data = feedData.filter(feed => feed.savedBy.includes('r.das'));
        setImages(data);
    }, [images, feedData]); */

    const imageDetailsHandler = index => {
        props.navigation.navigate('ImageDetails', {
            userData: images,
            index: index,
            hideBottomBar: true
        });
    }

    if(images.length === 0) {
        return <View style={styles.loader}>
            <ActivityIndicator size="large" color="black" />
        </View>
    }

    return (
        <FlatList numColumns={3} data={images}
            renderItem={itemData => <ImageTile image={itemData.item.imageUrl} onPress={imageDetailsHandler.bind(this, itemData.index)} onLongPress={() => { }}
                onPressOut={() => { }} />} />
    )
}

SavedPostScreen.navigationOptions = navData => {
    const headerName = navData.navigation.getParam('headerName');

    return {
        headerTitle: '',
        headerLeft: () => {
            return <View style={{ flexDirection: 'row' }}>
                <View style={styles.icon}>
                    <Ionicons name="md-arrow-back" size={26} onPress={() => navData.navigation.goBack()} />
                </View>
                <View style={styles.headerStyles}>
                    <Text style={{ fontFamily: 'open-sans-bold' }}>Saved</Text>
                    <Text style={{ fontSize: 14 }}>{headerName}</Text>
                </View>
            </View>
        }
    }
}

const styles = StyleSheet.create({
    headerStyles: {
        marginLeft: 30
    },
    icon: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default SavedPostScreen;