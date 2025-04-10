import connectToDatabase from "@/lib/mongodb";
import type { Poem } from "@/types/poem";
import type { Collection } from "mongodb";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const id = (await params).id;

	// Validate ID format (DDMMYY = 6 digits)
	if (!id || !/^\d{6}$/.test(id)) {
		return NextResponse.json(
			{ message: "Invalid poem ID format. Expected DDMMYY (6 digits)." },
			{ status: 400 },
		);
	}

	try {
		const { db } = await connectToDatabase();
		const poemsCollection: Collection<Poem> = db.collection("poems");

		// Find the poem by its _id (now a string)
		const poem = await poemsCollection.findOne({ _id: id });

		if (!poem) {
			return NextResponse.json(
				{ message: `Poem with ID ${id} not found.` },
				{ status: 404 },
			);
		}

		// Return the found poem
		return NextResponse.json(poem, { status: 200 });

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (error: any) {
		console.error(`Failed to fetch poem with ID ${id}:`, error);
		return NextResponse.json(
			{
				message: `Failed to fetch poem with ID ${id}`,
				error: error.message,
			},
			{ status: 500 },
		);
	}
}
