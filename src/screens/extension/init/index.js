import React from 'react'
import Navigation from 'modules/navigation'
import { data, close, stackId } from 'modules/extension'

import View from './view'
import URL from './url'
import NotSupported from './notSupported'

export default class ExtensionInit extends React.PureComponent {
    state = {
        type: 'loading'
    }
    
    async componentDidMount() {
        try{
            const { type, value } = await data()
            this.setState({ type: type||'', value: value||'' })
        } catch (e) {
            this.setState({
                type: 'error',
                value: e.message.toString()
            })
        }
    }

    onNew = ()=>{
        Navigation.setStackRoot(stackId, {
            component: {
                name: 'collections/picker',
                passProps: {
                    isModal: true,
                    hideIds: [-99],
                    onSelect: this.onSave,
                    onClose: close
                }
            }
        })
    }

    onEdit = (_id)=>{
        Navigation.setStackRoot(stackId, {
            component: {
                name: 'bookmark/edit',
                passProps: {
                    _id,
                    isModal: true,
                    onClose: close
                }
            }
        })
    }

    onSave = (collectionId)=>{
        Navigation.setStackRoot(stackId, {
            component: {
                name: 'extension/save',
                passProps: {
                    ...this.state,
                    collectionId
                }
            }
        })

        return true //important
    }

    onClose = ()=>close()

    render() {
        switch(this.state.type) {
            case 'loading':
                return (
                    <View 
                        onClose={this.onClose} />
                )

            case 'url':
                return (
                    <URL 
                        {...this.state}
                        onNew={this.onNew}
                        onEdit={this.onEdit}
                        onClose={this.onClose} />
                )

            default:
                return (
                    <NotSupported
                        {...this.state}
                        onClose={this.onClose} />
                )
        }
    }
}