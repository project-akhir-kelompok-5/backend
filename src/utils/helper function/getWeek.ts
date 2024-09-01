const monthNameToIndex: { [key: string]: number } = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};
export const indexToMonthName: { [key: number]: string } = Object.keys(
  monthNameToIndex,
).reduce((acc, key) => {
  acc[monthNameToIndex[key]] = key;
  return acc;
}, {} as { [key: number]: string });

export function getWeekNumberInMonth(): number {
  const date = new Date();
  const dayOfMonth = date.getDate();
  
  if (dayOfMonth <= 7) return 1;
  if (dayOfMonth <= 14) return 2;
  if (dayOfMonth <= 21) return 3;
  if (dayOfMonth <= 28) return 4;
  return 5;
}


export function getMonthRange(month: string): [Date, Date] {
  const year = new Date().getFullYear();
  const monthIndex = parseInt(month, 10) - 1; // Convert 'MM' to month index
  const startOfMonth = new Date(year, monthIndex, 1);
  const endOfMonth = new Date(year, monthIndex + 1, 0);
  return [startOfMonth, endOfMonth];
}

export function getWeekRange(month: string): [Date, Date] {
  const year = new Date().getFullYear();
  const monthIndex = parseInt(month, 10) - 1; // Convert month to zero-based index
  let startOfWeek: Date;
  let endOfWeek: Date;  

  const week = getWeekNumberInMonth();
  console.log('week', week);

  switch (week) {
    case 1:
      startOfWeek = new Date(year, monthIndex, 1);
      endOfWeek = new Date(year, monthIndex, 7);
      break;
    case 2:
      startOfWeek = new Date(year, monthIndex, 8);
      endOfWeek = new Date(year, monthIndex, 14);
      break;
    case 3:
      startOfWeek = new Date(year, monthIndex, 15);
      endOfWeek = new Date(year, monthIndex, 21);
      break;
    case 4:
      startOfWeek = new Date(year, monthIndex, 22);
      endOfWeek = new Date(year, monthIndex, 28);
      break;
    case 5:
      startOfWeek = new Date(year, monthIndex, 29);
      endOfWeek = new Date(year, monthIndex + 1, 0); // 0th day of next month gives last day of current month
      break;
    default:
      throw new Error('Invalid week number');
  }

  console.log(JSON.stringify({ startOfWeek, endOfWeek }));

  return [startOfWeek, endOfWeek];
}



export function getMaxWeeksInMonth(month: string): number {
  const year = new Date().getFullYear();
  const monthIndex = parseInt(month, 10) - 1; // Convert 'MM' to month index
  const endOfMonth = new Date(year, monthIndex + 1, 0);
  const totalDays = endOfMonth.getDate();
  return Math.ceil(totalDays / 7);
}
