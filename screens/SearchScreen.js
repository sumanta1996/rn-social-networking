import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TouchableNativeFeedback } from 'react-native';
import ImageTile from '../components/ImageTile';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import VideoTile from '../components/VideoTile';
import LayoutScreen from './LayoutScreen';

const SearchScreen = props => {
    const feedData = useSelector(state => state.images.feedData);
    const loggedInUsername = useSelector(state => state.user.loggedInUserdata.username);
    const images = feedData.filter(feed => !feed.username.includes(loggedInUsername));

    const imageDetailsHandler = index => {
        props.navigation.navigate('ImageDetails', {
            userData: images,
            index: index,
            hideBottomBar: true
        });
    }

    return (
        <LayoutScreen navigation={props.navigation}>
            <FlatList numColumns={3} data={images}
                renderItem={itemData => {
                    if (itemData.item.videoUrl) {
                        return <VideoTile video={itemData.item.videoUrl} onPress={() => { }} />
                    }
                    return <ImageTile image={itemData.item.imageUrl} onPress={imageDetailsHandler.bind(this, itemData.index)} onLongPress={() => { }}
                        onPressOut={() => { }} />
                }} />
        </LayoutScreen>
    )
}

SearchScreen.navigationOptions = navData => {
    return {
        headerTitle: '',
        headerLeft: () => {
            return <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={styles.icon} onPress={() => navData.navigation.goBack()}>
                    <Ionicons name="md-arrow-back" size={26} />
                </TouchableOpacity>
                <TouchableNativeFeedback onPress={() => navData.navigation.navigate('SearchUser')}>
                    <View style={styles.headerStyles}>
                        <Ionicons name="md-search" size={26} style={{ paddingHorizontal: 20 }} />
                        <Text style={{ fontFamily: 'open-sans-bold' }}>Search</Text>
                    </View>
                </TouchableNativeFeedback>
            </View>
        }
    }
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerStyles: {
        flexDirection: 'row',
        width: 200,
        height: '100%',
        alignItems: 'center',
        marginLeft: 20
    },
    icon: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10
    },
})

export default SearchScreen;