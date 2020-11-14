import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

const SearchBar = props => {
    return (
        <View style={{...styles.search, ...props.style}}>
            <View style={styles.icon}>
                <Ionicons name="md-search" size={23} />
            </View>
            <TextInput placeholder={props.label} style={styles.searchInput} onChangeText={props.onChangeText} />
        </View>
    )
}

const styles = StyleSheet.create({
    search: {
        width: '100%',
        height: 50,
        padding: 10
    },
    searchInput: {
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        paddingLeft: 25
    },
    icon: {
        position: 'absolute',
        top: 2,
        padding: 10
    }
})

export default SearchBar;