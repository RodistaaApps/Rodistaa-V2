import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './App';

// Register the app for web
AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});

