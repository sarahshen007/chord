/* GENERAL */

export function goToPage(clickedItem) {
    const type = $(clickedItem).data('type')
    const id = $(clickedItem).data('id')

    window.location.href = '/'+type+'/'+id
}

export function getRandomColor() {
    var colorR = Math.floor((Math.random() * 256));
    var colorG = Math.floor((Math.random() * 256));
    var colorB = Math.floor((Math.random() * 256));

    return "rgb(" + colorR + "," + colorG + "," + colorB + ")"
}

export function formatTime (time) {
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

export function createMusicCard(container, names, id, type='') {
    let musicCard = $('<div class="music-card"></div>');
    let musicArt = $('<div class="music-art"></div>').css("background-color", getRandomColor());
    let musicName = $('<div class="music-name"></div>').html(names[0]);
    let musicCreator = $('<div class="music-creator"></div>').html(names[1]);

    musicCard.attr('data-id', id);
    musicCard.attr('data-type', type);
    musicCard.addClass('clickable');

    musicCard.on('click', function() {
        goToPage(musicCard)
    })

    if (type == 'song' || type == 'album' || type == 'playlist') {
        let playButton = $('<div class="play-btn-2"><div class="play-btn-icon-2">▷</div></div>');
        musicArt.append(playButton);
        playButton.attr('data-id', id);

        playButton.on('click', function() {
            $.ajax({
                type: "POST",
                url: "/enqueue_" + type + "/" + playButton.attr('data-id'),
                dataType : "json",
                cache: true,
                contentType: "application/json",
                success: function(result) {
                    console.log(result);
                    queue = result['Insertion']
                    q_num = result['Num']
                    setMusic(q_num)
                    btnPause()
                }
            })
            event.stopPropagation()
        })
    } else if (type == 'artist') {
        musicArt.addClass('profile-pic')
    }

    musicCard.append(musicArt);
    musicCard.append(musicName);
    musicCard.append(musicCreator);

    container.append(musicCard);
}

export function createMusicListCard(container, names, id, type='') {
    let musicCard = $('<div class="music-card-list"></div>');
    let musicArt = $('<div class="music-art-list"></div>').css("background-color", getRandomColor());
    let musicName = $('<div class="music-name-list"></div>').html(names[0]);
    let musicCreator = $('<div class="music-creator-list"></div>').html(names[1]);

    musicCard.attr('data-id', id);
    musicCard.attr('data-type', type);
    musicCard.addClass('clickable');

    musicCard.on('click', function() {
        goToPage(musicCard)
    })

    if (type == 'song' || type == 'album' || type == 'playlist') {
        let playButton = $('<div class="play-btn-2-list"><div class="play-btn-icon-2"><i class="bi bi-play"></i></div></div>');
        musicArt.append(playButton);
        playButton.attr('data-id', id);

        playButton.on('click', function() {
            $.ajax({
                type: "POST",
                url: "/enqueue_" + type + "/" + playButton.attr('data-id'),
                dataType : "json",
                cache: true,
                contentType: "application/json",
                success: function(result) {
                    console.log(result);
                    queue = result['Insertion']
                    q_num = result['Num']
                    setMusic(q_num)
                    btnPause();
                }
            })
            event.stopPropagation()
        })
    } else if (type == 'artist') {
        musicArt.addClass('profile-pic')
    }

    musicCard.append(musicArt);
    musicCard.append(musicName);
    musicCard.append(musicCreator);

    container.append(musicCard);
}

export function createPlaylistItem(container, name, id) {
    let playlistName = $('<div class="sidebar-playlist-name"></div>').html(name);
    playlistName.attr('data-id', id)
    playlistName.attr('data-type', 'playlist')
    playlistName.addClass('clickable')

    playlistName.on('click', function() {
        goToPage(this)
    })

    container.append(playlistName);
}

export function toggleFollowing(button) {
    
    if (button.attr('data-following') == '1') {
        $.ajax({
            type: 'POST',
            url: "/unfollow_"+button.data('type')+"/" + button.data('id'),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(result){
                console.log(result)
                constructFollowButton(button, 0, button.data('id'), button.data('type'))
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
            url: "/follow_"+button.data('type')+'/'+button.data('id'),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(result){
                console.log(result)
                constructFollowButton(button, 1, button.data('id'), button.data('type'))
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

export function isFollowing(id, type) {
    let following = 0
    $.ajax({
        type: "GET",
        url: "/follows_" + type + "/" + id,
        dataType : "json",
        cache: true,
        async: false,
        contentType: "application/json",
        success: function(result) {
            console.log(result);
            following= result
        }
    })
    return following
}

export function constructFollowButton(followButton, isFollowing, id, type) {
    followButton.attr('data-id', id)
    followButton.attr('data-following', isFollowing)
    followButton.attr('data-type', type)

    followButton.off();
    followButton.on('click', function() {
        toggleFollowing(followButton);
    })

    if (isFollowing) {
        followButton.html("Following")
    }
    else {
        followButton.html("Follow")
    }
}

/* PLAYER JS*/
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

function set_q_num(i) {
    $.ajax({
        type: 'POST',
        url: "/set_q_num",
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(q_num),
        success: function(result) {
            console.log(result);
        }
    });
}

function setMusic(i) {
    console.log("Setting song to", queue[i]);
    music.currentTime = 0;
    let song = queue[i];

    q_num = i;
    set_q_num(i);

    setLikedButton(queue[i][1]);

    songName.html(song[0]);

    artistName.html(song[2]);
    artistName.attr('data-id', queue[i][3])
    artistName.attr('data-type', 'artist')

    $(albumArt).css("background-color", getRandomColor());
    albumArt.attr('data-id', queue[i][5])
    albumArt.attr('data-type', 'album')

    currentTime.html('00:00');
    seekBar.attr('max', music.duration);
    musicDuration.html(formatTime(music.duration));
}

function btnPause() {
    playBtnIcon.removeClass("bi-play");
    playBtnIcon.addClass("bi-pause");
    playBtn.removeClass("paused");    

    music.play();
}

function btnPlay() {
    playBtnIcon.addClass("bi-play");
    playBtnIcon.removeClass("bi-pause");
    playBtn.addClass("paused");   

    music.pause();
}


/* LIKED */

function setLikedButton(song_id) {
    $.ajax({
        type: 'POST',
        url: "/is_liked/"+song_id,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        success: function(result){
            constructLikedButton($("#like-btn-icon"), result, song_id)
        },
        error: function(request, status, error){
            console.log("Error");
            console.log(request)
            console.log(status)
            console.log(error)
        }
    });
}

function toggleLike(button) {
    
    if (button.attr('data-liked') == '1') {
        $.ajax({
            type: 'POST',
            url: "/dislike_song/"+button.data('song-id'),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(result){
                console.log(result)
                constructLikedButton(button, 0, button.data('song-id'))
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
                console.log(result)
                constructLikedButton(button, 1, button.data('song-id'))
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
    likedButton.attr('data-liked', isLiked)

    likedButton.off();
    likedButton.on('click', function() {
        event.stopPropagation()
        toggleLike(likedButton);
    })

    if (isLiked) {
        likedButton.removeClass("bi-heart")
        likedButton.addClass("bi-heart-fill")
    }
    else {
        likedButton.addClass("bi-heart")
        likedButton.removeClass("bi-heart-fill")
    }
}

/* SIDEBAR FUNCTIONS */
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

function goToHome() {
    window.location.href='/'
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

function populateSideBarPlaylists() {
    $.ajax({
        type: 'GET',
        url: "/playlists/"+user.user_id,                
        dataType : "json",
        cache: true,
        contentType: "application/json",
        success: function(result){
            let playlists = result[user.user_id]

            for (let i = 0; i < playlists.length; i++) {
                createPlaylistItem($("#sidebar-playlists"), playlists[i][0], playlists[i][1]);
            }
        },
        error: function(request, status, error){
            console.log("Error");
            console.log(request);
            console.log(status);
            console.log(error);
        }
    });
}

/* WHEN DOC LOADS */
$(document).ready(function() {

    // ADD SIDEBAR LISTENERS
    $("#home-btn").on('click', goToHome);
    $("#profile-btn").on('click', goToProfile)
    $("#signout-btn").on('click', signout);
    $("#search-btn").on('click', goToSearch);
    $("#songs-btn").on('click', goToSongs);
    $("#artists-btn").on('click', goToArtists);
    $("#podcasts-btn").on('click', goToPodcasts);
    $("#playlists-btn").on('click', goToPlaylists);

    // POPULATE SIDEBAR PLAYLISTS
    populateSideBarPlaylists();

    // SET MUSIC INITIAL
    setMusic(q_num);
    btnPlay();

    playBtn.click(function() {
        if (queue.length > 0) {
            if (playBtn.hasClass("paused")) {
                btnPause();
            } else {
                btnPlay();
            }
        }
    });

    music.ontimeupdate = function () {
        seekBar.val(music.currentTime);
        currentTime.html(formatTime(music.currentTime));
        if(Math.floor(music.currentTime) >= Math.floor(seekBar.attr('max'))){
            forwardBtn.click();
        }
    }

    seekBar.change(function(e){
        music.currentTime = this.value;
        if (playBtn.hasClass("paused")){
            music.pause();
        } else {
            music.play();
        }
    });

    forwardBtn.click(function (){
        if (queue.length > 0) {
            if (q_num >= queue.length - 1) {
                q_num = 0;
            } else {
                q_num++;
            }
            
            if (playBtn.hasClass("paused")){
                music.pause();
                btnPlay();
            } else {
                music.play();
                btnPause();
            }
        }

        setMusic(q_num);
    });

    backwardBtn.click(function () {
        if (queue.length > 0) {
            if (q_num <= 0) {
                q_num = queue.length - 1;
            } else {
                q_num--;
            }
            
            if (playBtn.hasClass("paused")){
                btnPlay();
            } else {
                btnPause();
            }
        }

        setMusic(q_num);
    });    

})


$(document).ready(function() {
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})