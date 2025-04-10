import connectToDatabase from "@/lib/mongodb"; // Adjust path if needed
import type { Poem } from "@/types/poem"; // Import the shared interface
import type { Collection } from "mongodb";
import { ObjectId } from "mongodb";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const id = (await params).id;

	// Validate the ID format before querying
	if (!id || !ObjectId.isValid(id)) {
		return NextResponse.json(
			{ message: "Invalid poem ID format." },
			{ status: 400 }, // Bad Request
		);
	}

	try {
		const { db } = await connectToDatabase();
		const poemsCollection: Collection<Poem> = db.collection("poems");

		// Find the poem by its _id
		// Important: Convert the string ID from params into a MongoDB ObjectId
		const poem = await poemsCollection.findOne({ _id: new ObjectId(id) });

		if (!poem) {
			return NextResponse.json(
				{ message: `Poem with ID ${id} not found.` },
				{ status: 404 }, // Not Found
			);
		}

		// Return the found poem
		return NextResponse.json(poem, { status: 200 }); // OK

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (error: any) {
		console.error(`Failed to fetch poem with ID ${id}:`, error);
		return NextResponse.json(
			{
				message: `Failed to fetch poem with ID ${id}`,
				error: error.message,
			},
			{ status: 500 }, // Internal Server Error
		);
	}
}
