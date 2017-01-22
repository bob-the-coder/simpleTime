var simpleTime = (function (){
	var isoRegex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):?(\d{0,2})/;
	var monthDays = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var monthNames = ["", "January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"];
	var dayExtension = ["th", "st", "nd", "rd"];

	function roundDownMonths(v, o){
		var c = 0;
		while(o > 0){
			v--;
			if(v < 1) { v = 12; c++; }
			o--;
		}
		return {val: v, cycles: c};
	}

	function roundUpMonths(v, o){
		var c = 0;
		while(o > 0){
			v++;
			if(v > 12) { v = 1; c++; }
			o--;
		}
		return {val: v, cycles: c};
	}

	function roundUpDays(day, count, year, month){
		var c = 0;
		while(count > 0){
			day++;
			if(day > monthDaysIfLeap(year, month)){
				day = 1;
				month++;
				c++;
				if(month > 12){
					month = 1;
					year++;
				}
			}
			count--;
		}

		return {val: day, cycles: c};
	}

	function roundDownDays(day, count, year, month){
		var c = 0;
		while(count > 0){
			day--;
			if(day === 0){
				month--;
				c++;
				if(month === 0){
					month = 12;
					year--;
				}
				day = monthDaysIfLeap(year, month)
			}
			count--;
		}

		return {val: day, cycles: c};
	}

	function roundUpTime(h, o, m){
		var c = 0;
		while(o > 0){h++; if(h>m){h = 0; c++} o--}
		return {val: h, cycles: c};
	}

	function roundDownTime(h, o, m){
		var c = 0;
		while(o > 0){h--; if(h<0){h = m; c++} o--}
		return {val: h, cycles: c};
	}

	function isLeapYear(y){
		if(typeof y !== "number") return false;

		if(y % 4 !== 0){
			return false;
		} else if (y % 100 !== 0){
			return true;
		} else if (y % 400 !== 0){
			return false;
		}

		return true;
	}

	function monthDaysIfLeap(y, m){
		if (isLeapYear(y) && m === 2) return 29;
		return monthDays[m];
	}

	function yearDays(y){
		return isLeapYear(y) ? 366 : 365;
	}

	function twoDigitFormat(thing){
		if (typeof thing !== "number") return "00";

		return thing < 10 ? "0" + thing : "" + thing;
	}

	var SimpleTime = function(isoDate){
		var m = isoDate.match(isoRegex);

		if(!m) {
			this.year = 1;
			this.month = 1;
			this.day = 1;
			this.hours = 0;
			this.minutes = 0;
			this.seconds = 0;
		}else{
			this.year= +m[1];
			this.month= +m[2] % 13;
			var md = monthDays[this.month] + 1;
			if(isLeapYear(this.year) && this.month === 2){
				md++;
			}

			this.day= +m[3] % md;
			this.hours= (+m[4] || 0) % 24;
			this.minutes= (+m[5] || 0) % 60; 
			this.seconds= (+m[6] || 0) % 60;
		}
	}

	SimpleTime.prototype.isLeapYear = function(){
		return isLeapYear(this.year);
	}

	SimpleTime.prototype.toIsoDate = function(){
		var fmonth = twoDigitFormat(this.month);
		var fday = twoDigitFormat(this.day);
		var fhour = twoDigitFormat(this.hours);
		var fmin = twoDigitFormat(this.minutes);
		var fsec = twoDigitFormat(this.seconds);

		return [[this.year, fmonth, fday].join("-"), [fhour, fmin, fsec].join(":")].join("T");
	}

	SimpleTime.prototype.setYear = function(v){
		v = typeof v === "number" ? v : this.year;
		if(isLeapYear(this.year) && !isLeapYear(v) && this.month === 2 && this.day === 29){
			this.day = 28;
		}
		this.year = v;
		return this;
	}

	SimpleTime.prototype.setMonth = function(v){
		if (typeof v !== "number" || v <= 0) return this;
		
		v = Math.floor(Math.abs(v));
		var round = roundUpMonths(0, v);
		this.month = round.val;				

		if(isLeapYear(this.year) && this.month === 2 && this.day > 29){
			this.day = 29;
		} else if (monthDays[this.month] < this.day){
			this.day = monthDays[this.month];
		}
		return this;
	}

	SimpleTime.prototype.setDay = function(v){
		if (typeof v !== "number") return this;
		var md = monthDays[this.month];
		if(this.month === 2 && this.isLeapYear()) md++;
		this.day = Math.min(Math.abs(v), md);
		return this;
	}

	SimpleTime.prototype.setHour = function(v){
		if (typeof v !== "number") return this;
		this.hours = Math.floor(Math.abs(v)) % 24;
		return this;
	}

	SimpleTime.prototype.setMinutes = function(v){
		if (typeof v !== "number") return this;
		this.hours = Math.floor(Math.abs(v)) % 60;
		return this;	
	}

	SimpleTime.prototype.setSeconds = function(v){
		if (typeof v !== "number") return this;
		this.hours = Math.floor(Math.abs(v)) % 60;
		return this;	
	}

	SimpleTime.prototype.addYears = function(v){
		if (typeof v !== "number") return this;
		var newYear = this.year + v;
		if (isLeapYear(this.year) && !isLeapYear(newYear) && this.month === 2 && this.day === 29){
			this.day = 1;
			this.month = 3;
		}
		this.year = newYear;
		return this;
	}

	SimpleTime.prototype.addMonths = function(v){
		if (typeof v !== "number" || v === 0) return this;
		var subtract = v < 0;
		v = Math.floor(Math.abs(v));
		var lastMonth = this.month;
		var round = { val: 0, cycles: 0 };

		if(subtract){
			round = roundDownMonths(this.month, v, 1, 12);
			this.month = round.val;

			if(this.day > monthDaysIfLeap(this.year - round.cycles, this.month)){
				this.day = monthDaysIfLeap(this.year - round.cycles, this.month)
			}

			this.addYears(-round.cycles);
		} else{
			round = roundUpMonths(this.month, v, 1, 12);
			this.month = round.val;

			if(this.day > monthDaysIfLeap(this.year + round.cycles, this.month)){
				this.day = monthDaysIfLeap(this.year + round.cycles, this.month)
			}

			this.addYears(round.cycles);
		}

		return this;
	}

	SimpleTime.prototype.addDays = function(v){
		if (typeof v !== "number" || v === 0) return this;
		var subtract = v < 0;
		v = Math.floor(Math.abs(v));
		
		if(subtract){
			var round = roundDownDays(this.day, v, this.year, this.month);
			this.day = round.val;
			this.addMonths(-round.cycles);
		} else{
			var round = roundUpDays(this.day, v, this.year, this.month);
			this.day = round.val;
			this.addMonths(round.cycles);
		}

		return this;
	}

	SimpleTime.prototype.addHours = function(v){
		if (typeof v !== "number" || v === 0) return this;
		var subtract = v < 0;
		v = Math.floor(Math.abs(v));

		if(subtract){
			var round = roundDownTime(this.hours, v, 23);
			this.hours = round.val;
			this.addDays(-round.cycles);
		} else {
			var round = roundUpTime(this.hours, v, 23);
			this.hours = round.val;
			this.addDays(round.cycles);
		}

		return this;
	}

	SimpleTime.prototype.addMinutes = function(v){
		if (typeof v !== "number" || v === 0) return this;
		var subtract = v < 0;
		v = Math.floor(Math.abs(v));

		if(subtract){
			var round = roundDownTime(this.minutes, v, 59);
			this.minutes = round.val;
			this.addHours(-round.cycles);
		} else {
			var round = roundUpTime(this.minutes, v, 59);
			this.minutes = round.val;
			this.addHours(round.cycles);
		}

		return this;
	}

	SimpleTime.prototype.addSeconds = function(v){
		if (typeof v !== "number" || v === 0) return this;
		var subtract = v < 0;
		v = Math.floor(Math.abs(v));

		if(subtract){
			var round = roundDownTime(this.seconds, v, 59);
			this.seconds = round.val;
			this.addMinutes(-round.cycles);
		} else {
			var round = roundUpTime(this.seconds, v, 59);
			this.seconds = round.val;
			this.addMinutes(round.cycles);
		}

		return this;
	}

	function parse(isoDate){
		return new SimpleTime(isoDate);
	}

	return {
		parse: parse
	}
}());