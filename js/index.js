(function () {
    // 模拟数据
    // 页面刚加载读取本地存储的歌曲列表
    let data = localStorage.getItem('mList') ?
        JSON.parse(localStorage.getItem('mList')) : [];

    let searchData = [];


    //获取元素
    let start = document.querySelector('.start');
    let next = document.querySelector('.next');
    let prev = document.querySelector('.prev');
    let audio = document.querySelector('audio');
    let nowTimeSpan = document.querySelector('.nowTime');
    let totalTimeSpan = document.querySelector('.totalTime');
    let songSinger = document.querySelector('.ctrl-bars-box span');
    let logoImg = document.querySelector('.logo img');
    let ctrlBars = document.querySelector('.ctrl-bars');
    let nowBars = document.querySelector('.nowBars');
    let ctrlBtn = document.querySelector('.ctrl-btn');
    let modeBtn = document.querySelector('.mode');
    let infoEl = document.querySelector('.info');
    let search = document.querySelector('.search');
    let listBox = document.querySelector('.play-list-box ul');



    // 声明变量,根据变量播放哪首歌
    let index = 0;  //标识当前播放歌曲索引
    let rotateDeg = 0; //记录专辑封面旋转角度
    let timer = null;  //保存定时器
    let modeNum = 0;    //0顺序播放 1单曲循环 2
    let infoTimer = null;


    //加载播放列表
    function loadPlayList(){
        if(data.length){
            let str = '';   //用来累计播放项
            // 加载播放列表
            for (let i = 0; i < data.length; i++) {
                str += '<li>';
                str += '<a>×</a>';
                str += '<span>' + data[i].name + '</span>';
                str += '<span>';
                for (let j = 0;j<data[i].ar.length;j++){
                    str += data[i].ar[j].name + '\xa0\xa0\xa0';
                }
                str += '</span>';
                str += '</li>';
            }
            listBox.innerHTML = str;
        }
    }
    loadPlayList();

    // 点击搜索框变换背景颜色
    $(document).ready(function(){
        $("input").focus(function(){
            $("input").css("background-color","#FFFFCC");
        });
        $("input").blur(function(){
            $("input").css("background-color","#D6D6FF");
        });
    });




    //请求服务器
    $('.search').on('keydown',function (e) {
        if(e.keyCode === 13){
            //按下回车键
            $.ajax({
                url:'https://api.imjad.cn/cloudmusic/',
                //参数
                data:{
                    type:'search',
                    s: this.value
                },
                success:function (data) {
                    var str = '';
                    searchData = data.result.songs;
                    if(searchData == null){
                        $('.searchUl').css('display','none');
                    }else{
                        $('.searchUl').css('display','block');
                    }
                    for (var i = 0;i<searchData.length;i++){
                        str += '<li>';
                        str += '<span class="left song">'+searchData[i].name+'</span>';
                        str += '<span class="right singer">';
                        for (j = 0; j < searchData[i].ar.length;j++){
                            str += searchData[i].ar[j].name+'\xa0\xa0\xa0';
                        }
                        str += '</span>';
                        str += '</li>';
                    }
                    $('.searchUl').html(str);
                },
                error:function (err) {
                  console.log(err);
                }
            })
            $('.searchUl').blur();
            this.placeholder = this.value;
            this.value = '';
        }
    });

    //点击搜素列表
    $('.searchUl').on('click','li',function () {
        data.push(searchData[$(this).index()]);
        localStorage.setItem('mList',JSON.stringify(data));
        loadPlayList();
        index = data.length - 1;
        init();
        play();
        loadNum();
    });

    //删除歌曲
    $(listBox).on('click','a',function (e){
        data.splice($(this).parent().index(),1);
        localStorage.setItem('mList',JSON.stringify(data));
        loadPlayList();
        e.stopPropagation();
        loadNum();
    });

    //切换播放列表
    function checkPlayList() {
        let playList = document.querySelectorAll('.play-list-box li');
        for (let i = 0; i < playList.length; i++) {
            playList[i].className = '';
        }
        playList[index].className = 'active';
    }

    // 格式化时间
    function formatTime(time) {
        return time > 9 ? time : '0' + time;
    }

    //提示框提示
    function info(str) {
        infoEl.innerHTML = str;
        $(infoEl).fadeIn();
        clearInterval(infoTimer);
        infoTimer = setTimeout(function () {
            $(infoEl).fadeOut();
        }, 1000);
    }


    //初始化播放
    function init() {
        // 给audio设置播放路径
        rotateDeg = 0;
        checkPlayList();
        audio.src = 'http://music.163.com/song/media/outer/url?id='+data[index].id+'.mp3';
        let str = '';
        str += data[index].name + '\xa0\xa0\xa0';
        for(let i=0;i<data[index].ar.length;i++){
            str += data[index].ar[i].name + '\xa0\xa0\xa0';
        }
        songSinger.innerHTML = str;
        logoImg.src = data[index].al.picUrl;
    }

    init();

    

    // 取不重复的随机数   递归
    function getRandomNum() {
        let randomNum = Math.floor(Math.random() * data.length);
        if (randomNum === index) {
            randomNum = getRandomNum();
        }
        return randomNum;
    }

    //点击歌曲列表播放
    $(listBox).on('click','li',function () {
        index = $(this).index();
        init();
        play();
    })

//显示列表歌曲数量
    function loadNum(){
        $('.play-list').html(data.length);
    }

    loadNum();

    // 播放音乐
    function play() {
        audio.play();
        clearInterval(timer);
        timer = setInterval(function () {
            rotateDeg++;
            logoImg.style.transform = 'rotate(' + rotateDeg + 'deg)';
        }, 30);
        start.style.backgroundPositionY = '-159px';
    }


    // 播放和暂停
    start.addEventListener('click', function () {
        // audio.paused  检测歌曲是播放状态还是暂停
        // 歌曲暂停的时候,为true
        if (audio.paused) {
            play();
        } else {
            audio.pause();
            clearInterval(timer);
            start.style.backgroundPositionY = '-198px';
        }
    });


    //搜索框搜歌按空格不会自动播放歌曲或暂停歌曲
    search.addEventListener('keyup',function (event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (e && e.keyCode == 32) {
            if (audio.paused) {
                play();
            } else {
                audio.pause();
                clearInterval(timer);
                start.style.backgroundPositionY = '-198px';
            };
        }
        });

    // //阻止按空格滚动网页
    $(document).keydown(function(event) {
        if (event.target.nodeName == 'ul' ) {
            return;
        };
        if (event.keyCode == 32) {
            event.preventDefault();
        };
    });


    // 按空格键播放 绑定按键事件
    document.onkeyup = function (event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (e && e.keyCode == 32) { //按空格键播放 32=(space)空格键
            if (audio.paused) {
                play();
            } else {
                audio.pause();
                clearInterval(timer);
                start.style.backgroundPositionY = '-198px';
            }
        }
    }

    //下一曲
    next.addEventListener('click', function () {
        index++;
        index = index > data.length - 1 ? 0 : index;
        let paused  = audio.paused; //如果暂停状态点击下一首也是暂停状态
        init();
        if(paused == false){
            play();
        }
    })
    

    //上一曲
    prev.addEventListener('click', function () {
        index--;
        index = index < 0 ? data.length - 1 : index;
        let paused = audio.paused;
        init();
        if(paused == false){
        play();
        }
    })

    // 切换播放模式
    modeBtn.addEventListener('click', function () {
        modeNum++;
        modeNum = modeNum > 2 ? 0 : modeNum;
        switch (modeNum) {
            case 0:
                info('顺序播放');
                modeBtn.style.backgroundPositionX = '0px';
                modeBtn.style.backgroundPositionY = '-336px';
                modeBtn.addEventListener('mouseenter', function () {
                    modeBtn.style.backgroundPositionX = '-30px';
                });
                modeBtn.addEventListener('mouseleave', function () {
                    modeBtn.style.backgroundPositionX = '0px';
                });
                break;
            case 1:
                info('单曲循环');
                modeBtn.style.backgroundPositionX = '-63px';
                modeBtn.style.backgroundPositionY = '-336px';
                modeBtn.addEventListener('mouseenter', function () {
                    modeBtn.style.backgroundPositionX = '-90px';
                });
                modeBtn.addEventListener('mouseleave', function () {
                    modeBtn.style.backgroundPositionX = '-63px';
                });
                break;
            case 2:
                info('随机播放');
                modeBtn.style.backgroundPositionX = '-63px';
                modeBtn.style.backgroundPositionY = '-241px';
                modeBtn.addEventListener('mouseenter', function () {
                    modeBtn.style.backgroundPositionX = '-90px';
                });
                modeBtn.addEventListener('mouseleave', function () {
                    modeBtn.style.backgroundPositionX = '-63px';
                });
                break;
        }

    });

    //音乐准备完成
    audio.addEventListener('canplay', function () {
        let totalTime = audio.duration;
        let totalM = parseInt(totalTime / 60);
        let totalS = parseInt(totalTime % 60);
        totalTimeSpan.innerHTML = formatTime(totalM) + ":" + formatTime(totalS);

        audio.addEventListener('timeupdate', function () {
            let currentTime = audio.currentTime;
            let currentM = parseInt(currentTime / 60);
            let currentS = parseInt(currentTime % 60);
            nowTimeSpan.innerHTML = formatTime(currentM) + ':' + formatTime(currentS);

            let barWidth = ctrlBars.clientWidth;
            let position = currentTime / totalTime * barWidth;
            nowBars.style.width = position + 'px';
            ctrlBtn.style.left = position - 8 + 'px';

            //判断播放模式
            if (audio.ended) {
                switch (modeNum) {
                    case 0: //顺序播放
                        next.click();
                        init();
                        play();
                        break;
                    case 1: //单曲循环
                        init();
                        play();
                        break;
                    case 2: //随机播放
                        index = getRandomNum();
                        init();
                        play();
                        break;
                }
            }

            //点击左右键快进
            $(document.body).unbind('keydown');
            $(document.body).keydown(function (e) {
                if (e.keyCode == 39) {
                    audio.currentTime += audio.duration * 0.04;
                } else if (e.keyCode == 37) {
                    audio.currentTime -= audio.duration * 0.04;
                }
            });
        });

        //点击播放条到指定位置
        ctrlBars.addEventListener('click', function (e) {
            audio.currentTime = e.offsetX / ctrlBars.clientWidth * audio.duration;
        })
    });
})
();