import React, { useCallback, useEffect, useState } from 'react';
import { userData } from '../data/dummy-data';
import UserProfile from '../components/UserProfile';
import { useDispatch, useSelector } from 'react-redux';
import HeaderButton from '../components/HeaderButton';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { DrawerActions } from 'react-navigation-drawer';
import { View, StyleSheet } from 'react-native';
import LayoutScreen from './LayoutScreen';
import { fetchUserData } from '../store/actions/user';

const MyProfileScreen = props => {
    //Keeping the part hardcoded now will change it when will add authentication class.
    //const user = userData.find(user => user.username === 'r.das');
    const [showDrawer, setShowDrawer] = useState(false);
    const user = useSelector(state => state.user.loggedInUserdata);
    const dispatch = useDispatch();

    useEffect(() => {
        props.navigation.setParams({
            username: user.username
        });

    }, []);

    const drawerHandler = useCallback(() => {
        setShowDrawer(!showDrawer);
    }, [showDrawer]);

    useEffect(() => {
        props.navigation.setParams({
            drawer: drawerHandler
        });
    }, [drawerHandler]);

    const fetchUserDataOnRefresh = async () => {
        await dispatch(fetchUserData(user.localId, true)); 
    }

    return (
        <LayoutScreen navigation={props.navigation}>
            <View style={{ flexDirection: 'row' }}>
                <UserProfile isLoggedIn={true} navigation={props.navigation} myProfile={user} onRefresh={fetchUserDataOnRefresh} />
            </View >
        </LayoutScreen>
    )
}

MyProfileScreen.navigationOptions = navData => {
    const username = navData.navigation.getParam('username');
    return {
        headerTitle: username ? username : '',
        headerTintColor: 'green',
        headerRight: () => {
            return <HeaderButtons HeaderButtonComponent={HeaderButton}>
                <Item title='Menu' iconName='md-menu' onPress={() => {
                    //navData.navigation.getParam('drawer')();
                    navData.navigation.dispatch(DrawerActions.toggleDrawer());
                    //navData.navigation.toggleDrawer();
                }} />
            </HeaderButtons>
        }
    }
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        width: '50%',
        height: '100%',
        position: 'absolute',
        right: 0,
        top: 0,
        backgroundColor: 'white',
        padding: 20
    },
    iconDetails: {
        flexDirection: 'row',
        width: '45%',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginVertical: 20
    },
    text: {
        fontFamily: 'open-sans-bold',
        fontSize: 18
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

export default MyProfileScreen;