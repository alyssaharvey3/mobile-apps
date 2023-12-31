import Stack, { screenOptions } from 'co/navigation/stack'
import Tint from 'co/collections/item/tint'

import Edit from './edit'
import Add from './add'
import Remove from './remove'
import Cover from './cover'
import Sort from './sort'
import View from './view'
import Path from './path'
import Sharing from './sharing/home'
import SharingAdd from './sharing/add'
import SharingEdit from './sharing/edit'

export default function Collection({ route: { params={} } }) {
    return (
        <Tint _id={params.params ? params.params._id : params._id}>
            <Stack.Navigator screenOptions={screenOptions}>
                <Stack.Screen name='edit' component={Edit} options={Edit.options} initialParams={params} />
                
                <Stack.Screen name='add' component={Add} options={Add.options} />
                <Stack.Screen name='remove' component={Remove} options={Remove.options} />
                <Stack.Screen name='cover' component={Cover} options={Cover.options} />
                <Stack.Screen name='path' component={Path} options={Path.options} />
                
                <Stack.Screen name='sort' component={Sort} options={Sort.options} />
                <Stack.Screen name='view' component={View} options={View.options} />

                <Stack.Screen name='sharing' component={Sharing} options={Sharing.options} />
                <Stack.Screen name='sharing/add' component={SharingAdd} options={SharingAdd.options} />
                <Stack.Screen name='sharing/edit' component={SharingEdit} options={SharingEdit.options} />
            </Stack.Navigator>
        </Tint>
    )
}