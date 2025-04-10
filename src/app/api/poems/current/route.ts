import connectToDatabase from "@/lib/mongodb"; // Adjust path if needed
import type { Collection, ObjectId } from "mongodb";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Define an interface for your Poem data structure
interface Poem {
	_id: ObjectId; // MongoDB always adds this
	date: Date;
	lines: string[];
}

// Define expected request body structure
interface RequestBody {
	line?: string;
}

export async function GET(request: NextRequest) {
	try {
		const { db } = await connectToDatabase();
		const poemsCollection: Collection<Poem> = db.collection("poems");

		// Find the latest poem by sorting by date descending and taking the first one
		const latestPoem = await poemsCollection.findOne(
			{}, // No filter needed
			{ sort: { date: -1 } }, // Sort by date descending
		);

		if (!latestPoem) {
			return NextResponse.json(
				{ message: "No poems found" },
				{ status: 404 },
			);
		}

		// Return the found poem
		return NextResponse.json(latestPoem, { status: 200 });

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (error: any) {
		console.error("Failed to fetch latest poem:", error);
		return NextResponse.json(
			{ message: "Failed to fetch latest poem", error: error.message },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { db } = await connectToDatabase();
		const poemsCollection: Collection<Poem> = db.collection("poems");

		// 1. Parse and Validate Request Body
		let body: RequestBody;
		try {
			body = await request.json();
		} catch (error) {
			console.error("Failed to parse JSON body:", error);
			return NextResponse.json(
				{ message: "Invalid JSON body" },
				{ status: 400 },
			);
		}

		const { line } = body;

		if (!line || typeof line !== "string" || line.trim() === "") {
			return NextResponse.json(
				{
					message:
						'Missing or invalid "line" field in request body. It must be a non-empty string.',
				},
				{ status: 400 }, // Bad Request
			);
		}

		// 2. Validate Word Count (max 10 words)
		// Trim whitespace from ends and split by one or more whitespace characters
		const words = line.trim().split(/\s+/);
		if (words.length > 10) {
			return NextResponse.json(
				{
					message: `Input line has ${words.length} words. Maximum allowed is 10.`,
				},
				{ status: 400 }, // Bad Request
			);
		}

		// 3. Find the Latest Poem
		// Sort by 'date' in descending order (-1) and get the first one
		const latestPoem = await poemsCollection.findOne(
			{}, // No filter, find any document
			{ sort: { date: -1 } }, // Sort by date descending
		);

		if (!latestPoem) {
			return NextResponse.json(
				{ message: "No poems found in the database to update." },
				{ status: 404 }, // Not Found
			);
		}

		// 4. Update the Latest Poem
		// Use the $push operator to append the new line to the 'lines' array
		const updateResult = await poemsCollection.updateOne(
			{ _id: latestPoem._id }, // Filter by the ID of the latest poem
			{ $push: { lines: line } }, // Append the validated line to the 'lines' array
		);

		if (updateResult.modifiedCount !== 1) {
			// This might happen if the document was deleted between findOne and updateOne (rare)
			console.error(
				"Failed to update the poem. Document might not exist or was not modified.",
				updateResult,
			);
			return NextResponse.json(
				{ message: "Failed to append line to the latest poem." },
				{ status: 500 }, // Internal Server Error
			);
		}

		// 5. Fetch the updated document to return it (optional, but good practice)
		const updatedPoem = await poemsCollection.findOne({
			_id: latestPoem._id,
		});

		if (!updatedPoem) {
			// Should technically not happen if updateResult.modifiedCount was 1
			console.error(
				"Failed to retrieve the updated poem after successful update.",
			);
			return NextResponse.json(
				{
					message:
						"Line added, but failed to retrieve updated poem data.",
				},
				{ status: 500 },
			);
		}

		console.log(`Line added to poem ${updatedPoem._id}: "${line}"`);

		// 6. Return Success Response
		return NextResponse.json(updatedPoem, { status: 200 }); // OK

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (error: any) {
		console.error("Failed to process request:", error);
		// Return a generic error response
		return NextResponse.json(
			{ message: "Failed to process request", error: error.message },
			{ status: 500 }, // Internal Server Error
		);
	}
}
