import t from 't'
import React from 'react'
import { connect } from 'react-redux'
import { refresh, groupRemove, groupToggle, oneToggle, changeDefaults } from 'data/actions/collections'
import { makeTreeFlat, makeCollectionsStatus } from 'data/selectors/collections'

import Shadow from 'co/list/helpers/shadow'
import ItemContainer from 'co/collections/item'
import GroupContainer from 'co/collections/group'
import Empty from './empty'

//size
import FlatList from 'co/list/flat/basic'
import { getListViewParams } from 'modules/view'
import size from 'modules/appearance/size'
import { Footer } from './style'

class TreeItems extends React.PureComponent {
	listViewParams = getListViewParams(size.height.item)
	list = React.createRef()

	componentDidMount() {
		this.props.changeDefaults({
			items: [
				{_id: 0, title: t.s('allBookmarks')},
				{_id: -1, title: t.s('defaultCollection--1')},
				{_id: -99, title: t.s('defaultCollection--99')}//, color: '#8791A1'
			],
			groupTitle: t.s('myCollections')
		})
		this.props.refresh()
	}

	//scrolling
	componentDidUpdate() {
		//scroll to active on first paint
        if (this.props.data.length && !this._scrolled){
            this._scrolled = true

            if (this.props.activeId && typeof this.props.activeId != 'object')
                this.scrollToId(this.props.activeId)
        }
	}

	scrollToId = (id)=> {
		if (!this.list.current) return

		this.list.current.scrollToIndex(
			this.props.data
                .findIndex(({item})=>item && item._id == id)
		)
	}

	onScrollToIndexFailed = ()=>{}

	//items itself
	getItemLayout = (data, index) => ({
		length: size.height.item, 
		offset: size.height.item * index, 
		index
	})

	renderItem = ({ item: row })=>{
		switch (row.type) {
			case 'collection':
				return (
					<ItemContainer
						{...row}
						selected={this.props.selectedId == row.item._id}
						onItemTap={this.props.onItemTap}
						onSystemDrop={this.props.onSystemDrop}
						onToggle={this.props.oneToggle}
						navigation={this.props.navigation} />
				)
		
			case 'group':
				return (
					<GroupContainer 
						{...row}
						selectable={this.props.groupSelectable}
						selected={this.props.groupSelectable && (this.props.selectedId == row._id)}
						navigation={this.props.navigation}
						onItemTap={this.props.onItemTap}
						groupToggle={this.props.groupToggle}
						groupRemove={this.props.groupRemove} />
				)
		}
	}

	keyExtractor = ({ _id, item })=>
		_id || String(item._id)

	render() {
		const { data, showEmptyState, status, SearchComponent } = this.props

		if (showEmptyState && status=='empty')
			return <Empty {...this.props} />

		return (
			<Shadow>{onScroll=>
				<FlatList
					{...this.listViewParams}

					ref={this.list}
					data={data}
					keyExtractor={this.keyExtractor}
					getItemLayout={this.getItemLayout}
					
					renderItem={this.renderItem}
					ListHeaderComponent={SearchComponent}
					ListFooterComponent={Footer}

					refreshing={false}
					onRefresh={this.props.refresh}
					onScroll={onScroll}
					onScrollToIndexFailed={this.onScrollToIndexFailed} />
			}</Shadow>
		)
	}
}

export default connect(
	() => {
		const getTree = makeTreeFlat()
		const getCollectionsStatus = makeCollectionsStatus()
	
		return (state, props)=>{
			const status = getCollectionsStatus(state)
	
			return {
				data: getTree(state, props.treeProps),
				status
			}
		}
	},
	{ refresh, groupRemove, groupToggle, oneToggle, changeDefaults }
)(TreeItems)