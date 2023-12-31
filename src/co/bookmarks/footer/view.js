import t from 't'
import { ActivityIndicator } from 'co/native'
import { FooterView } from './style'
import Button from 'co/button'

const SpaceFooter = ({status, count, onNextPage})=>{
	var content;

	switch(status.nextPage){
		case 'error': content = <Button onPress={onNextPage} title={t.s('tryAgain')} />; break;
		case 'noMore': content = null; break
		default:
			if (count>0 || status=='loading')
				content = <ActivityIndicator />;
		break;
	}

	return (
		<FooterView line={count?true:false}>
			{content}
		</FooterView>
	)
}

export default SpaceFooter