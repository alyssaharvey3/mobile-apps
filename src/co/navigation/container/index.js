import { Platform } from 'react-native'
import styled from 'styled-components/native'
import { NavigationContainer } from '@react-navigation/native'
import StatusBar from './statusBar'
import NavigationBar from './navigationBar'

const RootWrap = styled.View`
    flex: 1;
    ${({theme})=>Platform.OS === 'android' && !theme.isExtension ? `
        background: ${theme.background.regular};
    ` : ''}
`

const StyledNavigationContainer = styled(NavigationContainer)
    .attrs(({ theme })=>({
        theme: {
            dark: theme.dark,
            colors: {
                background: theme.background.alternative,
                border: theme.color.border,
                card: theme.background.regular,
                notification: theme.color.danger,
                primary: theme.color.accent,
                text: theme.text.regular
            }
        }
    }))``

export default function(props) {
    return (
        <RootWrap>
            {Platform.OS == 'android' && !props.independent ? (
                <>
                    <StatusBar />
                    <NavigationBar />
                </>
            ) : null}

            <StyledNavigationContainer {...props} />
        </RootWrap>
    )
}