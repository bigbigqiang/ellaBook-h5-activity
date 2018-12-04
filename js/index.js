/*
* 强  2018/5/23
* */
(function (win) {
    // var baseUrl = 'http://118.31.171.207:9000/rest';
    //var baseUrl = 'https://api.ellabook.cn/rest';
    var baseUrl = 'http://dev.ellabook.cn/rest'
    var obj = {
        baseUrl:baseUrl,
        jsonUrl: baseUrl+'/api/service',
        bookCode: 'SBA20180905102014589042',
        shareImg:'https://ellabook.cn/bookService1/MidAutumn/img/share.jpg',
        shareTitle: '我正在咿啦看书阅读《中秋节》系列绘本，免费送你一本，一起来看吧！',
        shareDesc: '千百部绘本故事，你想看的这都有！',
        flag: true,
        isWX:false,
        unionid:'',
        received:false,
        video:$('#video')[0],
        code: '',
        $:{
            videoPlay:$('.m-video img'),
            getBook_wx:$('.getBook_wx'),
            getBook_ph:$('.getBook_ph'),
            register:$('#register'),
            phoneNum_ph:$('#phoneNum_ph'),
            password:$('#password'),
            getCode:$('.getCode'),
            countdown:$('.countdown'),
            phoneNum_wx:$('#phoneNum_wx'),
            VCode:$('#VCode')
        },

        init: function () {
            var w = this;
            w.initEvent();
            w.Weixinshare();
        },
        alert: function (text) {
            var j_ppo = $('.j-pop');
            j_ppo.text(text);
            j_ppo.fadeIn();
            setTimeout(function () {
                j_ppo.fadeOut();
            }, 2000);
        },
        checkPhoneNum:function(phoneNum){
            return /^1[3|4|5|6|7|8][0-9]{9}$/.test(phoneNum);
        },

        initEvent: function () {
            var w = this;
            w.isWX = window.navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1;
            if (w.isWX) {
                if (w.getQueryString('code')) {
                    w.code = w.getQueryString('code')
                    w.authorizedAndSendBoods({
                        customerName: '',
                        password: '',
                        code: w.code,
                        sendBookActivityCode: w.bookCode,
                        functionType: "0",
                        platformType: "WEIXIN",
                        unionid: ''
                    })
                } else {
                    var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxca187025bd70cab8&redirect_uri='+encodeURI(window.location.href)+'&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect'
                    window.location.href = url
                }
            }
            w.$.videoPlay.on('click', function (){
                w.video.play();
                $(this).hide();
            });
            w.video.addEventListener('play',function(){
                w.$.videoPlay.hide();
            });
            w.video.addEventListener('pause',function(){
                w.$.videoPlay.show();
            });
            $('.m-btn-getBook').on('click',function(){
                $(document).scrollTop(0);
                if (!w.code && !w.unionid && !w.received) {
                    $(w.video).hide();
                    w.$.getBook_ph.show();
                } else if (w.code && w.unionid && !w.received) {
                    $(w.video).hide();
                    w.$.getBook_wx.show();
                } else if (w.code && !w.unionid && w.received) {
                    window.location.href = 'getBooks.html?' + 'userName=' + '&wx=1';
                }
            });
            $('.m-close').on('click',function(){
                $(w.video).show();
                w.$.getBook_wx.hide();
                w.$.getBook_ph.hide();
            });
            $('#register').on('click',function(){
                w.authorizedAndSendBoods({
                    customerName: '',
                    password: '',
                    code: '',
                    sendBookActivityCode: w.bookCode,
                    functionType: "1",
                    platformType: "WEIXIN",
                    unionid: w.unionid
                });
            });

            w.$.getCode.on('click',function(){
                var phoneNum = w.$.phoneNum_ph.val().trim();
                if (phoneNum == '') {
                    w.alert('手机号不能为空');
                    return;
                }
                if (!w.checkPhoneNum(phoneNum)) {
                    w.alert('手机号格式不正确');
                    return;
                }
                w.sendMessage(phoneNum);
                w.countdown();
            });

            $('.m-btn-submit-wx').on('click', function () {
                if(w.flag){
                    var _this = $(this);
                    _this.css('box-shadow','0px 0px 10px 0px rgba(0, 0, 0, 1)');
                    setTimeout(function () {
                        _this.css('box-shadow','none');
                    }, 600);
                    var password = w.$.password.val().trim();
                    var phoneNum = w.$.phoneNum_wx.val().trim();
                    if (phoneNum == '') {
                        w.alert('手机号不能为空');
                        return;
                    }
                    if (!w.checkPhoneNum(phoneNum)) {
                        w.alert('手机号格式不正确');
                        return;
                    }
                    if (password == '') {
                        w.alert('密码不能为空');
                        return;
                    }
                    w.authorizedAndSendBoods({
                        customerName: phoneNum,
                        password: md5(password),
                        code: '',
                        sendBookActivityCode: w.bookCode,
                        functionType: "2",
                        platformType: "WEIXIN",
                        unionid: w.unionid
                    });
                }else {
                    return;
                }
            });
            $('.m-btn-submit-ph').on('click', function () {
                if(w.flag){
                    var _this = $(this);
                    _this.css('box-shadow','0px 0px 10px 0px rgba(0, 0, 0, 1)');
                    setTimeout(function () {
                        _this.css('box-shadow','none');
                    }, 600);
                    var codeTxt = w.$.VCode.val().trim();
                    var phoneNum = w.$.phoneNum_ph.val().trim();
                    if (phoneNum == '') {
                        w.alert('手机号不能为空');
                        return;
                    }
                    if (!w.checkPhoneNum(phoneNum)) {
                        w.alert('手机号格式不正确');
                        return;
                    }
                    if (codeTxt == '') {
                        w.alert('验证码不能为空');
                        return;
                    }
                    w.sendBookFromH5(phoneNum,codeTxt);
                }else {
                    return;
                }
            });
        },

        getQueryString: function(name){
            var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r!=null) return r[2]; return '';
        },
        /*
        * 强  2018/5/23
        * 获取验证码
        * */

        sendMessage: function (phoneNum) {
            var w = this;
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: w.jsonUrl,
                data: {
                    method: 'ella.user.sendMessage',
                    content: JSON.stringify({
                        mobileNum: phoneNum,
                        type: 'LOGIN_CHECK'
                    })
                },
                success: function (data) {
                    w.alert('验证码已发送');
                    console.log(data);
                }
            })
        },
        /*
        * 强  2018/5/17
        * 领书
        * */
        sendBookFromH5: function (phoneNum,codeTxt) {
            var w = this;
            w.flag = false;
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: w.jsonUrl,
                data: {
                    method: 'ella.book.sendBookFromH5',
                    content: JSON.stringify({
                        customerName: phoneNum,
                        sendBookActivityCode: w.bookCode,
                        checkCode:codeTxt
                    })
                },
                complete: function(){
                    setTimeout(function () {
                        w.flag = true;
                    }, 1000);
                },
                success: function (data) {
                    if (data.status == "1"||data.status == "2") {
                        window.location.href = 'getBooks.html?' + 'userName=' + phoneNum + '&wx=0';
                    } else {
                        if(data.code == '10002004'){
                            // w.reTime();
                            w.alert('验证码输入有误');
                        } else {
                            w.alert(data.message);
                        }
                    }
                }
            })
        },
        /*
        * 强  2018/5/17
        * 获取微信sdk初始化参数信息
        * */

        Weixinshare: function () {
            var w = this;
            var Url = window.location.href;
            $.ajax({
                type: 'GET',
                dataType: 'json',
                data:{
                    weixinurl: Url
                },
                url: w.baseUrl + '/wxshare/Weixinshare',
                success: function (data) {
                    console.log(data);
                    wx.config({
                        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: 'wxca187025bd70cab8', // 必填，公众号的唯一标识
                        timestamp: data.timestamp, // 必填，生成签名的时间戳
                        nonceStr: data.nonceStr, // 必填，生成签名的随机串
                        signature: data.signature, // 必填，签名，见附录1
                        jsApiList: [
                            'checkJsApi',
                            'onMenuShareTimeline',
                            'onMenuShareAppMessage',
                            'onMenuShareQQ',
                            'onMenuShareWeibo',
                            'onMenuShareQZone'
                        ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                    });
                    wx.ready(function () {
                        var shareMessage={
                            title: w.shareTitle, // 分享标题
                            link: Url, // 分享链接
                            desc:w.shareDesc,
                            imgUrl: w.shareImg, // 分享图标
                            trigger: function (res) {
                                // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
                                //alert('用户点击发送给朋友');
                            },
                            success: function (res) {

                            },
                            cancel: function (res) {

                            },
                            fail: function (res) {
                            }
                        };
                        wx.ready(function(){
                            wx.onMenuShareAppMessage (shareMessage);
                            wx.onMenuShareTimeline(shareMessage);
                            wx.onMenuShareQQ(shareMessage);
                            wx.onMenuShareQZone(shareMessage);
                        });
                    });
                }
            })
        },
        /*
        * 强  2018/5/17
        * 领书
        * */
        authorizedAndSendBoods: function (content) {
            var w = this;
            console.log(content)
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: w.jsonUrl,
                data: {
                    method: 'ella.user.authorizedAndSendBooks',
                    content: JSON.stringify(content)
                },
                success: function (data) {
                    switch(content.functionType)
                    {
                        case '0':
                            if (data.status == '1') {
                                if (data.code == '10001010') {
                                    w.unionid = data.data.unionid
                                } else if(data.code == '0x00000000'){
                                    // 已经用微信注册过账号，本次接口请求之后已经领取图书
                                    w.received = true
                                }
                            } else if (data.status == '2') {
                                if (data.code == '10003008') {
                                    //    已经用微信注册过账号，况且已经领过图书
                                    w.received = true
                                } else {
                                    w.alert(data.message);
                                }
                            } else {
                                w.alert(data.message);
                            }
                            break;
                        case '1':
                            if (data.status == '1') {
                                $(w.video).show();
                                w.$.getBook_wx.hide();
                                window.location.href = 'getBooks.html?' + 'userName=' + '&wx=1';
                            } else {
                                if (data.code == '10001035') {
                                    w.alert(data.message + '，页面将刷新，请重试~');
                                    setTimeout(function () {
                                        window.location.reload();
                                    },3000)
                                } else {
                                    w.alert(data.message);
                                }
                            }
                            break;
                        case '2':
                            if (data.status == '1') {
                                $(w.video).show();
                                w.$.getBook_wx.hide();
                                window.location.href = 'getBooks.html?' + 'userName=' + '&wx=1';
                            } else {
                                w.alert(data.message);
                            }
                            break;
                        default:
                            console.log('')
                    }
                }
            })
        },
        countdown:function(){
            var w = this;
            w.T&&clearInterval(w.T);
            var count = 59;
            w.$.getCode.hide();
            w.$.countdown.show().text('60s');
            w.T = setInterval(function(){
                if(count>-1){
                    w.$.countdown.text(count +"s");
                    count--
                }else {
                    clearInterval(w.T);
                    w.$.getCode.show().text('重新获取');
                    w.$.countdown.hide();
                }
            },1000);
        },
        reTime: function () {
            var w = this;
            w.T&&clearInterval(w.T);
            w.$.getCode.show().text('重新获取');
            w.$.countdown.hide();
        }
    };
    win.page = obj;
})(window);