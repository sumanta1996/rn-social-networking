import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DirectMessagesScreen = props => {
    return (
        <View style={styles.centered}>
            <Text>DirectMessagesScreen</Text>
        </View>
    )
}

DirectMessagesScreen.navigationOptions = {
    headerTitle: 'Messages',
    headerTintColor: 'green' 
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default DirectMessagesScreen;