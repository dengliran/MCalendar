

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.MCalendar = factory();
	}
})(this, function() {
var Settings = {
		callback: function(){},
		clearBtn: false
	},
	isOpen = false,
	animated = false,
	selectedDate = undefined,
	ctrlYear = undefined,
	ctrlMonth = undefined;

function MCalendar(element, opts) {
	return (this instanceof MCalendar)
		? this.init(element, opts)
		: new MCalendar(element, opts);
}

MCalendar.prototype.configure = function(opts) {
	var key, value;
	for (key in opts) {
		value = opts[key];
		if (value !== undefined && opts.hasOwnProperty(key)) Settings[key] = value;
	}
	return this;
};

MCalendar.prototype.init = function(element, opts) {
	var self = this;
	this.configure(opts)
	this._eventBind(element)
	return this;
};

MCalendar.prototype.render = function(flip) {
	if(!ctrlYear || !ctrlMonth){
		var today = new Date();
		ctrlYear = today.getFullYear();
		ctrlMonth = today.getMonth() + 1;
	}

	if(flip === 0){
		ctrlMonth --
	}else if(flip === 1){
		ctrlMonth ++
	}
	if(ctrlMonth === 0){
		ctrlMonth = 12;
		ctrlYear --;
	}
	if(ctrlMonth > 12){
		ctrlMonth = 1;
		ctrlYear ++;
	}
	return this._dateModel(ctrlYear,ctrlMonth);
}

MCalendar.prototype._dateModel = function(year, month) {
	var k = []
	var firstDay = new Date(year, month-1 ,1),
		firstDayWeek = firstDay.getDay();
	if(firstDayWeek === 0) firstDayWeek = 7;

	var lastDayOfLastMonth = new Date(year, month-1, 0),
		lastDateOfLastMonth = lastDayOfLastMonth.getDate(),
		preMontDayCount = firstDayWeek - 1,
		lastDay = new Date(year, month, 0),
		lastDate = lastDay.getDate()
	for(var i=0;i<6*7;i++){
		var date = i + 1 - preMontDayCount,
			showDate = date,
			thisMonth = month;
		if(date<=0){
			thisMonth = month -1;
			showDate = lastDateOfLastMonth + date;
		}else if(date > lastDate){
			thisMonth = month + 1;
			showDate = showDate - lastDate;
		}
		if(thisMonth === 0) thisMonth = 12;
		if(thisMonth === 13) thisMonth = 1;
		k.push({
			month: thisMonth,
			date: date,
			showDate: showDate
		})
	}
	return {
		year: year,
		month: month,
		days: k
	};
}

MCalendar.prototype.viewManage = function(timeData) {
	var $shell = document.createElement('div')
	$shell.className = 'MCalendar-container';
	var tpl = '<div id="MCalendar-mask" class="fadeIn"></div>\
				<div id="MCalendar-content" class="sideInBottom">\
				<div class="MCalendar-hd">\
					'+ (Settings.clearBtn 
						? '<a href="javascript:;" id="MCalendar__clear">清除</a>' 
						: '<a href="javascript:;" id="MCalendar__cancel">取消</a>') + '\
						<div class="MCalendar-hd__tools">\
							<a href="javascript:;" id="MCalendar-hd__prev"></a>\
							<span id="MCalendar-hd__ym"></span>\
							<a href="javascript:;" id="MCalendar-hd__next"></a>\
						</div>\
					<a href="javascript:;" id="MCalendar__enter">确认</a>\
				</div>\
				<table class="MCalendar-bd">\
					<thead>\
						<tr>\
							<th>一</th>\
							<th>二</th>\
							<th>三</th>\
							<th>四</th>\
							<th>五</th>\
							<th>六</th>\
							<th>日</th>\
						</tr>\
					</thead>\
					<tbody id="MCalendar-bd__tbody">\
					</tbody>\
				</table>\
				<div>\n';
	$shell.innerHTML += tpl
	document.body.appendChild($shell);
	this.viewBind(timeData)
}

MCalendar.prototype.viewBind = function(timeData) {
	var tplDay = ''
	for (var i = 0; i < timeData.days.length; i++) {
		var current = timeData.year +'-'+ timeData.days[i].month +'-'+ timeData.days[i].showDate
		if(i%7 === 0){
			tplDay += '<tr>'
		}
		tplDay += '<td data-current="'+ current +'" class="'
			+ (timeData.month == timeData.days[i].month ? '' : 'MCalendar-across')
			+ (this._checkInSelectedDate(current) ? ' MCalendar-active' : '')
			+ '"><span>'
			+ timeData.days[i].showDate
			+ '</span></td>';
		if(i%7 === 6){
			tplDay += '</tr>'
		}
	};
	document.getElementById('MCalendar-hd__ym').innerHTML = timeData.year + '年' + timeData.month + '月'
	document.getElementById('MCalendar-bd__tbody').innerHTML = tplDay
}

MCalendar.prototype._checkInSelectedDate = function(date){
	for (var i = 0; i < selectedDate.length; i++) {
		if(selectedDate[i] === date){
			return true;
		}
	};
	return false;
}

MCalendar.prototype._clearAllSelectedDate = function(){
	selectedDate = [];
	return this;
}

MCalendar.prototype._clearAllSelectedView = function(){
	var _active = document.getElementById('MCalendar-bd__tbody')
							.querySelectorAll('.MCalendar-active')
	for(var i = 0; i<_active.length; i++){
		_active[i].className = _active[i].className.replace('MCalendar-active','')
	}
	
	return this;
}

MCalendar.prototype.viewClose = function(){
	if(!isOpen || animated){return}

	document.getElementById('MCalendar-content').className += 'sideOutBottom'
	document.getElementById('MCalendar-mask').className += 'fadeOut'

	animated = true

	document.getElementById('MCalendar-content').addEventListener('animationend',function(){
		document.body.removeChild(document.querySelector('.MCalendar-container'))
		isOpen = false;
		animated = false;
	})

	this._clearAllSelectedDate()
}

MCalendar.prototype._eventBind = function(element) {
	var _self = this,
		_element = document.querySelectorAll(element)
	for (var i = 0; i < _element.length; i++) {
		_element[i].addEventListener('click',_elementBindFoo)
	}

	function _elementBindFoo(e){
		if(!isOpen){
			selectedDate = this.getAttribute('data-selectedDate') ? this.getAttribute('data-selectedDate').split(',') : [];

			var _currentMonth = _self.render(),
				EventTarget = e.target;

			_self.viewManage(_currentMonth)

			document.getElementById('MCalendar-mask').addEventListener('click',function(){	
				_self.viewClose()
			})

			if(Settings.clearBtn){
				document.getElementById('MCalendar__clear').addEventListener('click',function(){
					EventTarget.innerHTML = ''
					EventTarget.setAttribute('data-selecteddate','')
					_self._clearAllSelectedDate()
						._clearAllSelectedView()
				})
			}else{
				document.getElementById('MCalendar__cancel').addEventListener('click',function(){
					_self.viewClose()
				})
			}
			document.getElementById('MCalendar-hd__prev').addEventListener('click',function(){
				var _lastMonth = _self.render(0)
				_self.viewBind(_lastMonth)
			})
			document.getElementById('MCalendar-hd__next').addEventListener('click',function(){
				var _nextMonth = _self.render(1)
				_self.viewBind(_nextMonth)
			})
				
			document.getElementById('MCalendar-bd__tbody').addEventListener('click',function(e){
				var _target = e.target.tagName == 'SPAN'
					? e.target.parentNode
					: e.target

				if(_target.tagName !== 'TD') {return false;}

				if(!/MCalendar-active/g.test(_target.className)){
					_target.className += ' MCalendar-active'
					selectedDate.push(_target.dataset.current)
				}else{
					_target.className = _target.className.replace('MCalendar-active','')
					for(var i=0;i<selectedDate.length;i++){
						if(selectedDate[i] === _target.dataset.current){
							selectedDate.splice(i,1)
						}
					}
				}
			})

			document.getElementById('MCalendar__enter').addEventListener('click',function(){
				if(EventTarget.tagName === 'INPUT') {
					EventTarget.value = selectedDate.join(',')
				}else {
					EventTarget.innerHTML = selectedDate.join(',')
				}

				EventTarget.setAttribute('data-selecteddate',selectedDate)
				
				Settings.callback(selectedDate)

				_self.viewClose()
			})

			document.getElementById('MCalendar-content').addEventListener('animationend',function(){
				this.className = this.className.replace('sideInBottom','')
				var _MCalendarMask = document.getElementById('MCalendar-mask')
				_MCalendarMask.className = _MCalendarMask.className.replace('fadeIn','')

				isOpen = true;
			})
		}
	}
}

return MCalendar;

});
