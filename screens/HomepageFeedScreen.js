import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useDispatch, useSelector } from 'react-redux';
import CardView from '../components/CardView';
import HeaderButton from '../components/HeaderButton';
import { likedHandler, saveHandler } from '../store/actions/images';
import LayoutScreen from './LayoutScreen';

export let flatListRef;
let moveToIndex = true;

const HomepageFeedScreen = props => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const userData = useSelector(state => state.user.enitreUserDatabase);
    const loggedInUser = useSelector(state => state.user.loggedInUserdata);
    const feedData = useSelector(state => state.images.feedData);
    var indexToStart = props.navigation.getParam('index') ? +props.navigation.getParam('index') : 0;
    const dispatch = useDispatch();
    const userDataFromProfile = props.navigation.getParam('userData');
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        const fetchedFilteredData = !!userDataFromProfile ? userDataFromProfile : feedData.filter(data => {
            //This is for people who I follow
            if (loggedInUser.following.includes(data.username)) {
                return data;
                //This is for my profile photo
            } else if (data.username === loggedInUser.username) {
                return data;
            }
        });
        setFilteredData(fetchedFilteredData);
    }, [feedData])

    useEffect(() => {
        console.log('Here');
        if(props.navigation.getParam('userData')) {
            moveToIndex = true;
        }else {
            moveToIndex = false;
        }
    }, [indexToStart])

    useEffect(() => {
        if (filteredData.length > 0 && moveToIndex) {
            console.log(moveToIndex, indexToStart);
            setIsRefreshing(true);
            const timer = setTimeout(() => {
                setIsRefreshing(false);
                flatListRef.scrollToIndex({
                    animated: true,
                    index: indexToStart
                });
                moveToIndex = false;
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [indexToStart, filteredData]);

    const renderCardHandler = itemData => {
        const user = userData.find(user => user.username === itemData.item.username);
        return <CardView image={itemData.item.imageUrl} fullName={user.fullName} profileImage={user.profileImage} likedPeople={itemData.item.likedPeople.length}
            saved={itemData.item.savedBy.includes(loggedInUser.username)}
            onSave={(saved) => {
                dispatch(saveHandler(itemData.item.id, loggedInUser.username, saved))
            }}
            onPress={() => props.navigation.navigate('UserProfile', {
                user: user
            })}
            onLikesPress={() => {
                props.navigation.navigate('Likes', {
                    username: user.username,
                    likedPeople: itemData.item.likedPeople
                });
            }}
            onComment={() => props.navigation.navigate('Comments', {
                imageId: itemData.item.id,
                //comments: itemData.item.comments
            })}
            isItLiked={itemData.item.likedPeople.includes(loggedInUser.username)}
            liked={(isLiked) => {
                dispatch(likedHandler(itemData.item.id, loggedInUser.username, isLiked))
            }} />
    }

    const refreshHandler = useCallback(async () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 2000);
    }, []);

    if (props.navigation.getParam('hideBottomBar')) {
        return (
            <FlatList ref={ref => { flatListRef = ref }} initialNumToRender={filteredData.length - 1} onScrollToIndexFailed={err => {
                console.log(err);
                flatListRef.scrollToOffset({ animated: true, offset: 0 });
            }} onRefresh={refreshHandler} refreshing={isRefreshing} data={filteredData} renderItem={renderCardHandler} />)
    }

    return <LayoutScreen navigation={props.navigation}>
        <View style={{ marginBottom: 50 }}>
            <FlatList ref={ref => { flatListRef = ref }} initialNumToRender={filteredData.length - 1} onScrollToIndexFailed={err => {
                console.log(err);
                flatListRef.scrollToOffset({ animated: true, offset: 0 });
            }} onRefresh={refreshHandler} refreshing={isRefreshing} data={filteredData} renderItem={renderCardHandler} />
        </View>
    </LayoutScreen>
}

HomepageFeedScreen.navigationOptions = navData => {
    const isImageDetails = !!navData.navigation.getParam('userData')
    return {
        headerTitle: isImageDetails ? 'Posts' : 'Homepage',
        headerTintColor: '#ff6f00',
        headerRight: () => {

            return !isImageDetails ? <HeaderButtons HeaderButtonComponent={HeaderButton}>
                <Item iconName="md-search" title="Search" onPress={() => navData.navigation.navigate('Search')} />
                <Item iconName="md-notifications-outline" title="Direct Messages" onPress={() => navData.navigation.navigate('DirectMessages')} />
            </HeaderButtons> : null
        }
    }
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomBar: {
        width: '100%',
        height: 50,
        justifyContent: 'space-evenly',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'white'
    }
})

export default HomepageFeedScreen;