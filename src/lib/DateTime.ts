export const convertTimeZone = ({
  date,
  from,
  to
}: {
  date: Date
  from?: string
  to?: string
}): Date => {
  let fromDate;
  let toDate;
  const result = new Date(date);

  if (from) {
    fromDate = new Date(result.toLocaleString("en-US", { timeZone: from }))
  } else {
    fromDate = new Date(result);
  }

  if (to) {
    toDate = new Date(result.toLocaleString("en-US", { timeZone: to }))
  } else {
    toDate = new Date(result)
  }

  result.setTime(result.getTime() + (toDate.getTime() - fromDate.getTime()));
  return result;
}

export const toDateString = (date: Date): string => {
  return `${date.getFullYear()}-${leftPad(date.getMonth() + 1, 2)}-${leftPad(date.getDate(), 2)}`;
}

export const toTimeString = (date: Date): string => {
  return `${leftPad(date.getHours(), 2)}:${leftPad(date.getMinutes(), 2)}`;
}

export const toTimeISOString = (date: Date): string => {
  return `${leftPad(date.getHours(), 2)}:${leftPad(date.getMinutes(), 2)}:00`;
}

export const toDateTimeString = (date: Date): string => {
  return `${toDateString(date)} ${toTimeString(date)}`;
}

export const toISOString = (date: Date): string => {
  return `${toDateString(date)}T${toTimeISOString(date)}`;
}

export const toFriendlyDateString = (date: Date) => {
  return `${[ 'Sun', 'Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat' ][date.getDay()]} ${date.getDate()} ${[ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ][date.getMonth()]}`;
}

export const toFriendlyDateTimeString = (date: Date) => {
  return `${toFriendlyDateString(date)} ${toTimeString(date)}`;
}


export const leftPad = (s: any, length: number, char: string = '0') => {
  let result = s + '';
  while (result.length < length) {
    result = char + result;
  }
  return result;
}