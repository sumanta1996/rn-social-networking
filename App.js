import React, { useState } from 'react';
import { AsyncStorage } from 'react-native';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';
import AppNavigator from './navigation/AppNavigator';
import UserData from './store/reducers/user';
import ImagesData from './store/reducers/images';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import ActiveBar from './store/reducers/ActiveBar';
import ReduxThunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

const persistenceKey = "persistenceKey"

const fetchFonts = () => {
  return Font.loadAsync({
    'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
    'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
  });
}

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  const rootReducer = combineReducers({
    user: UserData,
    images: ImagesData,
    activeBar: ActiveBar
  });

  const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(ReduxThunk)));

  if (!fontLoaded) {
    return <AppLoading startAsync={fetchFonts} onFinish={() => setFontLoaded(true)} onError={err => console.log(err)} />;
  }

  /* const persistNavigationState = async (navState) => {
    try {
      await AsyncStorage.setItem(persistenceKey, JSON.stringify(navState))
    } catch(err) {
      // handle the error according to your needs
    }
  }
  const loadNavigationState = async () => {
    const jsonString = await AsyncStorage.getItem(persistenceKey)
    return JSON.parse(jsonString)
  } */

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>);
}