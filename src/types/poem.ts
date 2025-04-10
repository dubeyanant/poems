export interface Poem {
	_id: string;
	lines: string[];
}

export interface QuoteResponse {
	quote: string;
	author: string;
}

export interface AddLineRequest {
	line: string;
}
