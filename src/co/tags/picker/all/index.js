import { Component } from 'react';
import { connect } from 'react-redux'
import { load } from 'data/actions/filters'
import { makeTagsAutocomplete } from 'data/selectors/tags'

import FlatList from 'co/list/flat/basic'
import { getListViewParams } from 'modules/view'
import size from 'modules/appearance/size'
import Tag from 'co/tags/item'
import Section from './section'
import Header from './header'
import Empty from './empty'

class TagsAll extends Component {
	listViewParams = getListViewParams(size.height.item)

    componentDidMount() {
		this.props.load(this.props.spaceId || 'global')
	}

	keyExtractor = ({ _id })=>_id

	header = ()=> <Header {...this.props} />

	empty = ()=> <Empty {...this.props} />

	renderItem = ({ item })=>{
		switch(item.type) {
			case 'section':
				return <Section {...item} />

			default:
				return (
					<Tag 
						{...item}
						selected={this.props.selected.includes(item._id)}
						swipeEnabled={false}
						onItemPress={this.props.onToggle}
						onEdit={this.props.onEdit} />
				)
		}
	}

    render() {
		const { tags } = this.props

        return (
			<FlatList 
				{...this.listViewParams}
				data={tags}
				keyExtractor={this.keyExtractor}
				renderItem={this.renderItem}
				ListHeaderComponent={this.header}
				ListEmptyComponent={this.empty} />
        )
    }
}

export default connect(
    () => {
        const getTagsAutocomplete = makeTagsAutocomplete()
    
        return (state, { spaceId='global', value }) => ({
            tags: getTagsAutocomplete(state, spaceId, value),
        })
    },
	{ load }
)(TagsAll)