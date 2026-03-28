/**
 * @format
 */
import 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

messaging().setBackgroundMessageHandler(async _remoteMessage => {
  // Handled by system notification tray automatically
});

AppRegistry.registerComponent(appName, () => App);
