import React from 'react';
import { CardStyleInterpolators, createStackNavigator } from 'react-navigation-stack';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import HomepageFeedScreen from '../screens/HomepageFeedScreen';
import NotificationScreen from '../screens/NotificationScreen';
import MyProfileScreen from '../screens/Myprofile';
import { Ionicons, Fontisto } from '@expo/vector-icons';
import SearchScreen from '../screens/SearchScreen';
import DirectMessagesScreen from '../screens/DirectMessagesScreen';
import { flatListRef } from '../screens/HomepageFeedScreen';
import FollowersFollowingScreen from '../screens/FollowersFollowingScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import LikeScreen from '../screens/LikeScreen';
import { createDrawerNavigator, DrawerActions } from 'react-navigation-drawer';
import SavedScreen from '../screens/SavedScreen';
import { Text, View, TouchableOpacity, TouchableNativeFeedback } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import HeaderButton from '../components/HeaderButton';
import SavedPostScreen from '../screens/SavedPostScreen';
import SearchUserScreen from '../screens/SearchUserScreen';
import UploadPhotosScreen from '../screens/UploadPhotosScreen';
import CommentsScreen from '../screens/CommentsScreen';

export let focusCount = 0;

const HomepageNavigator = createStackNavigator({
    HomepageFeed: HomepageFeedScreen,
    Search: SearchScreen,
    SearchUser: SearchUserScreen,
    DirectMessages: {
        screen: DirectMessagesScreen,
        navigationOptions: {
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }
    },
    UserProfile: UserProfileScreen,
    FollowersFollowing: FollowersFollowingScreen,
    Likes: LikeScreen,
    Comments: CommentsScreen,
    //ImageDetails: HomepageFeedScreen,
    AddPhotos: UploadPhotosScreen
}, {
    navigationOptions: navData => {
        const isImageDetails = !!navData.navigation.getParam('userData')
        return {
            headerTitle: isImageDetails ? 'Posts' : 'Homepage',
            headerTintColor: '#ff6f00',
            headerRight: () => {

                return !isImageDetails ? <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item iconName="md-search" title="Search" onPress={() => navData.navigation.navigate('Search')} />
                    <Item iconName="md-notifications-outline" title="Direct Messages" onPress={() => navData.navigation.navigate('DirectMessages')} />
                </HeaderButtons> : null
            },
           
        }
    }
});

const NotificationNavigator = createStackNavigator({
    NotificationFeed: NotificationScreen
});

/* const MyProfileDetailsNavigator = createStackNavigator({
    FollowersFollowing: FollowersFollowingScreen,
    UserProfile: UserProfileScreen,
    ImageDetails: HomepageFeedScreen,
}); */

const MyProfileNavigator = createStackNavigator({
    MyProfileFeed: MyProfileScreen,
    FollowersFollowing: FollowersFollowingScreen,
    UserProfile: UserProfileScreen,
    ImageDetails: HomepageFeedScreen,
    Likes: LikeScreen,
    Saved: SavedScreen,
    SavedPosts: SavedPostScreen
});


const DrawerProfileNavigator = createDrawerNavigator({
    MyProfileData: MyProfileNavigator
}, {
    drawerPosition: "right",
    drawerType: "slide",
    drawerBackgroundColor: "transparent",
    overlayColor: "transparent",
    contentComponent: React.memo(props => {
        return <View style={{ marginVertical: 50, marginHorizontal: 10 }}>
            <View style={{ width: '100%', height: 1, backgroundColor: 'black', marginBottom: 10 }}></View>
            <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => props.navigation.navigate('Saved')}>
                <Fontisto name="bookmark" size={25} style={{ paddingRight: 20 }} />
                <Text>Saved</Text>
            </TouchableOpacity>
        </View>
    })
})

/* const BottomNavigator = createMaterialBottomTabNavigator({
    Homepage: {
        screen: HomepageNavigator,
        navigationOptions: navData => {
            navData.navigation.addListener('willBlur', () => {
                focusCount = 0;
            });
            return {
                tabBarIcon: (tabInfo) => <Ionicons name="md-paper" size={25} color={tabInfo.tintColor} />,
                tabBarColor: '#ff6f00',
                tabBarOnPress: () => {
                    focusCount = focusCount + 1;
                    if (focusCount === 1) {
                        navData.navigation.navigate('Homepage');
                    } else if (focusCount > 1) {
                        flatListRef.scrollToOffset({ animated: true, offset: 0 })
                    }
                }
            }
        }
    },
    Notification: {
        screen: NotificationNavigator,
        navigationOptions: {
            tabBarLabel: 'Notification',
            tabBarIcon: (tabInfo) => <Ionicons name="md-heart" size={25} color={tabInfo.tintColor} />,
            tabBarColor: 'orange'
        }
    },
    MyProfile: {
        screen: MyProfileNavigator,
        screen: DrawerProfileNavigator,
        navigationOptions: {
            tabBarLabel: 'My Profile',
            tabBarIcon: (tabInfo) => <Ionicons name="md-person" size={25} color={tabInfo.tintColor} />,
            tabBarColor: 'green'
        }
    }
}, {
    activeColor: 'white',
    shifting: true,

}); */

const BottomNavigator = createSwitchNavigator({
    Homepage: HomepageNavigator,
    Notification: NotificationNavigator,
    MyProfile: DrawerProfileNavigator,
});



export default createAppContainer(BottomNavigator);
