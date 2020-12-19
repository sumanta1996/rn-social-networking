import React from 'react';
import { CardStyleInterpolators, createStackNavigator } from 'react-navigation-stack';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import HomepageFeedScreen from '../screens/HomepageFeedScreen';
import NotificationScreen from '../screens/NotificationScreen';
import MyProfileScreen from '../screens/Myprofile';
import { AntDesign, Fontisto } from '@expo/vector-icons';
import SearchScreen from '../screens/SearchScreen';
import DirectMessagesScreen from '../screens/DirectMessagesScreen';
import FollowersFollowingScreen from '../screens/FollowersFollowingScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import LikeScreen from '../screens/LikeScreen';
import { createDrawerNavigator } from 'react-navigation-drawer';
import SavedScreen from '../screens/SavedScreen';
import { Text, View, TouchableOpacity, AsyncStorage } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import HeaderButton from '../components/HeaderButton';
import SavedPostScreen from '../screens/SavedPostScreen';
import SearchUserScreen from '../screens/SearchUserScreen';
import UploadPhotosScreen from '../screens/UploadPhotosScreen';
import CommentsScreen from '../screens/CommentsScreen';
import AuthScreen from '../screens/AuthScreen';
import StartupScreen from '../screens/StartupScree';
import { useSelector, useDispatch } from 'react-redux';
import { setActivity } from '../store/actions/ActiveBar';
import ImageDetailsScreen from '../screens/ImageDetailsScreen';
import ConversationScreen from '../screens/ConversationScreen';
import ShareContentScreen from '../screens/ShareContentScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import TagPhotoScreen from '../screens/TagPhotoScreen';

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
    ImageData: ImageDetailsScreen,
    Conversation: {
        screen: ConversationScreen,
        navigationOptions: {
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }
    },
    UserProfile: UserProfileScreen,
    FollowersFollowing: FollowersFollowingScreen,
    Likes: LikeScreen,
    Comments: CommentsScreen,
    ImageDetails: HomepageFeedScreen,
    AddPhotos: UploadPhotosScreen,
    TagPhoto: TagPhotoScreen
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
    NotificationFeed: NotificationScreen,
    ImageData: ImageDetailsScreen,
    UserProfile: UserProfileScreen,
    Likes: LikeScreen,
    Comments: CommentsScreen,
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
    SavedPosts: SavedPostScreen,
    EditProfile: EditProfileScreen
});


const DrawerProfileNavigator = createDrawerNavigator({
    MyProfileData: MyProfileNavigator
}, {
    drawerPosition: "right",
    drawerType: "slide",
    drawerBackgroundColor: "transparent",
    overlayColor: "transparent",
    contentComponent: React.memo(props => {
        const username = useSelector(state => state.user.loggedInUserdata.username);
        const dispatch = useDispatch();

        return <View style={{ marginVertical: 50, marginHorizontal: 10 }}>
            <Text style={{fontSize: 20, padding: 5}}>{username}</Text>
            <View style={{ width: '100%', height: 1, backgroundColor: 'black', marginBottom: 10 }}></View>
            <TouchableOpacity style={{ flexDirection: 'row', marginVertical: 10 }} onPress={() => props.navigation.navigate('Saved')}>
                <Fontisto name="bookmark" size={25} style={{ paddingRight: 20 }} />
                <Text>Saved</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', marginVertical: 10 }} onPress={() => {
                AsyncStorage.removeItem('userData');
                props.navigation.navigate('Startup');
                dispatch(setActivity('HomepageFeed'));
            }}>
                <AntDesign name="logout" size={25} style={{ paddingRight: 20 }} />
                <Text>Logout</Text>
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

const AuthNavigator = createStackNavigator({
    Auth: AuthScreen
}, {
    defaultNavigationOptions: {
        headerShown: false
    }
})

const BottomNavigator = createSwitchNavigator({
    Startup: StartupScreen,
    Authenticate: AuthNavigator,
    Homepage: HomepageNavigator,
    Notification: NotificationNavigator,
    MyProfile: DrawerProfileNavigator,
});



export default createAppContainer(BottomNavigator);
