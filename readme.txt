SimpleTime readme

How to use:

Provided script is a module named simpleTime.

It takes a single argument: a string representing a datetime in ISO8601 format.
It will return a SimpleTime object which has some functionality:

simpleTime.parse(ISO8601 DateTime string) => SimpleTime object

setYear - sets the year to the input value

setMonth - sets the month to the input value. the input is parsed into the int absolute value provided.
		   if resulting value is larger than 12, it will wrap around
setDay - sets the day to the input value. regardless of the user input, the maximum value is the number of
		 days in the current month (leap years considered) and the minimum is 1

setHour - sets hour to input value (min 0, max 23)

setMinutes - sets minutes to input value (min 0, max 59)

setSeconds - sets seconds to input value (min 0, max 59)

addYears - adds or subtracts the given number from the current year.
		   +++ SPECIAL CASE: if current year is a leap year and date is Feb 29th, if the resulting year is not a
		   leap year, the date will shift to March 1st
addMonths - adds or subtracts the given number from the current month. overflows and underflows in resulting month number
			will result in adding or subtracting years from the current year.
			+++ LEAP YEAR case is handled the same way as with addYears
			+++ if the current month has more days than the result month, the new
				day will be the last day of the resulting month (e.g. March 31st + addMonths(1) => April 30th)

addDays - adds or subtracts the given number from the current day. overflow and underflows in resulting day (relative to the 
			number of days in the intermediate or resulting months) will result in adding or subtracting months from the current month

addHours - adds or subtracts the given number from the current hour. over/underflows will result in adding or subtracting days 				from the current day

addMinutes - adds or subtracts the given number from the current minute. over/underflows will result in adding or subtracting 				hours from the current hour

addSeconds - adds or subtracts the given number from the current minute. over/underflows will result in adding or subtracting 				minutes from the current minute

isLeapYear - returns true/false depending on the current year being leap or not

toIsoDate - returns a string representing the current datetime in ISO8601 format