import { Ionicons, AntDesign, Fontisto } from '@expo/vector-icons';
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback, TouchableOpacity, Dimensions, FlatList, TouchableHighlight } from 'react-native';

const CardView = props => {
    const [lastTap, setLastTap] = useState();
    const [isLiked, setIsLiked] = useState(props.isLiked);
    const [showHeart, setShowHeart] = useState(false);
    const [saved, setSaved] = useState(props.saved);
    const { isItLiked } = props;

    const doubleTapHandler = () => {
        if (!lastTap) {
            const date = Date.now();
            setLastTap(date);
        } else {
            const timeDifference = Date.now() - lastTap;
            setLastTap();
            //If time difference is less than 300ms then it's double tapped
            if (timeDifference < 300) {
                console.log('Double Tapped');
                setIsLiked(true);
                setShowHeart(true);
                props.liked(true);
            }
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (showHeart) {
                setShowHeart(false);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [showHeart]);

    const savedHandler = () => {
        setSaved(!saved);
        props.onSave(!saved);
    }

    useEffect(() => {
        //Setting this timer because then feed doesn't go to a particular index if no timer is there.
        //This happens because useEffect making this card render again leads to flatlist reloading thus it's failing to go to index value.
        //So setting the flatlist to 50ms and this 1 to 100ms
        const timer = setTimeout(() => {
            setIsLiked(isItLiked);
        }, 100);
        return () => clearTimeout(timer);
    }, [isItLiked])

    return (
        <View style={styles.card}>
            <TouchableWithoutFeedback onPress={props.onPress}>
                <View style={styles.textContainer} >
                    <Image style={styles.profile} source={{ uri: props.profileImage }} />
                    <Text style={styles.text}>{props.fullName}</Text>
                </View>
            </TouchableWithoutFeedback>
            <FlatList data={props.image} keyExtractor={item => item} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                renderItem={(itemData) => {
                    return <TouchableHighlight activeOpacity={0.5} onPress={doubleTapHandler}>
                        <View>
                            <Image key={itemData.item} style={styles.image} source={{ uri: itemData.item }} />
                            {props.image.length > 1 &&
                                <View style={styles.countContainer}>
                                    {props.image.map((data, index) => <View key={data} style={itemData.index === index ? styles.darkDot : styles.dotStyle}></View>)}
                                </View>}
                        </View>
                    </TouchableHighlight>
                }} />
            {showHeart && <View style={styles.heartPosition}>
                <AntDesign name="heart" size={100} color="white" />
            </View>}
            <TouchableWithoutFeedback onPress={props.onLikesPress}>
                <Text style={styles.likeText}>{props.likedPeople} likes</Text>
            </TouchableWithoutFeedback>
            <View style={styles.bottomContainer}>
                <View style={styles.likeCommentIcons}>
                    <AntDesign name={isLiked ? "heart" : "hearto"} size={25} onPress={() => {
                        setIsLiked(!isLiked);
                        props.liked(!isLiked);
                    }} color={isLiked ? "red" : "black"} />
                    <Ionicons name="md-text" size={25} onPress={props.onComment} />
                    <Ionicons name="md-share-alt" size={27} onPress={() => { }} />
                </View>
                <TouchableOpacity style={styles.save} onPress={savedHandler}>
                    {saved ? <Fontisto name="bookmark-alt" size={25} /> :
                        <Fontisto name="bookmark" size={25} />}
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    image: {
        //width: '100%',
        width: Dimensions.get('window').width,
        height: 400
    },
    card: {
        marginVertical: 20
    },
    textContainer: {
        margin: 5,
        flexDirection: 'row',
        width: '50%',
        height: 40,
        alignItems: 'center'
    },
    text: {
        fontFamily: 'open-sans-bold'
    },
    profile: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderColor: 'black',
        borderWidth: 1,
        marginRight: 10
    },
    bottomContainer: {
        width: '100%',
        height: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 6
    },
    likeCommentIcons: {
        width: '30%',
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    save: {
        width: '10%'
    },
    likeText: {
        fontFamily: 'open-sans-bold',
        paddingHorizontal: 10,
        paddingTop: 5
    },
    countContainer: {
        width: Dimensions.get('window').width,
        height: 14,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    dotStyle: {
        width: 8,
        height: 8,
        borderRadius: 4,
        margin: 2,
        borderColor: 'black',
        borderWidth: 1
    },
    darkDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        margin: 2,
        backgroundColor: 'black'
    },
    heartPosition: {
        position: 'absolute',
        zIndex: 10,
        top: '40%',
        left: '40%'
    }
})

export default CardView;