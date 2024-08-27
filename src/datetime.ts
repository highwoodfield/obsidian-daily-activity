
const DAY_CHANGE_HOUR = 3;
/**
 * Returns the datetime which a person, who is staying up late, is likely to recognize the actual datetime as.
 * 
 * For example, when the actual datetime is 28 Aug 2024 01:23, the person is likely to recognize the date as 27 Aug 2024. This function will return 27 Aug 2024 23:59 in this case.
 * 
 * @param actualDate actual date
 */
export function getHumanDate(actualDate: Date): Date {
	const humanDate = new Date(actualDate);
	const aHrs = actualDate.getHours();
	if (aHrs < DAY_CHANGE_HOUR) {
		humanDate.setDate(actualDate.getDate() - 1);
		humanDate.setHours(23);
		humanDate.setMinutes(59);
	}
	return humanDate;
}

export function isSameDate(a: Date, b: Date): boolean {
	return a.getFullYear() === b.getFullYear()
		&& a.getMonth() === b.getMonth()
		&& a.getDate() === b.getDate();
}

export function isHumanToday(date: Date) {
	return isSameDate(getHumanDate(new Date()), date);
}
