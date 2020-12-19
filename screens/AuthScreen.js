import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { fetchEntireUserDatabase, login, setPushToken } from '../store/actions/user';

const AuthScreen = props => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loader, setLoader] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formValidity, setFormValidity] = useState(false);
    const [err, setErr] = useState();
    const dispatch = useDispatch();

    useEffect(() => {
        if (username !== '' && password !== '' && password.length>=6) {
            setFormValidity(true);
        }
        if (username === '' || password === '' || password.length<6) {
            setFormValidity(false);
        }
        if(err) {
            setErr();
        }
    }, [username, password]);

    const loginHandler = async () => {
        console.log('Pressed');
        try {
            setLoader(true);
            await dispatch(login(username, password));
            await dispatch(fetchEntireUserDatabase());
            await dispatch(setPushToken());
            props.navigation.navigate('Homepage');
        } catch (err) {
            console.log(err.message);
            setErr(err.message);
        }
        setLoader(false);
    }

    return (
        <View style={styles.screen}>
            <Text style={styles.heading}>Social Networking</Text>
            <TextInput placeholder="Phone number,email address or username" autoCapitalize="none" keyboardType="email-address" style={styles.input} onChangeText={text => setUsername(text)} value={username} />
            <View style={styles.input}>
                <TextInput placeholder="Password" secureTextEntry={showPassword? false: true} onChangeText={text => setPassword(text)} value={password} style={{width: '90%'}} />
                <Ionicons name={showPassword? "md-eye-off":"md-eye"} size={27} onPress={() => setShowPassword(!showPassword)} />
            </View>
            <TouchableOpacity activeOpacity={0.4} style={formValidity ? styles.buttonEnable : styles.buttonDisable} onPress={loginHandler} disabled={!formValidity}>
                {loader ? <ActivityIndicator color="black" size="small" /> : <Text style={formValidity ? styles.login : styles.disabledLogin}>Login</Text>}
            </TouchableOpacity>
            {err? <Text style={{color: 'red'}}>{err}</Text>: null}
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontFamily: 'open-sans-bold',
        fontSize: 20,
        marginBottom: 80
    },
    login: {
        fontFamily: 'open-sans-bold',
        fontSize: 20,
        color: 'black'
    },
    disabledLogin: {
        fontFamily: 'open-sans-bold',
        fontSize: 20,
        color: '#666'
    },
    input: {
        width: '90%',
        height: 60,
        backgroundColor: '#ccc',
        margin: 10,
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center'
    },
    buttonEnable: {
        width: '90%',
        height: 60,
        backgroundColor: 'dodgerblue',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5
    },
    buttonDisable: {
        width: '90%',
        height: 60,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5
    }
})

export default AuthScreen;