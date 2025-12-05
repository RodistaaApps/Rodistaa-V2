import { AppRegistry } from 'react-native';
import App from './App';

const appName = 'RodistaaOperator';

// Register the app for web
AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});

