import { Component } from 'react';
import { connect } from 'react-redux'
import { status, count as getCount } from 'data/selectors/bookmarks'

import View from './view'

class SpaceFooterContainer extends Component {
	onNextPage = ()=>{
		this.props.nextPage(this.props.spaceId)
	}

	render() {
		return View({
			status: this.props.status,
			count: this.props.count,
			onNextPage: this.onNextPage
		})
	}
}

const makeMapStateToProps = () => {
	const mapStateToProps = (state, {spaceId})=>{
		return {
			status: status(state, spaceId),
			count:	getCount(state, spaceId)
		}
	}

	return mapStateToProps
}

export default connect(
	makeMapStateToProps,
	{
		nextPage: require('data/actions/bookmarks').nextPage
	}
)(SpaceFooterContainer)