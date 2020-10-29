import React, { useEffect } from 'react';
import LayoutScreen from './LayoutScreen';
import { View, Text, StyleSheet, TouchableNativeFeedback } from 'react-native';

const NotificationScreen = props => {

    return (
        <LayoutScreen navigation={props.navigation}>
            <View style={styles.centered}>
                <Text>NotificationScreen</Text>
            </View >
        </LayoutScreen>

    )
}

NotificationScreen.navigationOptions = {
    headerTitle: 'Activity',
    headerTintColor: 'orange'
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default NotificationScreen;