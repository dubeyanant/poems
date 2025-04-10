import PoemEditor from "@/components/PoemEditor";

type PoemPageProps = Promise<{ id: string }>;

export default async function PoemPage(props: { params: PoemPageProps }) {
	const { id } = await props.params;
	return <PoemEditor poemIdFromRoute={id} />;
}
