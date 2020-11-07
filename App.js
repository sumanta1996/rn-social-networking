import React, { useState, useEffect } from 'react';
import { AsyncStorage } from 'react-native';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';
import AppNavigator from './navigation/AppNavigator';
import UserData from './store/reducers/user';
import ImagesData from './store/reducers/images';
import NotificationData from './store/reducers/notification';
import Messages from './store/reducers/messages';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import ActiveBar from './store/reducers/ActiveBar';
import ReduxThunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import firebase from 'firebase';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: true,
      shouldShowAlert: true
    }
  }
})

const config = {
  apiKey: "AIzaSyAOA-42HV4pasMPJPSrzuFvdoD-r0uTFHo",
  authDomain: "rn-social-networking.firebaseapp.com",
  databaseURL: "https://rn-social-networking.firebaseio.com/",
  storageBucket: "rn-social-networking.appspot.com"
};

const fetchFonts = () => {
  return Font.loadAsync({
    'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
    'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
  });
}

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  if (!firebase.apps.length) {
    firebase.initializeApp(config);
  }

  const rootReducer = combineReducers({
    user: UserData,
    images: ImagesData,
    activeBar: ActiveBar,
    notification: NotificationData,
    messages: Messages
  });

  const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(ReduxThunk)));

  useEffect(() => {
    
  }, []);

  if (!fontLoaded) {
    return <AppLoading startAsync={fetchFonts} onFinish={() => setFontLoaded(true)} onError={err => console.log(err)} />;
  }

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>);
}