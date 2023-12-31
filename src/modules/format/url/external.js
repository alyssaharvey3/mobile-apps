export default async function external(link) {
    if (!link.includes('raindrop.io'))
        return link

    const res = await fetch(link, {
        credentials: 'include',
        redirect: 'manual'
    })
    res.body && await res.body.cancel('ignore')
    return res.url
}