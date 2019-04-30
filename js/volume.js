(function () {
let vol = $('audio')[0].volume;
$('audio')[0].volume=0.5;
window.onload = function() {
    var nowVoice = document.querySelector('.nowVoice'); //长线条
    var voiceBtn = document.querySelector('.voice-btn'); //小方块
    var voice = document.querySelector('.voice'); //小方块
    var ifBool = false; //判断鼠标是否按下
    //事件
    var start = function(e) {
        e.stopPropagation();
        ifBool = true;
    }
    var move = function(e) {
        if(ifBool) {
            if(!e.touches) {    //兼容移动端
                var y = e.clientY;
            } else {     //兼容PC端
                var y = e.touches[0].pageY;
            }
            //var x = e.touches[0].pageX || e.clientX; //鼠标横坐标var x
            var lineDiv_left = getPosition(nowVoice).top; //长线条的横坐标
            var minDiv_left = y - lineDiv_left; //小方块相对于父元素（长线条）的left值
            if(minDiv_left >= nowVoice.offsetHeight - 15) {
                minDiv_left = nowVoice.offsetHeight - 15;
            }
            if(minDiv_left < 0) {
                minDiv_left = 0;
            }
            //设置拖动后小方块的left值
            voiceBtn.style.top = minDiv_left + "px";
            $('audio')[0].volume = Math.abs(parseInt((minDiv_left / (nowVoice.offsetHeight - 15)) * 100-100)/100);
            if(voiceBtn.style.top == '82px' || voiceBtn.style.top == '83px'){
                voice.style.backgroundPositionX = '46px';
                voice.style.backgroundPositionY = '-61px';
            }else{
                voice.style.backgroundPositionX = '0px';
                voice.style.backgroundPositionY = '-240px';
            }

            voice.addEventListener('mouseenter',function () {
                if(voiceBtn.style.top == '82px' || voiceBtn.style.top == '83px') {
                    voice.style.backgroundPositionX = '26px';
                    voice.style.backgroundPositionY = '-61px';
                }else {
                    voice.style.backgroundPositionX = '-29px';
                    voice.style.backgroundPositionY = '-240px';
                }
            })
            voice.addEventListener('mouseleave',function () {
                if(voiceBtn.style.top == '82px' || voiceBtn.style.top == '83px') {
                    voice.style.backgroundPositionX = '48px';
                    voice.style.backgroundPositionY = '-61px';
                }else{
                    voice.style.backgroundPositionX = '0px';
                    voice.style.backgroundPositionY = '-240px';
                }
            })
        }
    }

    var end = function(e) {
        ifBool = false;
    }
    //鼠标按下方块
    voiceBtn.addEventListener("touchstart", start);
    voiceBtn.addEventListener("mousedown", start);
    //拖动
    window.addEventListener("touchmove", move);
    window.addEventListener("mousemove", move);
    //鼠标松开
    window.addEventListener("touchend", end);
    window.addEventListener("mouseup", end);
    //获取元素的绝对位置
    function getPosition(node) {
        var left = node.offsetLeft; //获取元素相对于其父元素的left值var left

        var top = node.offsetTop;
        current = node.offsetParent; // 取得元素的offsetParent
        // 一直循环直到根元素

        while(current != null) {
            left += current.offsetLeft;

            top += current.offsetTop;
            current = current.offsetParent;
        }

        return {
            "left": left,
            "top": top
        };
    }
}
})();