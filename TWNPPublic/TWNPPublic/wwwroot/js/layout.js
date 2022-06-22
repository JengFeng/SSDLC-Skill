//視窗百分比切換
$(function () {
	if($(window).width() < 1025)
	{
		// JavaScript here 
		// 當視窗寬度小於1025px時執行
		/*災難摘要動態縮放*/
		$(".wrap > .menuArea").removeClass("out");		
		//小螢幕只有menu縮放內容滿版
		$(".menu-opener").click( function(){
			$(".menuArea").removeClass("out").toggleClass("in");
		});
	} else {
		// JavaScript here
		// 當視窗寬度不小於1024px時執行
		$(".wrap > .menuArea").removeClass("in");						
		// });
		//大螢幕menu和視窗一起縮放
	}
});

$(function () {
	if($(window).width() < 767)
	{
		// JavaScript here 
		// 當視窗寬度小於767px時執行

		//圖層設定
		$(".hidelayerBox").click(function () {
			$(".layerSettingBtn").removeClass("active");
			$(".layerBoxBg").css("top", "100%");
		});
		$(".layerSettingBtn").click(function () {
			$(".layerBoxBg").hide().show();
			$(".layerBoxBg").css("top", "0");
		});
	
	} else {
		// JavaScript here
		// 當視窗寬度不小於767px時執行

		//圖層設定
		//$(".layerBox").addClass("open");
		$(".layerSettingBtn").addClass("active");
		$(".hidelayerBox").click(function () {
			$(".layerBox").removeClass("open");
			$(".layerSettingBtn").removeClass("active");
		});
		$(".layerSettingBtn").click(function () {
			$(".layerBox").toggleClass("open");
		});
	}
});

//底圖選擇
$(function () {
	$(".layerAbgne .layerBg").click(function () {
		$(this).toggleClass("active");
		$(this).siblings().removeClass("active");
	});
});

//圖層頁籤
$(function () {
	// 預設顯示第一個頁籤
	// 並先把 .tabs, .tabs li 及 .tab_content, .tab_content li 等元素取出
	// 同時也要取得 .tab_content 的寬
	var _default = 0,
		$block = $('.layerAbgne'),
		$tabs = $block.find('.tabs'),
		$tabsLi = $tabs.find('li'),
		$tab_content = $block.find('.tab_content'),
		$tab_contentLi = $tab_content.find('li'),
		_width = $tab_content.width();

	// 當滑鼠移到 .tabs li 上時要套用 .hover 樣式
	// 移出時要移除 .hover 樣式
	$tabsLi.hover(function () {
		var $this = $(this);

		// 若被滑鼠移上去的 li 是目前顯示的頁籤就不做任何動作
		if ($this.hasClass('active')) return;

		$this.toggleClass('hover');
	}).click(function () {	// 當滑鼠點擊 .tabs li 時
		// 先取出被點擊及目前顯示的頁籤與索引
		var $active = $tabsLi.filter('.active').removeClass('active'),
			_activeIndex = $active.index(),
			$this = $(this).addClass('active').removeClass('hover'),
			_index = $this.index(),
			isNext = _index > _activeIndex;

		// 如果被點擊的頁籤就是目前已顯示的頁籤, 則不做任何動作
		if (_activeIndex == _index) return;

		// 依索引大或小來決定移動的位置
		$tab_contentLi.eq(_activeIndex).stop().animate({
			left: isNext ? -_width : _width
		}).end().eq(_index).css('left', isNext ? _width : -_width).stop().animate({
			left: 0
		});
	});

	// 先把預設要顯示的頁籤加上 .active 樣式及顯示相對應的內容
	$tabsLi.eq(_default).addClass('active');
	$tab_contentLi.eq(_default).siblings().css({
		left: _width
	});
});



//menu選單	
$(function(){

	$(".menu-opener").click( function(){
		$(".nav_sub").toggleClass("show");

	});
	$("#closeMobile").click( function(){
		$(".nav_sub").removeClass("show");

	});

	//$(".cycleGroup a").click( function(){
	//	$(this).addClass("active").siblings().removeClass("active");
	//});
	
	//選單點選狀態
	$(".leftMenu > li.active .subMenu").slideDown(100);

	/*第一層*/
	$(".leftMenu > li").click( function(){
		$(this).siblings().children(".subMenu").slideUp(100);
		$(this).addClass("active").children(".subMenu").slideDown(100);
		$(this).siblings().removeClass("active");
	});

	$(".menuBoxBtn").click( function(){
		$(this).toggleClass("active");
	});

	/*第二層*/
	$(".subMenu > li").click( function(){
		$(this).siblings().children(".nav").slideUp(100);
		$(this).addClass("active").children(".nav").slideDown(100);
		$(this).siblings().removeClass("active");
		$(this).addClass("active");
	});

	/*第三層*/
	$(".nav > li").click( function(){
		$(this).siblings().children(".navlist").slideUp(100);
		$(this).addClass("active").children(".navlist").slideDown(100);
		$(this).siblings().removeClass("active");
		$(this).addClass("active");
	});

	/*第四層*/
	$(".navlist > li").click( function(){
		$(this).siblings().children(".navlistItem").slideUp(100);
		$(this).addClass("active").children(".navlistItem").slideDown(100);
		$(this).siblings().removeClass("active");
		$(this).addClass("active");
	});

	/*第五層*/
	$(".navlistItem > li").click( function(){
		$(this).siblings().children(".navItem").slideUp(100);
		$(this).addClass("active").children(".navItem").slideDown(100);
		$(this).siblings().removeClass("active");
		$(this).addClass("active");
	});

	//地圖畫家icon點選效果
	$(".iconArea .icon").click( function(){
		$(this).siblings().removeClass("active");
		$(this).addClass("active");
	});



});
	

//跑馬燈
$(function(){
	var use_debug = false;
	function debug(){
		if( use_debug && window.console && window.console.log ) console.log(arguments);
	}
	
	// on DOM ready
	$(document).ready(function (){
		$(".marquee").marquee({
			loop: -1
			// this callback runs when the marquee is initialized
			, init: function ($marquee, options){
				debug("init", arguments);
	
				// shows how we can change the options at runtime
				if( $marquee.is("#marquee2") ) options.yScroll = "bottom";
			}
			// this callback runs before a marquee is shown
			, beforeshow: function ($marquee, $li){
				debug("beforeshow", arguments);
	
				// check to see if we have an author in the message (used in #marquee6)
				var $author = $li.find(".author");
				// move author from the item marquee-author layer and then fade it in
				if( $author.length ){
					$("#marquee-author").html("<span style='display:none;'>" + $author.html() + "</span>").find("> span").fadeIn(850);
				}
			}
			// this callback runs when a has fully scrolled into view (from either top or bottom)
			, show: function (){
				debug("show", arguments);
			}
			// this callback runs when a after message has being shown
			, aftershow: function ($marquee, $li){
				debug("aftershow", arguments);
	
				// find the author
				var $author = $li.find(".author");
				// hide the author
				if( $author.length ) $("#marquee-author").find("> span").fadeOut(250);
			}
		});
	});
	
	var iNewMessageCount = 0;
	function addMessage(selector){
		// increase counter
		iNewMessageCount++;
	
		// append a new message to the marquee scrolling list
		var $ul = $(selector).append("<li>New message #" + iNewMessageCount + "</li>");
		// update the marquee
		$ul.marquee("update");
	}
	
	function pause(selector){
		$(selector).marquee('pause');
	}
	
	function resume(selector){
		$(selector).marquee('resume');
	}
});

//來至業務版的程式碼
//圖層頁籤
$(function () {
	// 預設顯示第一個頁籤
	// 並先把 .tabs, .tabs li 及 .tab_content, .tab_content li 等元素取出
	// 同時也要取得 .tab_content 的寬
	var _default = 0,
		$block = $('.layerAbgne'),
		$tabs = $block.find('.tabs'),
		$tabsLi = $tabs.find('li'),
		$tab_content = $block.find('.tab_content'),
		$tab_contentLi = $tab_content.find('li'),
		_width = $tab_content.width();

	// 當滑鼠移到 .tabs li 上時要套用 .hover 樣式
	// 移出時要移除 .hover 樣式
	$tabsLi.hover(function () {
		var $this = $(this);

		// 若被滑鼠移上去的 li 是目前顯示的頁籤就不做任何動作
		if ($this.hasClass('active')) return;

		$this.toggleClass('hover');
	}).click(function () {	// 當滑鼠點擊 .tabs li 時
		// 先取出被點擊及目前顯示的頁籤與索引
		var $active = $tabsLi.filter('.active').removeClass('active'),
			_activeIndex = $active.index(),
			$this = $(this).addClass('active').removeClass('hover'),
			_index = $this.index(),
			isNext = _index > _activeIndex;

		// 如果被點擊的頁籤就是目前已顯示的頁籤, 則不做任何動作
		if (_activeIndex == _index) return;

		// 依索引大或小來決定移動的位置
		$tab_contentLi.eq(_activeIndex).stop().animate({
			left: isNext ? -_width : _width
		}).end().eq(_index).css('left', isNext ? _width : -_width).stop().animate({
			left: 0
		});
	});

	// 先把預設要顯示的頁籤加上 .active 樣式及顯示相對應的內容
	$tabsLi.eq(_default).addClass('active');
	$tab_contentLi.eq(_default).siblings().css({
		left: _width
	});
});

//定位開合
$(function () {
	$(".positionBlock .title").click(function () {
		$(this).siblings(".searchInput").slideToggle();
		$(this).parents().siblings().find(".searchInput").slideUp();
	});
});

//底圖選擇
$(function () {
	$(".layerAbgne .layerBg").click(function () {
		$(this).toggleClass("active");
		$(this).siblings().removeClass("active");
	});
});
