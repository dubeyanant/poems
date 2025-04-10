import type { AddLineRequest, Poem, QuoteResponse } from "@/types/poem";

// Base URL for the API (can be configured or moved to environment variables)
const API_BASE_URL = "/api"; // Assuming the API is served from the same origin

/**
 * Fetches a random quote.
 * @returns A promise that resolves to the quote data.
 */
export async function getRandomQuote(): Promise<QuoteResponse> {
	const response = await fetch(`${API_BASE_URL}/quotes/random`);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data: QuoteResponse = await response.json();
	return data;
}

/**
 * Fetches the current poem.
 * @returns A promise that resolves to the current poem data.
 */
export async function getCurrentPoem(): Promise<Poem> {
	const response = await fetch(`${API_BASE_URL}/poems/current`);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data: Poem = await response.json();
	return data;
}

/**
 * Fetches a poem by its ID.
 * @param id - The ID of the poem to fetch.
 * @returns A promise that resolves to the poem data.
 */
export async function getPoemById(id: string): Promise<Poem> {
	const response = await fetch(`${API_BASE_URL}/poems/${id}`); // Corrected path to include id
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data: Poem = await response.json();
	return data;
}

/**
 * Adds a line to the current poem.
 * @param line - The line to add to the poem.
 * @returns A promise that resolves to the updated poem data.
 */
export async function addLineToCurrentPoem(line: string): Promise<Poem> {
	const requestBody: AddLineRequest = { line };
	const response = await fetch(`${API_BASE_URL}/poems/current`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(requestBody),
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data: Poem = await response.json();
	return data;
}
