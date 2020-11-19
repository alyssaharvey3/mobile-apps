import React from 'react'
import PropTypes from 'prop-types'
import { openURL } from 'modules/browser'
import { Share } from 'react-native'
import t from 't'
import {Alert} from 'react-native'
import getCacheURL from 'data/modules/format/cache_url'
import Clipboard from '@react-native-community/clipboard'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as bookmarksActions from 'data/actions/bookmarks'
import { makeDraftItem, makeDraftStatus } from 'data/selectors/bookmarks'

import Form from './form'
import Error from 'co/common/alert/error'
import LoadingView from 'co/common/loadingView'
import RemovedBookmark from './removed'

class EditBookmarkContainer extends React.Component {
	static propTypes = {
		route:  PropTypes.shape({
            params: PropTypes.shape({
				_id: 			PropTypes.number,
				spaceId:		PropTypes.any,
				onClose:		PropTypes.func,
			})
		})
	}

	static options = {
		title: t.s('bookmark'),
		headerStyle: {
			elevation: 0,
			shadowOpacity: 0
		}
	}

	componentDidMount() {
		this.props.actions.bookmarks.draftLoad(this.props.route.params._id)	
	}

	componentWillUnmount() {
		this.onSubmit()
	}

	closeScreen = async()=>{
		await this.onSubmit()

		if (this.props.onClose)
			return this.props.onClose()
			
		this.props.navigation.goBack()
	}

	componentDidUpdate(prevProps) {
		const { status, item } = this.props

		if (status != prevProps.status || item.type != prevProps.item.type) {
			if (status == 'errorSaving')
				Alert.alert(t.s('saveError'))
		}
	}

	onChange = (obj)=>{
		this.props.actions.bookmarks.draftChange(this.props.item._id, obj)
	}

	onSubmit = ()=>{
		return new Promise((res,rej)=>{
			this.props.actions.bookmarks.draftCommit(
				this.props.item._id,
				res,
				rej
			)
		})
	}

	onSelect = ()=>{
		this.props.actions.bookmarks.selectOne(this.props.route.params.spaceId, this.props.item._id)
		this.props.navigation.goBack()
	}

	onShare = ()=>
		Share.share({
			message: this.props.item.link,
			url: this.props.item.link,
		})

	onCopyLink = ()=>
		Clipboard.setString(this.props.item.link)

	onOpenCache = async()=>{
		const link = await getCacheURL(this.props.item._id)

		if (link)
			openURL({ link, fromBottom: true })
	}

	onRemove = ()=>{
		this.props.actions.bookmarks.oneRemove(this.props.item._id)
		this.closeScreen()
	}

	onRecover = ()=>{
		this.props.actions.bookmarks.oneRecover(this.props.item._id)
	}

	render() {
		const { status, item, route:{ params={} } } = this.props
		const loading = (status=='loading'||status=='saving')

		switch(status){
			case 'error':
				return <Error />

			case 'removed':
				return (
					<RemovedBookmark 
						type={item.type}
						onRecover={this.onRecover}
						onRemove={this.onRemove} />
				)

			default:
				return (
					<LoadingView 
						loading={loading} 
						pointerEvents={loading ? 'none' : 'auto'}>
						<Form 
							{...this.props}
							{...params}

							onChange={this.onChange}
							onSubmit={this.onSubmit}
							onSelect={this.onSelect}
							onOpenCache={this.onOpenCache}
							onShare={this.onShare}
							onCopyLink={this.onCopyLink}
							onRemove={this.onRemove} />
					</LoadingView>
				)
		}
	}
}

const makeMapStateToProps = () => {
	const 
		getDraftItem = makeDraftItem(),
		getDraftStatus = makeDraftStatus()

	const mapStateToProps = (state, { route: { params={} } })=>{
		const item = getDraftItem(state, params._id)
		
		return {
			status: getDraftStatus(state, params._id),
			item
		}
	}

	return mapStateToProps
}

export default connect(
	makeMapStateToProps,
	(dispatch)=>({
		actions: {
			bookmarks: bindActionCreators(bookmarksActions, dispatch)
		}
	})
)(EditBookmarkContainer)