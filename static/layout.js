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
const playBtnIcon = $('#play-btn-icon');

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
                        setMusic(0);
                    },
                    error: function(request, status, error){
                        console.log("Error");
                        console.log(request)
                        console.log(status)
                        console.log(error)
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
    let song = queue[i];

    currentMusic = i;

    let isLiked = false;
    console.log(queue[i][1])

    $.ajax({
        type: 'POST',
        url: "/is_liked/"+queue[i][1],
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        success: function(result){
            isLiked=result
            console.log("Is this song liked?")
            console.log(result)
            constructLikedButton($("#like-btn-icon"), isLiked, queue[i][1])
        },
        error: function(request, status, error){
            console.log("Error");
            console.log(request)
            console.log(status)
            console.log(error)
        }
    });

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
    }, 100);
}


function toggleLike(button) {
    
    if (button.attr('data-liked') == 'true') {
        $.ajax({
            type: 'POST',
            url: "/dislike_song/"+button.data('song-id'),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(result){
                constructLikedButton(button, false, button.data('song-id'))
            },
            error: function(request, status, error){
                console.log("Error");
                console.log(request)
                console.log(status)
                console.log(error)
            }
        });
    } else {
        $.ajax({
            type: 'POST',
            url: "/like_song/"+button.data('song-id'),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(result){
                constructLikedButton(button, true, button.data('song-id'))
            },
            error: function(request, status, error){
                console.log("Error");
                console.log(request)
                console.log(status)
                console.log(error)
            }
        });
    }
}

function constructLikedButton(likedButton, isLiked, song_id) {
    likedButton.attr('data-song-id', song_id)
    likedButton.on('click', function() {
        toggleLike(likedButton)
    });
    likedButton.attr('data-liked', isLiked)

    if (isLiked) {
        likedButton.removeClass("bi-heart")
        likedButton.addClass("bi-heart-fill")
    }
    else {
        likedButton.addClass("bi-heart")
        likedButton.removeClass("bi-heart-fill")
    }
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

function signout() {
    $.ajax({
        type: "POST",
        url: "/signout",                
        dataType : "json",
        cache: true,
        contentType: "application/json",
        success: function(result){
            user = result
            console.log(result);
        },
        error: function(request, status, error){
            console.log("Error");
            console.log(request);
            console.log(status);
            console.log(error);
        },
        complete: function(){
            window.location.href='/';
        }
    });
}

function goToProfile() {
    window.location.href="/profile/" + user.user_id
}

function goToSearch() {
    window.location.href="/search_page"
}

function goToSongs() {
    window.location.href="/my_songs"
}

function goToArtists() {
    window.location.href="/my_artists"
}

function goToPodcasts() {
    window.location.href="/my_podcasts"
}

function goToPlaylists() {
    window.location.href="/my_playlists"
}

$(document).ready(function() {
    console.log(queue);

    $("#home-btn").on('click', function() {
        window.location.href="/"
    });

    $("#profile-btn").on('click', goToProfile)

    $("#signout-btn").on('click', signout);

    $("#search-btn").on('click', goToSearch);

    $("#songs-btn").on('click', goToSongs);

    $("#artists-btn").on('click', goToArtists);

    $("#podcasts-btn").on('click', goToPodcasts);

    $("#playlists-btn").on('click', goToPlaylists);

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

    music.ontimeupdate = function () {
        console.log("Time update");
        seekBar.val(music.currentTime);
        // seekBar.attr('value', music.currentTime);
        currentTime.html(formatTime(music.currentTime));
        if(Math.floor(music.currentTime) >= Math.floor(seekBar.attr('max'))){
            forwardBtn.click();
        }
    }

    seekBar.change(function(e){
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