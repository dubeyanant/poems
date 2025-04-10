import connectToDatabase from "@/lib/mongodb";
import type { Poem } from "@/types/poem";
import type { Collection } from "mongodb";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Define expected request body structure
interface RequestBody {
	line?: string;
}

export async function GET() {
	try {
		const { db } = await connectToDatabase();
		const poemsCollection: Collection<Poem> = db.collection("poems");

		// Get current date in DDMMYY format
		const now = new Date();
		const day = now.getDate().toString().padStart(2, "0");
		const month = (now.getMonth() + 1).toString().padStart(2, "0");
		const year = now.getFullYear().toString().slice(-2);
		const todayId = `${day}${month}${year}`;

		// Try to find today's poem first
		let poem = await poemsCollection.findOne({ _id: todayId });

		// If no poem exists for today, get the latest poem
		if (!poem) {
			// Sort IDs in descending order to get the most recent one
			const poems = await poemsCollection
				.find()
				.sort({ _id: -1 })
				.limit(1)
				.toArray();

			if (poems && poems.length > 0) {
				poem = poems[0];
			}
		}

		if (!poem) {
			return NextResponse.json(
				{ message: "No poems found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(poem, { status: 200 });

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
				{ status: 400 },
			);
		}

		// 2. Validate Word Count (max 10 words)
		const words = line.trim().split(/\s+/);
		if (words.length > 10) {
			return NextResponse.json(
				{
					message: `Input line has ${words.length} words. Maximum allowed is 10.`,
				},
				{ status: 400 },
			);
		}

		// 3. Get current date in DDMMYY format
		const now = new Date();
		const day = now.getDate().toString().padStart(2, "0");
		const month = (now.getMonth() + 1).toString().padStart(2, "0");
		const year = now.getFullYear().toString().slice(-2);
		const todayId = `${day}${month}${year}`;

		// 4. Find the Latest Poem
		let latestPoem = await poemsCollection.findOne({ _id: todayId });

		if (!latestPoem) {
			// If no poem exists for today, get the most recent poem
			const poems = await poemsCollection
				.find()
				.sort({ _id: -1 })
				.limit(1)
				.toArray();

			if (poems && poems.length > 0) {
				latestPoem = poems[0];
			} else {
				return NextResponse.json(
					{ message: "No poems found in the database to update." },
					{ status: 404 },
				);
			}
		}

		// 5. Update the Poem
		const updateResult = await poemsCollection.updateOne(
			{ _id: latestPoem._id },
			{ $push: { lines: line } },
		);

		if (updateResult.modifiedCount !== 1) {
			console.error(
				"Failed to update the poem. Document might not exist or was not modified.",
				updateResult,
			);
			return NextResponse.json(
				{ message: "Failed to append line to the latest poem." },
				{ status: 500 },
			);
		}

		// 6. Fetch the updated document
		const updatedPoem = await poemsCollection.findOne({
			_id: latestPoem._id,
		});

		if (!updatedPoem) {
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

		return NextResponse.json(updatedPoem, { status: 200 });

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (error: any) {
		console.error("Failed to process request:", error);
		return NextResponse.json(
			{ message: "Failed to process request", error: error.message },
			{ status: 500 },
		);
	}
}
