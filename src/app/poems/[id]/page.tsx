import PoemEditor from "@/components/PoemEditor";

interface PoemPageProps {
	params: {
		id: string;
	};
}

export default function PoemPage({ params }: PoemPageProps) {
	const { id } = params;

	// Basic validation for the ID format if needed, or let the API/component handle it
	// if (!/^\d{6}$/.test(id)) {
	//   // Handle invalid ID format, maybe show a not found page or error
	//   return <div>Invalid Poem ID format.</div>;
	// }

	return <PoemEditor poemIdFromRoute={id} />;
}
