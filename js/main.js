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

            EventCenter.fire('select-albumn',{
                channelId: $(this).attr('data-channel-id'),
                channelName: $(this).attr('data-channel-name')
            })
        })
    },

    render() {
        var _this = this
        $.getJSON('https://jirenguapi.applinzi.com/fm/getChannels.php')
            .done(function (ret) {
                _this.renderFooter(ret.channels)
            }).fail(function () {
                console.log('error')
            })
    },

    renderFooter: function (channels) {
        var html = ''
        channels.forEach(function (channel) {
            html += '<li data-channel-id='+channel.channel_id+' data-channel-name='+channel.name+'>'
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
        this.$container = $('#page-music')
        this.audio = new Audio()
        this.audio.autoplay = true
        this.bind()
    },
    bind: function(){
        var _this = this
        EventCenter.on('select-albumn', function(e,channelObj){
            _this.channelId = channelObj.channelId
            _this.channelName = channelObj.channelName
            _this.loadMusic()
        }),
        _this.$container.find('.btn-play').on('click',function(){
            var $btn = $(this)
            if($btn.hasClass('icon-play')){
                $btn.removeClass('icon-play').addClass('icon-videopuase')
                _this.audio.play()
            }else{
                $btn.removeClass('icon-videopuase').addClass('icon-play')
                _this.audio.pause()
            }
        }),
        _this.$container.find('.btn-next').on('click',function(){
            _this.loadMusic()
        })
        _this.audio.addEventListener('play',function(){
            console.log('play')
            clearInterval(_this.statusClock)
            _this.statusClock = setInterval(function(){
                _this.updateStatus()
            },1000)
        })
        _this.audio.addEventListener('pause',function(){
            clearInterval(_this.statusClock)
            console.log('pause')
            
        })
    },
    loadMusic(callback){
        var _this = this
        $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php',{channel:_this.channelId})
        .done(function(ret){   //.done就是当数据到来以后我们输出打印的数据
            _this.song = ret['song'][0]
            _this.setMusic()
            _this.loadLyric()
        })
    },
    loadLyric(){
        var _this = this
        $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php',{sid:_this.song.sid})
        .done(function(ret){
            var lyric = ret.lyric
            var lyricObj = {}
            lyric.split('\n').forEach(function(line){
                var times = line.match(/\d{2}:\d{2}/g)
                var str = line.replace(/\[.+?\]/g,'')
                if(Array.isArray(times)){
                    times.forEach(function(time){
                        lyricObj[time] = str
                    })
                }
            })
            _this.lyricObj = lyricObj
        })
    },
    setMusic(){
        var _this = this
        _this.audio.src = _this.song.url
        $('.bg').css('background-image','url('+_this.song.picture+')')
        _this.$container.find('.aside figure').css('background-image',
        'url('+_this.song.picture+')')
        _this.$container.find('.detail h1').text(_this.song.title)
        _this.$container.find('.detail .author').text(_this.song.artist)
        _this.$container.find('.detail .tag').text(_this.channelName)
        _this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-videopuase')
    },
    updateStatus(){
        var _this = this
        var min = Math.floor(_this.audio.currentTime/60)
        var second = Math.floor(_this.audio.currentTime%60)+''
        second = second.length == 2?second:'0'+second
        _this.$container.find('.current-time').text(min+':'+second)
        _this.$container.find('.bar-progress').css('width',
        _this.audio.currentTime/_this.audio.duration*100 + '%')
        var line = _this.lyricObj['0'+min+':'+second]
        if(line){
            _this.$container.find('.lyric p').text(line)
        }
    }
}
Footer.init()
Fm.init()