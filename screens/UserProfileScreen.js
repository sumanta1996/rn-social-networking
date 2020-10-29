import React from 'react';
import UserProfile from '../components/UserProfile';
import LayoutScreen from './LayoutScreen';

const UserProfileScreen = props => {
    return (
        <LayoutScreen navigation={props.navigation}>
            <UserProfile isLoggedIn={false} navigation={props.navigation} />
        </LayoutScreen>
    )
}

UserProfileScreen.navigationOptions = navData => {
    const username = navData.navigation.getParam('user') ? navData.navigation.getParam('user').username : '';
    return {
        headerTitle: username,
        headerTintColor: 'green'
    }
}

export default UserProfileScreen;