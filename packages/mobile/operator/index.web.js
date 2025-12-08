import { AppRegistry } from 'react-native';
import App from './App';

const appName = 'RodistaaOperator';

// Register the app for web
AppRegistry.registerComponent(appName, () => App);

// Wait for DOM to be ready, then run the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const rootTag = document.getElementById('root');
    if (rootTag) {
      // Clear the loading screen
      rootTag.innerHTML = '';
      AppRegistry.runApplication(appName, {
        rootTag: rootTag,
      });
    }
  });
} else {
  // DOM is already ready
  const rootTag = document.getElementById('root');
  if (rootTag) {
    // Clear the loading screen
    rootTag.innerHTML = '';
    AppRegistry.runApplication(appName, {
      rootTag: rootTag,
    });
  }
}

