import React from 'react'
import Splitview from 'co/navigation/splitview'

import { SpaceWrap } from './context'
import Home from './home'
import Browse from './browse'
import Search from './search'
import Preview from './preview'

export const getInitialState = (last_collection)=>{
    if (last_collection)
        return {
            routes: [{
                name: 'space',
                state: {
                    routes: [
                        { name: 'home' },
                        { name: 'browse', params: { spaceId: last_collection } },
                    ],
                },
            }]
        }
}

export default function Space(props) {
    const { route: { params={} } } = props

    return (
        <SpaceWrap>
            <Splitview.Navigator {...props}>
                <Splitview.Master name='home' component={Home} options={Home.options} />
                <Splitview.Detail name='browse' component={Browse} options={Browse.options} initialParams={{ spaceId: params.last_collection }} />
                <Splitview.Detail name='search' component={Search} options={Search.options} />
                <Splitview.Detail name='preview' component={Preview} options={Preview.options} />
            </Splitview.Navigator>
        </SpaceWrap>
    )
}