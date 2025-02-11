// 時間套件民國年(物件id,是否要顯示時分,是否使用月份日曆)
function CreateRocDate(elmId, isTimepicker = false, isMonth = false, isYear = false, isRange=false,customPosition = "") {
    const zh = {
        days: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        daysShort: ['日', '一', '二', '三', '四', '五', '六'],
        daysMin: ['日', '一', '二', '三', '四', '五', '六'],
        months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        monthsShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        today: '今天',
        clear: '清除',
        dateFormat: isMonth ? 'yyyy-MM' : isYear ? 'yyyy' : 'yyyy-MM-dd',
        timeFormat: 'HH:mm:00',
        firstDay: 1
    };

    let options = {
        locale: zh,
        autoClose: true,
        timepicker: isTimepicker,
        range: isRange,
        multipleDatesSeparator: '~',
        buttons: [{
            content: isMonth ? '當月' : isYear ? '當年' : '今天'
            , onClick(dp) {
                let viewDate = dp.viewDate;
                let today = new Date();
                dp.setViewDate(today);
                dp.selectDate(today);
            }
        }, 'clear'],
        //navTitles: {
        //    days: '<i>西元 yyyy 年</i> MM 月',
        //    months: 'yyyy',
        //    years: 'yyyy1 - yyyy2'
        //},
        onSelect: function onSelect(dp) {
            const event = new Event('input', { bubbles: true });
            dp.datepicker.$el.dispatchEvent(event);
        },
    };
    if (customPosition != '') options.position = customPosition;//right center
    // 如果 isMonth 為 true，使用月份日曆選擇
    if (isMonth) {
        options.view = 'months';
        options.minView = 'months';
    }

    if (isYear) {
        options.view = 'years';
        options.minView = 'years';
    }


    let adp = new AirDatepicker("#" + elmId, options);

    return adp;

}
