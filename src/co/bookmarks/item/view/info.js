import { View } from 'react-native'
import CollectionContainer from './collection'
import {
	styles,
	ItemTitle,
	ItemTags,
	ItemDescription,
	ItemSubinfo
} from 'co/style/item'
import { TypeIcon } from './style'
import { ShortDate, ShortDateTime } from 'modules/format/date'
import { getTypeIcon } from 'co/filters/item/useItemInfo'
import HighlighText from 'co/highlights/text'

const SpaceItemInfo = ({ item, highlights, spaceId, onCollectionPress, viewHide })=>{
	const { title, note, excerpt, type, tags, domain, broken, duplicate, important, collectionId, created, reminder } = item

	return (<>
		{!viewHide.includes('title') && (
			<ItemTitle 
				bold={true} 
				numberOfLines={3}>
				{title}
			</ItemTitle>
		)}

		{((note && !viewHide.includes('note')) || (excerpt && !viewHide.includes('excerpt'))) ? (
			<View style={styles.footer}>
				<ItemDescription numberOfLines={5}>
					{note || excerpt}
				</ItemDescription>
			</View>
		) : null}

		{!!tags && !viewHide.includes('tags') && (
			<View style={styles.footer}>
				<ItemTags numberOfLines={4}>
					{tags}
				</ItemTags>
			</View>
		)}

		{reminder?.date ? (
			<View style={styles.footer}>
				<TypeIcon name='notification-4' color='reminder' variant='fill' size={16} />
				<ItemSubinfo numberOfLines={1}><ShortDateTime date={reminder?.date} /></ItemSubinfo>
			</View>
		) : null}

		{!viewHide.includes('highlights') && highlights.map(h=>(
			<HighlighText key={h._id||'new'} color={h.color}>
				<ItemDescription numberOfLines={4}>
					{h.text}
				</ItemDescription>
			</HighlighText>
		))}

		{!viewHide.includes('info') && (
			<View style={styles.footer}>
				{!!important && <TypeIcon name='heart-3' color='important' variant='fill' size={16} />}
				{!!duplicate && <TypeIcon name='file-copy' color='duplicate' variant='fill' size={16}  />}
				{!!broken && <TypeIcon name='ghost' color='broken' variant='fill' size={16}  />}
				{type!='link' && <TypeIcon name={getTypeIcon(type)} variant='fill' size={16} />}
				<ItemSubinfo numberOfLines={1}>{domain}  ·  <ShortDate date={created} /></ItemSubinfo>
			</View>
		)}

		{!!(item._id && item.collectionId != spaceId) && (
			<View style={styles.footer} key='collectionPath'>
				<CollectionContainer collectionId={collectionId} onPress={onCollectionPress} />
			</View>
		)}
	</>)
}

export default SpaceItemInfo