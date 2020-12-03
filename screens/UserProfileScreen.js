import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import UserProfile from '../components/UserProfile';
import { fetchUserData } from '../store/actions/user';
import user from '../store/reducers/user';
import LayoutScreen from './LayoutScreen';

const UserProfileScreen = props => {
    const [loader, setLoader] = useState(true);
    const userData = useSelector(state => state.user.userData);
    const loggedInUser = useSelector(state => state.user.loggedInUserdata);
    const username = props.navigation.getParam('username');
    const dispatch = useDispatch();

    useEffect(() => {
        (async () => {
            const username = props.navigation.getParam('id');
            //const user = userData.find(user => user.username === username);
            await dispatch(fetchUserData(username, false));
            setLoader(false);
        })();
    }, []);

    const fetchUserDataOnRefresh = async () => {
        const username = props.navigation.getParam('id');
        await dispatch(fetchUserData(username, false)); 
    }

    if (loader || !userData) {
        return <View style={styles.centered}>
            <ActivityIndicator size="large" color="black" />
        </View>
    } else {
        return (
            <LayoutScreen navigation={props.navigation}>
                <UserProfile isLoggedIn={false} navigation={props.navigation} user={userData} 
                isFollowing={loggedInUser.following && loggedInUser.following.includes(username)?true:false} onRefresh={fetchUserDataOnRefresh} />
            </LayoutScreen>
        )
    }
}

UserProfileScreen.navigationOptions = navData => {
    const username = navData.navigation.getParam('username') ? navData.navigation.getParam('username') : '';
    return {
        headerTitle: username,
        headerTintColor: 'green'
    }
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default UserProfileScreen;