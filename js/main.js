var EventCenter = {
    on: function (type, handler) {
        $(document).on(type, handler)
    },
    fire: function (type, data) {
        $(document).trigger(type, data)
    }
}

var Footer = {
    init: function () {
        this.$footer = $('footer')
        this.$ul = this.$footer.find('ul')
        this.$box = this.$footer.find('.box')
        this.$leftBtn = this.$footer.find('.icon-left')
        this.$rightBtn = this.$footer.find('.icon-right')
        this.isToEnd = false
        this.isToStart = true
        this.isAnimate = false
        this.bind()
        this.render()
    },

    bind: function () {
        var _this = this
        this.$rightBtn.on('click', function () {
            if(_this.isAnimate) return
            var itemWidth = _this.$box.find('li').outerWidth(true)
            var rowCount = Math.floor(_this.$box.width() / itemWidth) //Math.floor()取整数
            if (!_this.isToEnd) {
                _this.isAnimate = true
                _this.$ul.animate({
                    left: '-=' + rowCount * itemWidth
                }, 400, function () {
                    _this.isAnimate = false
                    _this.isToStart = false
                    if (parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width'))) {
                        _this.isToEnd = true
                    }
                })
            }
        })
        this.$leftBtn.on('click',function(){
            if(_this.isAnimate) return
            var itemWidth = _this.$box.find('li').outerWidth(true)
            var rowCount = Math.floor(_this.$box.width() / itemWidth)
            if(!_this.isToStart){
                _this.isAnimate = true
                _this.$ul.animate({
                    left: '+=' + rowCount * itemWidth
                }, 400, function () {
                    _this.isAnimate = false
                    _this.isToEnd = false
                    if (parseFloat(_this.$ul.css('left')) >= -1) {
                        _this.isToStart = true
                    }
                })
            }  
        })

        this.$footer.on('click','li',function(){
            $(this).addClass('active')
            .siblings().removeClass('active')

            EventCenter.fire('select-albumn',$(this).attr('data-channel-id'))
        })
    },

    render() {
        var _this = this
        $.getJSON('//api.jirengu.com/fm/getChannels.php')
            .done(function (ret) {
                _this.renderFooter(ret.channels)
            }).fail(function () {
                console.log('error')
            })
    },

    renderFooter: function (channels) {
        console.log(channels)
        var html = ''
        channels.forEach(function (channel) {
            html += '<li data-channel-id=' + channel.channel_id + '>'
                + '<div class="cover" style="background-image:url(' + channel.cover_small + ')"></div>'
                + '<h3>' + channel.name + '</h3>'
                + '</li>'
        })
        this.$ul.html(html)
        this.setStyle()
    },

    setStyle: function () {
        var count = this.$footer.find('li').length
        var width = this.$footer.find('li').outerWidth(true) //outerWidth()为true意思是包括他的外边距
        this.$ul.css({
            width: count * width + 'px'
        })
    }
}


var Fm = {
    init: function(){
        this.bind()
    },
    bind: function(){
        var _this = this
        EventCenter.on('select-albumn', function(e,channelId){
            _this.channelId = channelId
            _this.loadMusic()
        })
    },
    loadMusic(){
        $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php',{channel:this.channelId})
        .done(function(ret){   //.done就是当数据到来以后我们输出打印的数据
            console.log(ret)
        })
    }
}
Footer.init()
Fm.init()