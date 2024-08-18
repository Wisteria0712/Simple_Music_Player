$(() => {
    //初始化音乐信息
    const musics = [
        {
            audio: '../audio/张韶涵 - 暮色回响.flac',
            bg: '../images/bg/bg-暮色回响-张韶涵.png',
            record: '../images/record/record-暮色回响.jpg',
            name: '暮色回响',
            singer: '张韶涵',
            lyrics: '../lyrics/张韶涵 - 暮色回响.lrc',
        },
        {
            audio: '../audio/洛天依 - I LOVE U.flac',
            bg: '../images/bg/bg-此刻Memories-洛天依.png',
            record: '../images/record/record-I LOVE U-洛天依.jpg',
            name: 'I LOVE U',
            singer: '洛天依',
            lyrics: '../lyrics/洛天依 - I LOVE U.lrc',
        },
        {
            audio: '../audio/洛天依 - 我们都拥有海洋.flac',
            bg: '../images/bg/bg-我们都拥有海洋-洛天依.png',
            record: '../images/record/record-我们都拥有海洋-洛天依.jpg',
            name: '我们都拥有海洋',
            singer: '洛天依',
            lyrics: '../lyrics/洛天依 - 我们都拥有海洋.lrc',
        },
        {
            audio: '../audio/洛天依 - 歌行四方.flac',
            bg: '../images/bg/bg-歌行四方-洛天依.png',
            record: '../images/record/record-歌行四方-洛天依.jpg',
            name: '歌行四方',
            singer: '洛天依',
            lyrics: '../lyrics/洛天依 - 歌行四方.lrc',
        },
        {
            audio: '../audio/洛天依 - 此刻Memories (洛天依ver).flac',
            bg: '../images/bg/bg-此刻Memories-洛天依.png',
            record: '../images/record/record-此刻Memories-洛天依.jpg',
            name: '此刻Memories',
            singer: '洛天依',
            lyrics: '../lyrics/洛天依 - 此刻Memories.lrc',
        },
    ];

    let num = 0;

    //播放列表模块
    (function () {
        let str = musics.map(function (ele, index) {
            return `
                <button type="button" class="list-group-item list-group-item-action music" data-id=${index} aria-current="false">${ele.name}</button>
            `;
        }).join('');
        $('#list-group').html(str);
    })();

    //初始化播放
    function initPlay(num) {
        //唱片旋转复位以及修改唱片图片
        $('#disk_image').removeClass('played').addClass('paused').attr('src', `${musics[num].record}`);
        //背景图片切换
        $('#bgImage').css({'background-image': `url(${musics[num].bg})`});
        //音乐播放状态
        document.getElementById('player').pause();
        //歌曲换源
        $('#player').eq(0).attr('src', `${musics[num].audio}`);
        //播放按钮初始化
        $('#play_btn').removeClass('icon_stop_btn').addClass('icon_play_btn');
        //歌曲名称初始化
        $('.music_name').text(musics[num].name);
        //歌手初始化
        $('.music_singer').text(musics[num].singer);
        //歌单当前播放设置
        $('#list-group').children().eq(num).addClass('active').siblings().removeClass('active');
        //初始化歌词
        lyricsLode(musics[num].lyrics);
        //将歌词滚动复位


        // 重置歌词同步状态
        $('#lyrics_contents').css({'transform': 'translateY(0)'}).children().removeClass('active_sentence');
        //$('#lyrics_contents');
    }

    initPlay(num);

    //时间进度模块
    // 获取音频元素和显示当前时间的元素
    const totalTime = $("#total");
    let current = $("#current");
    let audioPlayer = document.getElementById('player');

    //获取音乐总时长
    audioPlayer.addEventListener('canplaythrough', getTotal);

    function getTotal() {
        let duration = audioPlayer.duration;
        let minutes = parseInt(duration / 60);
        let seconds = parseInt(duration % 60);
        let m = minutes >= 10 ? minutes : '0' + minutes;
        let s = seconds >= 10 ? seconds : '0' + seconds;
        let total = m + ':' + s;
        totalTime.text(total);
        return duration;
    }

    // 每秒更新当前时间以及进度条
    function getCurrentTime() {
        //更新当前时间
        let currentTime = audioPlayer.currentTime;
        let minutes = parseInt(currentTime / 60);
        let seconds = parseInt(currentTime % 60);
        let m = minutes >= 10 ? minutes : '0' + minutes;
        let s = seconds >= 10 ? seconds : '0' + seconds;
        let currents = m + ':' + s;
        current.text(currents);
        //更新进度条
        changeRuler(currentTime);
    }

    //更新当前进度条
    function changeRuler(currentTime) {
        let progress = ((currentTime / getTotal()) * 100).toFixed(2) + '%';
        console.log(progress);
        $('#cursor').css({'width': progress});
    }

    //点击进度条跳转到指定点播放
    const ruler = $('#ruler');
    ruler.on('mousedown', function (event) {
        if (!audioPlayer.paused || audioPlayer.currentTime != 0) {
            let pgsWidth = parseFloat($(ruler).css('width').replace('px', ''));
            let rate = event.offsetX / pgsWidth;
            audioPlayer.currentTime = audioPlayer.duration * rate;
            changeRuler(audioPlayer.currentTime);
        }
    });

    let intervalId = setInterval(getCurrentTime, 1000);

    //音乐播放结束
    audioPlayer.addEventListener('ended', function () {
        //清除计时器
        clearInterval(intervalId);
        //唱片停止旋转
        $('#disk_image').removeClass('played').addClass('paused');
        //播放按钮更改状态
        $('#play_btn').toggleClass('icon_stop_btn');
        //进度条复位
        $('#cursor').css({'width': '0%'});
        //检测播放模式并执行对应操作
        getStatus();
        // 重置歌词同步状态
        $('#lyrics_contents').css({'transform': 'translateY(0)'}).children().removeClass('active_sentence');
    });

    // 如果音频加载失败，清除定时器
    audioPlayer.addEventListener('error', function () {
        clearInterval(intervalId);
        alert("音乐文件出现问题！");
    });

    //播放/暂停按钮部分
    $('#play_btn').click(function () {
        //切换按钮样式
        $(this).toggleClass('icon_stop_btn');
        //切换唱片状态(停止or旋转)
        $('#disk_image').toggleClass('played');
        //播放歌曲
        const player = document.getElementById('player');
        if (player.paused) {
            player.play();
            //重置当前时间
            intervalId = setInterval(getCurrentTime, 1000);
        } else {
            player.pause();
        }
    });

    //播放状态部分
    //数据初始化
    const status = ['../images/mode1.png', '../images/mode2.png', '../images/mode3.png'];
    //切换状态
    let status_id = 0;
    $('#status_btn').click(() => {
        status_id++;
        if (status_id === status.length) {
            status_id = 0;
        }
        $('#status_btn').css({'background-image': `url(${status[status_id]})`});
    });

    //状态监测并执行对应操作
    function getStatus() {
        const play_btn = $('#play_btn');
        switch (status_id) {
            //循环播放模式
            case 0:
                play_btn.trigger('click');
                break;
            //顺序播放模式
            case 1:
                //相当于一直点击下一首
                $('#next_btn').trigger('click');
                play_btn.trigger('click');
                break;
            //随机播放模式
            case 2:
                randomPlay();
                initPlay(num);
                play_btn.trigger('click');
                break;
        }
    }

    //随机播放功能
    function randomPlay() {
        let id = parseInt(Math.random() * (musics.length));
        while (id === num) {
            id = parseInt(Math.random() * (musics.length));
        }
        num = id;
    }

    //倍速模块
    //数据初始化
    const speeds = ['1.0', '1.5', '2.0', '0.5'];
    //切换状态
    let speed_id = 0;
    $('#speed').click(() => {
        speed_id++;
        if (speed_id === status.length + 1) {
            speed_id = 0;
        }
        $('#speed').text(speeds[speed_id] + 'X');
        //调用audio的API实现播放速度切换
        audioPlayer.playbackRate = speeds[speed_id];
    });

    //切歌模块
    (function () {
        //下一首
        $('#next_btn').click(() => {
            num++;
            if (num === musics.length) {
                num = 0;
            }
            initPlay(num);
            //lyricsLode(musics[num].lyrics);
            //当前时间初始化
            getCurrentTime();
        })
        //上一首
        $('#prev_btn').click(() => {
            num--;
            if (num < 0) {
                num = musics.length - 1;
            }
            initPlay(num);
            //lyricsLode(musics[num].lyrics);
            //当前时间初始化
            getCurrentTime();
        });
    })();

    //通过歌曲列表实现切换歌曲
    $('#list-group').on('click', 'button', function () {
        initPlay($(this).attr('data-id'));
    });

    //音量控制模块
    (function () {
        //当点击音量图标，切换状态,同时将音量设置为0
        const loudness_icon = $('#loudness_icon');
        const loudness_ruler_bar = $('.loudness_ruler_bar');
        let status = 0;
        loudness_icon.on('click', function () {
            $(this).toggleClass('close_voice');
            if (document.querySelector('#loudness_icon').classList.contains('close_voice')) {
                audioPlayer.volume = 0;
            } else {
                audioPlayer.volume = (parseInt(loudness_ruler_bar.val()) / 100).toFixed(2);
            }
        })
        //当拖动音量条时改变音量
        loudness_ruler_bar.on('change', function () {
            audioPlayer.volume = ((loudness_ruler_bar.val()) / 100).toFixed(2);
            console.log('当前音量:' + ((loudness_ruler_bar.val()) / 100).toFixed(2));
            //当音量为零时，自动切换音量图标状态
            if (!audioPlayer.volume) {
                document.querySelector('#loudness_icon').className = 'close_voice';
            } else {
                document.querySelector('#loudness_icon').className = 'open_voice';
            }
        })
    })();

    //键盘检测模块（通过空格键可以进行播放与暂停）
    document.addEventListener('keyup', (e) => {
        if (e.keyCode === 32) {
            $('#play_btn').trigger('click');
        }
    });

    //歌词模块
    /*
    总体思路：
    1.获取歌词；
    2.解析歌词；
    3.打印歌词；
    4.同步歌词；
    * */
    function lyricsLode(lrcPath) {
        // 清空之前的歌词
        let lycArr = [];
        $('#lyrics_contents').empty();

        // 发起请求获取歌词文件
        axios.get(lrcPath).then(function (response) {
            // 确保响应的文本是字符串
            let lyricsText = response.data;
            // 解析歌词文本
            let lyricsLines = lyricsText.split('\n');
            lyricsLines.forEach(function (line) {
                let matches = line.match(/\[(\d+:\d+\.\d+)\](.*)/);
                if (matches && matches.length >= 3) {
                    let timeStr = matches[1];
                    let minutes = parseInt(timeStr.split(':')[0], 10);
                    let seconds = parseFloat(timeStr.split(':')[1]);
                    let time = minutes * 60 + seconds;
                    let text = matches[2].trim();
                    if (text) {
                        lycArr.push({time: time, line: text});
                    }
                }
            });

            // 渲染歌词
            let lyricsHtml = lycArr.map(function (lyric, index) {
                return `<li class="sentence" data-order="${index}">${lyric.line}</li>`;
            }).join('');
            $('#lyrics_contents').html(lyricsHtml);

            //歌词同步
            // 高亮显示当前歌词
            function synchronizeLyrics(curTime) {
                for (let i = 0; i < lycArr.length; i++) {
                    if (curTime >= lycArr[i].time && (!lycArr[i + 1] || curTime < lycArr[i + 1].time)) {
                        $('#lyrics_contents').children().eq(i).addClass('active_sentence').siblings().removeClass('active_sentence');
                        break;
                    }
                }
            }


            //歌词滚动（可以使用css中的过渡来做）
            function lyricsScroll() {
                //只用当满足高亮语句在特定位置才执行位移操作
                if ($('.active_sentence').attr("data-order") > 6) {
                    console.log('执行位移');
                    $('#lyrics_contents').css({'transform': `translateY(${-40 * ($('.active_sentence').attr("data-order") - 6)}px)`});
                }
            }

            audioPlayer.addEventListener('timeupdate', function () {
                let curTime = parseFloat(audioPlayer.currentTime.toFixed(3));
                //高亮显示
                synchronizeLyrics(curTime);
                //歌词滚动
                lyricsScroll();
            });
        }).catch(function (error) {
            console.error('加载歌词失败:', error);
        });
    }

    // 当鼠标进入歌词区域时，除了重置transform，还需要重置歌词同步
    $('#lyrics').on('mouseenter', function () {
        //$('#lyrics_contents').css({'transform': 'translateY(0)'}).children().removeClass('active_sentence');
    });
});