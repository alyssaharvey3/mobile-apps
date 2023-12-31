import { Modal } from 'react-native'
import Height from 'co/navigation/height'

import { Backdrop } from './style'
import View from './view'

export function Screen({ route: { params={} }, navigation }) {
    return (
        <>
            <Height height={300} />
            <View onCancel={navigation.goBack} {...params} />
        </>
    )
}

export function Component(props) {
    return (
        <Modal
            transparent
            visible
            animationType='fade'>
            <Backdrop>
                <View {...props} />
            </Backdrop>
        </Modal>
    )
}

export { View, Backdrop }