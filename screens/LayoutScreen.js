import { Ionicons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableNativeFeedback, Dimensions, Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setActivity } from '../store/actions/ActiveBar';
import { setNoNewNotification } from '../store/actions/notification';

const Homepage = 'HomepageFeed';
const Activity = 'NotificationFeed';
const MyProfile = 'MyProfileFeed';
const AddPhotos = 'AddPhotos';

const LayoutScreen = props => {
    const active = useSelector(state => state.activeBar.active);
    const newNotification = useSelector(state => state.notification.newNotification);
    const dispatch = useDispatch();

    const activeHandler = async screenName => {
        if (screenName === AddPhotos) {
            dispatch(setActivity(Homepage));
        } else {
            dispatch(setActivity(screenName));
            if (screenName === Activity) {
                dispatch(setNoNewNotification());
            }
        }
        props.navigation.navigate(screenName);
    }

    /* const getDirectionAndColor = ({ moveX, moveY, dx, dy }) => {
        console.log(moveX);
        const draggedLeft = dx < -30;
        const draggedRight = dx > 30;

        if (draggedLeft || draggedRight) {
            if (draggedLeft) {
                props.navigation.navigate('DirectMessages')
            }
        }
    } */
    //{...panResponder.panHandlers}
    return (
        <View style={styles.screen}>
            {props.children}
            <View style={styles.bottomBar}>
                <TouchableNativeFeedback onPress={activeHandler.bind(this, Homepage)} style={styles.eachBar}>
                    {active === Homepage ? <Ionicons name="md-home" size={30} color="black" /> :
                        <SimpleLineIcons name="home" size={30} />}
                </TouchableNativeFeedback>
                <TouchableNativeFeedback onPress={activeHandler.bind(this, AddPhotos)} style={styles.eachBar}>
                    <Ionicons name={"md-add-circle-outline"} size={30} />
                </TouchableNativeFeedback>
                <TouchableNativeFeedback onPress={activeHandler.bind(this, Activity)} style={styles.eachBar}>
                    <View>
                        <Ionicons name={active === Activity ? "md-heart" : "md-heart-empty"} size={30} />
                        {newNotification > 0 && <View style={styles.notificationDot}></View>}
                    </View>
                </TouchableNativeFeedback>
                <TouchableNativeFeedback onPress={activeHandler.bind(this, MyProfile)} style={styles.eachBar}>
                    <MaterialIcons name={active === MyProfile ? "person" : "person-outline"} size={30} />
                </TouchableNativeFeedback>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1
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
    },
    notificationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'red',
        marginLeft: 8
    },
    eachBar: {
        width: '25%',
        height: 50
    }
})

export default LayoutScreen;