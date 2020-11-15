import React from 'react'
import DropView from 'co/common/ipad/DropView'
import Items from './view'
import SelectMode from '../selectMode'
import withNavigation from 'co/navigation/withNavigation'
import { Wrap } from './style'

import { connect } from 'react-redux'
import { collection } from 'data/selectors/collections'
import {
	makeBookmarksIds,
	makeBookmarksWithSections,
	makeBookmarksWithSectionsBlocked,
	makeStatus,
	makeSort
} from 'data/selectors/bookmarks'

const wrapStyle = {flex:1}

class SpaceContainer extends React.Component {
	static defaultProps = {
		spaceId: 0,
		header: undefined,

		onSystemDrop: undefined
	}

	onRefresh = ()=>{
		this.props.refresh(this.props.spaceId)
	}

	onNextPage = ()=>{
		this.props.nextPage(this.props.spaceId)
	}

	render() {
		return (
			<>
				<Wrap>
					<DropView onDrop={this.props.onSystemDrop} style={wrapStyle}>
						<Items 
							{...this.props}
							onRefresh={this.onRefresh}
							onNextPage={this.onNextPage} />
					</DropView>
				</Wrap>

				<SelectMode 
					spaceId={this.props.spaceId}
					navigation={this.props.navigation} />
			</>
		)
	}
}

export default connect(
	() => {
		const 
			getIds = makeBookmarksIds(),
			getSections = makeBookmarksWithSections(),
			getSectionsBlocked = makeBookmarksWithSectionsBlocked(),
			getStatus = makeStatus(),
			getSort = makeSort()
	
		return (state, {spaceId})=>{
			const currentCollection = collection(state, parseInt(spaceId))
			const sort = getSort(state, spaceId)

			let data
			let flat = false

			switch(currentCollection.view){
				//todo: support grid/masonry layout for non-section list
				case 'grid':
				case 'masonry':
					data = getSectionsBlocked(state, spaceId)
				break
	
				default:
					if (sort.endsWith('sort')){
						data = getIds(state, spaceId)
						flat = true
					}
					else
						data = getSections(state, spaceId)
				break
			}
			
			return {
				status: 			getStatus(state, spaceId).main,
				collection: 		currentCollection,
				data,
				flat
			}
		}
	},
	{
		refresh: require('data/actions/bookmarks').refresh,
		nextPage: require('data/actions/bookmarks').nextPage
	}
)(withNavigation(SpaceContainer))