import Stack, { screenOptions as so } from 'co/navigation/stack'
import { Fade } from 'co/navigation/transition'

import Init from './init'
import Auth from './auth'
import Close from './close'

const screenOptions = {
    ...so,
    ...Fade,
    presentation: 'modal',
    cardShadowEnabled: false,
    cardOverlayEnabled: false
}

function Extension() {
    return (
        <Stack.Navigator screenOptions={screenOptions}>
            <Stack.Screen name='init' component={Init} options={Init.options} />
            <Stack.Screen name='auth' component={Auth} options={Auth.options} />
            <Stack.Screen name='close' component={Close} options={Close.options} />
        </Stack.Navigator>
    )
}

Extension.options = {
    stackPresentation: 'modal'
}

export default Extension