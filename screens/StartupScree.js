import React, { useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View, AsyncStorage } from 'react-native';
import { useDispatch } from 'react-redux';
import { fetchNotifications } from '../store/actions/notification';
import { fetchEntireUserDatabase, fetchUserData } from '../store/actions/user';


const StartupScreen = props => {
    const dispatch = useDispatch();

    const autoLogin = async () => {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
            const transformedData = JSON.parse(data);
            const localId = transformedData.userId;
            if (localId) {
                await dispatch(fetchEntireUserDatabase());
                await dispatch(fetchUserData(localId, true));
                props.navigation.navigate('Homepage');
            } else {
                props.navigation.navigate('Authenticate');
            }
        } else {
            props.navigation.navigate('Authenticate');
        }
    }

    

    useEffect(() => {
        autoLogin();
        

    }, []);

    return <View style={styles.screen}>
        <ActivityIndicator color="black" size="large" />
    </View>

}

export default StartupScreen;

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})