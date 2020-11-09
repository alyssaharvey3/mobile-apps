//react + navigation
import React from 'react'
import 'react-native-gesture-handler'
import { AppRegistry } from 'react-native'
import { enableScreens } from 'react-native-screens'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import RNBootSplash from 'react-native-bootsplash'

//redux
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/es/integration/react'
import { withLocalReducer } from 'data'
import localReducers from 'local/reducers'

//styles
import Appearance from 'modules/appearance'

//enable native screens
enableScreens()

//init redux
const { store, persistor } = withLocalReducer(localReducers)

//common bootstrap logic
function Bootstrap(Component) {
    return ()=>(
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <Appearance>
                    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                        <ActionSheetProvider>
                            <Bootsplash>
                                <Component />
                            </Bootsplash>
                        </ActionSheetProvider>
                    </SafeAreaProvider>
                </Appearance>
            </PersistGate>
        </Provider>
    )
}

function Bootsplash({ children }) {
    React.useEffect(() => RNBootSplash.hide({ duration: 300 }), [])
    return children
}

//register targets
AppRegistry.registerComponent('app', () => 
    Bootstrap(require('./app').default)
)

AppRegistry.registerComponent('extension', () => 
    Bootstrap(require('./extension').default)
)