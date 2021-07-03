import { Entypo, Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEntireUserDatabase, signUp } from '../store/actions/user';

const SignupScreen = props => {
    const [email, setEmail] = useState('');
    const [emailValidity, setEmailValidity] = useState(false);
    const [username, setUsername] = useState('');
    const [usernameValidity, setUsernameValidity] = useState(false);
    const [fullname, setFullname] = useState('');
    const [checkFullnameValidity, setCheckFullnameValidity] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordValidity, setPasswordValidity] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordValidity, setConfirmPasswordValidity] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formValidity, setFormValidity] = useState(false);
    const [loader, setLoader] = useState(false);
    const [fullScreenLoader, setFullscreenLoader] = useState(true);
    const entireUserDatabase = useSelector(state => state.user.enitreUserDatabase);
    const [errorMsg, setErrorMsg] = useState();
    const dispatch = useDispatch();

    useEffect(() => {
        (async () => {
            await dispatch(fetchEntireUserDatabase());
            setFullscreenLoader(false);
        })();
    }, []);

    useEffect(() => {
        setFormValidity(emailValidity && usernameValidity && checkFullnameValidity && passwordValidity && confirmPasswordValidity);
    }, [emailValidity, usernameValidity, checkFullnameValidity, passwordValidity, confirmPasswordValidity]);

    const validateMailAddress = text => {
        setErrorMsg();
        setEmail(text);
        setEmailValidity(text.length > 0 && text.includes('@') && text.includes('.') && text.lastIndexOf('.') !== text.length - 1);
    }

    const validateUsername = text => {
        setUsername(text);
        let flag = true;
        if (text.length > 4) {
            entireUserDatabase.map(user => {
                if (user.username === text) {
                    flag = false;
                }
            });
        } else {
            flag = false;
        }
        setUsernameValidity(flag);
    }

    const validateFullname = text => {
        setFullname(text);
        setCheckFullnameValidity(text.length>6);
    }

    const validatePassword = text => {
        setPassword(text);
        if(text.length>=6) {
            setPasswordValidity(true);
            setConfirmPasswordValidity(text === confirmPassword);
        }else {
            setPasswordValidity(false);
            setConfirmPasswordValidity(false);
        }
    }

    const validateConfirmPassword = text => {
        setConfirmPassword(text);
        if(passwordValidity === true) {
            setConfirmPasswordValidity(password === text);
        }else {
            setConfirmPasswordValidity(false);
        }
    }

    const signup = async () => {
        try{
            setLoader(true);
            await dispatch(signUp(email, password, fullname, username));
            setLoader(false);
            props.navigation.navigate('Auth');
        }catch(err) {
            setLoader(false);
            setErrorMsg(err.message);
        }
        
    }

    if (fullScreenLoader) {
        return <View style={styles.screen}>
            <ActivityIndicator color='black' size="large" />
        </View>
    }

    return <ScrollView contentContainerStyle={styles.screen} scrollEnabled={true}>
        <Text style={styles.heading}>Signup Screen</Text>
        <View style={styles.input}>
            <TextInput placeholder="Enter you email address" autoCapitalize="none" keyboardType="email-address" onChangeText={validateMailAddress} value={email} style={{ width: '90%' }} />
            {email.length > 0 ? emailValidity === true ? <Ionicons name="md-checkmark" size={24} /> : <Entypo name="cross" size={24} color="red" /> : null}
        </View>
        <View style={styles.input}>
            <TextInput placeholder="Enter your username" autoCapitalize="none" keyboardType="email-address" style={{ width: '90%' }} onChangeText={validateUsername} value={username} />
            {username.length > 0 ? usernameValidity === true ? <Ionicons name="md-checkmark" size={24} /> : <Entypo name="cross" size={24} color="red" /> : null}
        </View>
        <View style={styles.input}>
            <TextInput placeholder="Enter your fullname" autoCapitalize="none" keyboardType="email-address" style={styles.input} onChangeText={validateFullname} value={fullname} />
            {fullname.length > 0 ? checkFullnameValidity === true ? <Ionicons name="md-checkmark" size={24} /> : <Entypo name="cross" size={24} color="red" /> : null}
        </View>

        <View style={styles.input}>
            <TextInput placeholder="Enter your password" secureTextEntry={showPassword ? false : true} onChangeText={validatePassword} value={password} style={{ width: '85%' }} />
            {password.length > 0 ? passwordValidity === true ? <Ionicons name="md-checkmark" size={24} /> : <Entypo name="cross" size={24} color="red" /> : null}
            <Ionicons name={showPassword ? "md-eye-off" : "md-eye"} size={27} onPress={() => setShowPassword(!showPassword)} style={styles.passwordEye} />
        </View>
        <View style={styles.input}>
            <TextInput placeholder="Confirm your password" secureTextEntry={showConfirmPassword ? false : true} onChangeText={validateConfirmPassword} value={confirmPassword} style={{ width: '85%' }} />
            {confirmPassword.length > 0 ? confirmPasswordValidity === true ? <Ionicons name="md-checkmark" size={24} /> : <Entypo name="cross" size={24} color="red" /> : null}
            <Ionicons name={showConfirmPassword ? "md-eye-off" : "md-eye"} size={27} onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.passwordEye} />
        </View>
        <TouchableOpacity activeOpacity={0.4} style={formValidity ? styles.buttonEnable : styles.buttonDisable} onPress={signup} disabled={!formValidity}>
            {loader ? <ActivityIndicator color="black" size="small" /> : <Text style={formValidity ? styles.login : styles.disabledLogin}>Signup</Text>}
        </TouchableOpacity>
        {errorMsg?<Text style={{marginTop: 10, color: 'red', fontSize: 17}}>{errorMsg}</Text>: null}
    </ScrollView>
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
        marginBottom: 10
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
        margin: 5,
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative'
    },
    buttonSignup: {
        width: '90%',
        height: 60,
        backgroundColor: 'dodgerblue',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10
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
    },
    passwordEye: {
        position: 'absolute',
        right: 10
    }
})

export default SignupScreen;