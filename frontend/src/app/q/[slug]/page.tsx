export async function generateStaticParams() {
    const res = await fetch('https://pmp-test.celestialstudio.net/api/question').then(res => res.json());
    return res.data.map((r:{id:number})=>({ slug: r.id.toString() }));
}

export default function Page({ params }: { params: { slug: string } }) {
    return <h1>Hello, Blog Post Page! {params.slug}</h1>
}