import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import { enableScreens } from 'react-native-screens';

// Enable screens to improve performance and ensure correct behavior
enableScreens();


import App from './App';

registerRootComponent(App);
