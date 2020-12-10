import React from 'react'
import { AppState } from 'react-native'
import Shadow from 'co/list/helpers/shadow'
import { SPACE_PER_PAGE } from 'data/constants/bookmarks'

import Header from '../header'
import Footer from '../footer'
import EmptyState from './empty'
import { List } from './style'
import Item from '../item'

export default class SpaceItems extends React.PureComponent {
	state = {
		topVisible: true
	}

	_needRefresh = false

	componentDidMount() {
		AppState.addEventListener('change', this.onAppStateChange)
	}

	componentWillUnmount() {
		AppState.removeEventListener('change')
	}

	onAppStateChange = (state)=>{
		if (state == 'active' && this.state.topVisible)
			this.props.onRefresh()
	}

	keyExtractor = (item) => item.toString()

	renderItem = ({ item })=>(
		<Item
			key={item}
			bookmarkId={item}
			spaceId={this.props.spaceId}
			view={this.props.collection.view}
			showActions={this.props.collection.access.level>=3}
			numColumns={this.props.numColumns}
			viewHide={this.props.viewHide}
			listCoverRight={this.props.listCoverRight}
			onCollectionPress={this.props.onCollectionPress}
			navigation={this.props.navigation} />
	)

	ListHeaderComponent = ()=>(
		<>
			{this.props.header ? (typeof this.props.header == 'function' ? this.props.header() : this.props.header) : null}
			
			<Header 
				spaceId={this.props.spaceId}
				navigation={this.props.navigation} />
		</>
	)

	ListFooterComponent = ()=>(
		<Footer spaceId={this.props.spaceId} />
	)

	ListEmptyComponent = ()=>(
		<EmptyState 
			spaceId={this.props.spaceId}
			navigation={this.props.navigation} />
	)

	onRefresh = ()=>{
		this._needRefresh=true;
		this.props.onRefresh()
	}

	onEndReached = ()=>{
		if (this.props.data.length)
			this.props.onNextPage()
	}

	onViewableItemsChanged = ({ viewableItems })=>{
		const topVisible = (viewableItems[viewableItems.length-1].index < SPACE_PER_PAGE)
		if (topVisible != this.state.topVisible)
			this.setState({ topVisible })
	}

	isRefreshing = ()=>
		this.props.status=='idle' || this.props.status=='loading'

	render() {
		return (
			<Shadow>{onScroll=>
				<List
					{...this.listViewParams}
					
					key={this.props.numColumns}
					data={this.props.data}
					keyExtractor={this.keyExtractor}

					renderItem={this.renderItem}
					ListHeaderComponent={this.ListHeaderComponent}
					ListFooterComponent={this.ListFooterComponent}
					ListEmptyComponent={this.ListEmptyComponent}
					
					numColumns={this.props.numColumns}
					refreshing={this._needRefresh && this.isRefreshing()}
					
					onRefresh={this.onRefresh}
					onEndReached={this.onEndReached}
					onViewableItemsChanged={this.onViewableItemsChanged}
					onScroll={onScroll} />
			}</Shadow>
		)
	}
}