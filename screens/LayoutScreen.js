import { Ionicons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableNativeFeedback } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setActivity } from '../store/actions/ActiveBar';

const Homepage = 'HomepageFeed';
const Activity = 'NotificationFeed';
const MyProfile = 'MyProfileFeed';
const AddPhotos = 'AddPhotos';

const LayoutScreen = props => {
    const active = useSelector(state => state.activeBar.active);
    const dispatch = useDispatch();

    const activeHandler = screenName => {
        if(screenName === AddPhotos) {
            dispatch(setActivity(Homepage));
        }else {
            dispatch(setActivity(screenName));
        }
        props.navigation.navigate(screenName);
    }

    return (
        <View style={{ flex: 1 }}>
            {props.children}
            <View style={styles.bottomBar}>
                <TouchableNativeFeedback onPress={activeHandler.bind(this, Homepage)}>
                    {active === Homepage ? <Ionicons name="md-home" size={30} color="black" />:
                     <SimpleLineIcons name="home" size={30} />}
                </TouchableNativeFeedback>
                <TouchableNativeFeedback onPress={activeHandler.bind(this, AddPhotos)}>
                    <Ionicons name={"md-add-circle-outline"} size={30} />
                </TouchableNativeFeedback>
                <TouchableNativeFeedback onPress={activeHandler.bind(this, Activity)}>
                    <Ionicons name={active === Activity ? "md-heart" : "md-heart-empty"} size={30} />
                </TouchableNativeFeedback>
                <TouchableNativeFeedback onPress={activeHandler.bind(this, MyProfile)}>
                    <MaterialIcons name={active === MyProfile ? "person": "person-outline"} size={30} />
                </TouchableNativeFeedback>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
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

export default LayoutScreen;