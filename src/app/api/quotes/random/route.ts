import connectToDatabase from "@/lib/mongodb"; // Adjust path if needed
import type { Collection, Document, ObjectId } from "mongodb"; // Import Document type
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define an interface for your Quote data structure
interface Quote extends Document {
	// Extend Document to include potential _id etc.
	_id: ObjectId;
	quote: string;
	author: string;
}

export async function GET(request: NextRequest) {
	try {
		const { db } = await connectToDatabase();
		// Ensure you use the correct collection name specified: 'quotes'
		const quotesCollection: Collection<Quote> = db.collection("quotes");

		// Use the MongoDB aggregation pipeline with $sample to get 1 random document.
		// This is generally the most efficient way to get random documents.
		const pipeline = [
			{ $sample: { size: 1 } }, // $sample stage randomly selects documents
		];

		// Execute the aggregation pipeline
		const randomQuotes = await quotesCollection
			.aggregate<Quote>(pipeline)
			.toArray();

		// Check if a random quote was found
		if (randomQuotes.length > 0) {
			const randomQuote = randomQuotes[0];
			console.log("Random quote fetched:", randomQuote);
			return NextResponse.json(randomQuote, { status: 200 }); // OK
		}

		// This happens if the 'quotes' collection is empty
		console.log("No quotes found in the collection.");
		return NextResponse.json(
			{ message: "No quotes found in the collection." },
			{ status: 404 },
		); // Not Found

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (error: any) {
		console.error("Failed to fetch random quote:", error);
		return NextResponse.json(
			{ message: "Failed to fetch random quote", error: error.message },
			{ status: 500 }, // Internal Server Error
		);
	}
}
