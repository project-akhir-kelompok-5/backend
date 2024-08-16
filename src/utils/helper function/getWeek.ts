export function getWeekRange(month: string, week: number): [Date, Date] {
  const year = new Date().getFullYear();
  const startOfMonth = new Date(
    year,
    new Date(Date.parse(`${month} 1, ${year}`)).getMonth(),
    1,
  );

  const startOfWeek = new Date(startOfMonth);
  startOfWeek.setDate((week - 1) * 7 + 1);

  // Ensure endOfWeek does not exceed the last day of the month
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  // Adjust endOfWeek if it goes beyond the last day of the month
  const lastDayOfMonth = new Date(
    year,
    startOfMonth.getMonth() + 1,
    0,
  ).getDate();
  if (endOfWeek.getDate() > lastDayOfMonth) {
    endOfWeek.setDate(lastDayOfMonth);
  }

  console.log('Calculated Week Range:', startOfWeek, endOfWeek);

  return [startOfWeek, endOfWeek];
}

export function getMaxWeeksInMonth(month: string): number {
  const year = new Date().getFullYear();
  const startOfMonth = new Date(
    year,
    new Date(Date.parse(`${month} 1, ${year}`)).getMonth(),
    1,
  );
  const endOfMonth = new Date(year, startOfMonth.getMonth() + 1, 0);

  const totalDays = endOfMonth.getDate();
  const totalWeeks = Math.ceil(totalDays / 7);

  return totalWeeks;
}
