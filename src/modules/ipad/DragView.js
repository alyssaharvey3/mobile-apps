import { Component } from "react";
import { requireNativeComponent, Platform, View } from "react-native"

const DragViewNative = Platform.OS === 'ios' && Platform.isPad && parseInt(Platform.Version, 10)>=11 && requireNativeComponent("iPadDragView", null)

export const dragViewSupported = DragViewNative ? true : false

export default class DragView extends Component {
    render() {
        let { children, dragItem, dragItems, ...rest } = this.props;

        if (!dragViewSupported)
            return (
                <View {...rest}>{children}</View>
            )

        if (dragItem)
            dragItems = [dragItem]

        return (
            <DragViewNative {...rest} dragItems={dragItems}>
                {children}
            </DragViewNative>
        );
    }
}