import { vi } from "vitest";

vi.mock("mongoose", async () => {
	const actual = await vi.importActual("mongoose");
	return {
		...actual,
		connect: vi.fn().mockResolvedValue(undefined),
		disconnect: vi.fn().mockResolvedValue(undefined),
	};
});
