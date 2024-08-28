import { describe, expect, test } from '@jest/globals';
import { getHumanDate, isSameDate, isSameHumanDate } from '../src/datetime';

describe("getHumanDate test", () => {
	test("2024/8/27 03:00", () => {
		expect(getHumanDate(new Date("2024/8/27 03:00")).toISOString())
			.toBe(new Date("2024/8/27 03:00").toISOString())
	})
	test("2024/8/27 02:59", () => {
		expect(getHumanDate(new Date("2024/8/27 02:59")).toISOString())
			.toBe(new Date("2024/8/26 23:59").toISOString())
	})
	test("2024/8/27 12:00", () => {
		expect(getHumanDate(new Date("2024/8/27 12:00")).toISOString())
			.toBe(new Date("2024/8/27 12:00").toISOString())
	})
});

describe("isSameDate test", () => {
	const isSameTest = (rawA: string, rawB: string, expectation: boolean) => {
		const a = new Date(rawA);
		const b = new Date(rawB);
		test(`"${a.toISOString()}" and "${b.toISOString()}"`, () => {
			expect(isSameDate(a, b)).toBe(expectation);
		});
	};

	isSameTest("2024/8/28 1:00", "2024/8/28 12:00", true);
	isSameTest("2024/8/28 12:00", "2024/8/28 12:00", true);
	isSameTest("2024/8/27 12:00", "2024/8/28 12:00", false);
})


describe("isSameHumanDate test", () => {
	const isSameTest = (rawA: string, rawB: string, expectation: boolean) => {
		const a = new Date(rawA);
		const b = new Date(rawB);
		test(`"${a.toISOString()}" and "${b.toISOString()}"`, () => {
			expect(isSameHumanDate(a, b)).toBe(expectation);
		});
	};

	isSameTest("2024/8/28 1:00", "2024/8/28 12:00", false);
	isSameTest("2024/8/28 12:00", "2024/8/28 12:00", true);
	isSameTest("2024/8/27 12:00", "2024/8/28 12:00", false);
	isSameTest("2024/8/28 02:00", "2024/8/29 02:00", false);
	isSameTest("2024/8/28 1:00", "2024/8/27 12:00", true);
})
