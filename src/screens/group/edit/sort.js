import t from 't'
import { PureComponent } from 'react';
import { connect } from 'react-redux'
import { reorder } from 'data/actions/collections'

import Goto from 'co/goto'

class EditGroupSort extends PureComponent {
	onSortPress = ()=>{
		this.props.reorder('title')
		this.props.navigation.goBack()
	}

	render() {
		return (
            <Goto
				label={`${t.s('sortMin')} ${t.s('collectionsCount')} ${t.s('byName').toLowerCase()}`}
				icon='sort-desc'
                onPress={this.onSortPress} />
		)
	}
}

export default connect(
	undefined,
	{ reorder }
)(EditGroupSort)