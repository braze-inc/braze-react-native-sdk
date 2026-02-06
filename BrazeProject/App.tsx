import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BrazeProject } from './BrazeProject';


function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <BrazeProject />
    </SafeAreaProvider>
  );
}

export default App;
