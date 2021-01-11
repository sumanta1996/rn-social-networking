import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

const SearchBar = props => {
    return (
        <View style={{...styles.search, ...props.style}}>
            <View style={styles.icon}>
                <Ionicons name="md-search" size={20} />
            </View>
            <TextInput placeholder={props.label} style={styles.searchInput} onChangeText={props.onChangeText} />
        </View>
    )
}

const styles = StyleSheet.create({
    search: {
        width: '100%',
        height: 50,
        padding: 10,
        flexDirection: 'row'
    },
    searchInput: {
        backgroundColor: '#ccc',
        paddingLeft: 40,
        borderRadius: 10,
        width: '100%',
        height: 40
    },
    icon: {
        position: 'absolute',
        left: 10,
        top: 20,
        width: 20,
        height: 20,
        marginHorizontal: 10,
        zIndex: 1
    }
})

export default SearchBar;