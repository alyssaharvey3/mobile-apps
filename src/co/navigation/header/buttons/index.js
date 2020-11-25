/*
    Place inside of render()!
    <Buttons>
        <Button
            icon='star'
            title=''
            bold={false}
            disabled={false}
            onPress={} />
    </Buttons>
*/
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import Icon from 'co/icon'
import { Wrap, ButtonWrap, ButtonTouch, ButtonText } from './style'

export const ButtonsWrap = Wrap

//specify any props to optimize rendering and update only on change
export function Buttons({ children, left=false, ...props }) {
    const navigation = useNavigation()

    //update buttons in header
    const values = Object.values(props)
    React.useEffect(()=>{
        navigation.setOptions({
            [left ? 'headerLeft' : 'headerRight']: ()=>(
                <Wrap>
                    {children}
                </Wrap>
            )
        })

        return ()=>
            navigation.setOptions({
                [left ? 'headerLeft' : 'headerRight']: undefined
            })
    }, values.length ? values : undefined)

    return null
}

export function Button({ icon, title, color='accent', variant, bold=false, ...etc }) {
    return (
        <ButtonTouch {...etc}>
            <ButtonWrap>
                {icon ? (
                    <Icon 
                        name={icon}
                        color={etc.disabled ? 'text.disabled' : color}
                        variant={variant} />
                ) : null}

                {title ? (
                    <ButtonText 
                        bold={bold}
                        color={etc.disabled ? 'text.disabled' : color}>
                        {title}
                    </ButtonText>
                ) : null}
            </ButtonWrap>
        </ButtonTouch>
    )
}