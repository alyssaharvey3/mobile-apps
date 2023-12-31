import t from 't'
import { PureComponent } from 'react';
import { PropTypes } from 'prop-types'
import withNavigation from 'co/navigation/withNavigation'
import { connect } from 'react-redux'
import { oneCreate, oneToggle } from 'data/actions/collections'

import { Wrap } from './style'
import View from './view'
import SearchBar, { knownHeight } from 'co/form/search'

const snapToOffsets = [0, knownHeight]
const contentOffset = {x:0, y: knownHeight}

class CollectionsItems extends PureComponent {
	static propTypes = {
		//customization
		options:			PropTypes.object,
		searchAutoFocus:	PropTypes.bool,
		searchPlaceholder:	PropTypes.string,
		searchOffset:		PropTypes.bool,
		onSearchFocus:		PropTypes.func,
		onSearchBlur:		PropTypes.func,
		//+all in ./view
	}

	static defaultProps = {
		searchAutoFocus: false,
		searchPlaceholder: t.s('defaultCollection-0'),
		options: {}
	}

	state = {
		options: this.props.options
	}

	componentDidUpdate(prevProps) {
		if (prevProps.options != this.props.options)
			this.setState({ options: this.props.options })
	}

	//Search
	onSearchChange = (search)=>{
		this.setState({
			options: {
				...this.state.options,
				search
			}
		})
	}

	onItemPress = item=>{
		if (item._id == -100){
			if (this._createNew)
				return

			this._createNew = true

			this.props.oneCreate(
				{
					title: this.state.options.search
				}, 
				(item)=>{
					this.props.onItemPress && this.props.onItemPress(item)
					this._createNew = false
				}, 
				()=>{
					this._createNew = false
				}
			)
			return
		}

		this.props.onItemPress && this.props.onItemPress(item)
	}

	renderSearch = ()=>(
		<SearchBar 
			value={this.state.options.search}
			placeholder={this.props.searchPlaceholder}
			autoFocus={this.props.searchAutoFocus}
			onChange={this.onSearchChange}
			onFocus={this.props.onSearchFocus}
			onBlur={this.props.onSearchBlur} />
	)

	render() {
		return (
			<Wrap disableVirtualization={this.props.disableVirtualization}>
				<View 
					{...this.props}
					snapToOffsets={this.props.searchOffset ? snapToOffsets : undefined}
					contentOffset={this.props.searchOffset ? contentOffset : undefined}
					onItemPress={this.onItemPress}
					treeProps={this.state}
					SearchComponent={typeof this.props.SearchComponent == 'undefined' ? this.renderSearch() : this.props.SearchComponent} />
			</Wrap>
		)
	}
}

export default connect(
	undefined,
	{ oneCreate, oneToggle }
)(withNavigation(CollectionsItems))