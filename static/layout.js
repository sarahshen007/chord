/* PLAYER JS*/
let currentMusic = 0;
const music = document.querySelector('#audio');

const seekBar = $('.seek-bar');
const songName = $('#song-name');
const artistName = $('#artist-name');
const albumArt = $('#album-art');
const currentTime = $('.current-time');
const musicDuration = $('.song-duration');
const playBtn = $('.play-btn');
const forwardBtn = $('.forward-btn');
const backwardBtn = $('.back-btn');
const playBtnIcon = $('#play-btn-icon')

function populateQueue() {
    console.log("Populating queue");
    let new_songs = []
    $.ajax({
        type: "POST",
        url: "/song_recommendations",                
        dataType : "json",
        cache: true,
        contentType: "application/json",
        data : JSON.stringify(user),
        success: function(result){
            for (let i = 0; i < result['recommended_songs'].length; i++) {
                new_songs.push(result['recommended_songs'][i]);
            }
        },
        error: function(request, status, error){
            console.log("Error");
            console.log(request)
            console.log(status)
            console.log(error)
        },
        complete: function(){
            for (let i = 0; i < new_songs.length; i++) {
                $.ajax({
                    type: "POST",
                    url:"/enqueue_song",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify(new_songs[i][1]),
                    success: function(result){
                        console.log("Song successfully enqueued");
                        queue = result['Insertion'];
                    },
                    error: function(request, status, error){
                        console.log("Error");
                        console.log(request)
                        console.log(status)
                        console.log(error)
                    },
                    complete: function() {
                        console.log("New Queue:")
                        console.log(queue);
                        setMusic(0);
                    }
                });
            }
        }
    });
}


function setMusic(i) {
    console.log("Setting music");

    // set range slide value to 0;
    music.currentTime = 0;
    seekBar.attr('value', 0);
    let song = queue[i];

    currentMusic = i;

    songName.html(song[0]);
    artistName.html(song[2]);
    var colorR = Math.floor((Math.random() * 256));
    var colorG = Math.floor((Math.random() * 256));
    var colorB = Math.floor((Math.random() * 256));

    $(albumArt).css("background-color", "rgb(" + colorR + "," + colorG + "," + colorB + ")");

    currentTime.html('00:00');
    setTimeout(() => {
        seekBar.attr('max', music.duration);
        musicDuration.html(formatTime(music.duration));
    }, 300);
}


function formatTime (time) {
    console.log("Formatting Time");

    let min = Math.floor(time / 60);
    if(min < 10){
        min = `0${min}`;
    }
    let sec = Math.floor(time % 60);
    if(sec < 10){
        sec = `0${sec}`;
    }
    return `${min} : ${sec}`;
}

function btnPause() {
    console.log("Switching button to pause");

    playBtnIcon.removeClass("bi-play");
    playBtnIcon.addClass("bi-pause");
    playBtn.removeClass("paused");    

    music.play();
}

function btnPlay() {
    console.log("Switching button to play");

    playBtnIcon.addClass("bi-play");
    playBtnIcon.removeClass("bi-pause");
    playBtn.addClass("paused");   

    music.pause();
}

$(document).ready(function() {
    console.log(queue);

    if (queue.length == 0) {
        populateQueue();
        btnPlay();
    } else {
        setMusic(0);
        btnPlay();
    }

    playBtn.click(function() {
        console.log("Play/pause button was clicked");

        if (queue.length > 0) {
            if (playBtn.hasClass("paused")) {
                btnPause();
            } else {
                btnPlay();
            }
        }
    });

    setInterval(() => {
        console.log("Setting interval");

        seekBar.attr('value', music.currentTime);
        currentTime.html(formatTime(music.currentTime));
        if(Math.floor(music.currentTime) == Math.floor(seekBar.attr('max'))){
            forwardBtn.click();
        }
    }, 200);

    seekBar.on("input",function(e){
        console.log("Seekbar change in input");

        music.currentTime = this.value;
        if (playBtn.hasClass("paused")){
            music.pause();
        } else {
            music.play();
        }
    });

    forwardBtn.click(function (){
        console.log("Forward button clicked");

        if (queue.length > 0) {
            if (currentMusic >= queue.length - 1) {
                currentMusic = 0;
            } else {
                currentMusic++;
            }
            setMusic(currentMusic);
            if (playBtn.hasClass("paused")){
                music.pause();
                btnPlay();
            } else {
                music.play();
                btnPause();
            }
        }
    });

    backwardBtn.click(function () {
        console.log("Backward button clicked");

        if (queue.length > 0) {
            if (currentMusic <= 0) {
                currentMusic = queue.length - 1;
            } else {
                currentMusic--;
            }
            setMusic(currentMusic);
            if (playBtn.hasClass("paused")){
                btnPlay();
            } else {
                btnPause();
            }
        }
    });
})