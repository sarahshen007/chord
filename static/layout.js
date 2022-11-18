// FILE FOR layout.html

/* GENERAL */

// goes to page based on data stored as attributes in the clickable item
// @param clickedItem - any item that is clickable (has the .clickable class)
export function goToPage(clickedItem) {

    // get the clickedItem's type
    //      type can be 'song', 'artist', 'podcast', 'album', 'playlist'
    const type = $(clickedItem).data('type')

    // get the clickedItem's id
    const id = $(clickedItem).data('id')

    // go to info page for /type/id
    //      ex: /artist/0928340918
    window.location.href = '/'+type+'/'+id
}

// gets random color
// @returns string containing css rgb code
export function getRandomColor() {
    var colorR = Math.floor((Math.random() * 256));
    var colorG = Math.floor((Math.random() * 256));
    var colorB = Math.floor((Math.random() * 256));

    return "rgb(" + colorR + "," + colorG + "," + colorB + ")"
}

// gets time formatted as minutes : seconds
// @params time - integer representing seconds
// @returns min : sec
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


// creates music card in specified container for a specific music item
// @params
//      container - jQuery element representing outer container to append the card to
//      names - array [item-name, item-creator-name] e.g. ['Shake It Off', 'Taylor Swift']
//      id - string representing item's id
//      type - string representing item's type e.g. 'song'
export function createMusicCard(container, names, id, type='') {
    let musicCard = $('<div class="music-card"></div>');                                            // music card representing item
    let musicArt = $('<div class="music-art"></div>').css("background-color", getRandomColor());    // music art with random color
    let musicName = $('<div class="music-name"></div>').html(names[0]);                             // music name showing item-name
    let musicCreator = $('<div class="music-creator"></div>').html(names[1]);                       // music creator showing item-creator-name


    // store item's data in music card's attributes
    musicCard.attr('data-id', id);          // store id
    musicCard.attr('data-type', type);      // store type
    musicCard.attr('data-name', names[0])   // store name
    musicCard.addClass('clickable');        // indicate that the card is clickable (it goes to an info page)


    // add click handler to go to item's info page
    musicCard.on('click', function() {
        event.stopPropagation();
        goToPage(musicCard)
    })


    // if the type of the item is not an artist
    // the music card needs a play button because it can be played, i.e. song, album, or playlist
    if (type == 'song' || type == 'album' || type == 'playlist') {
        let playButton = $('<div class="play-btn-2"><div class="play-btn-icon-2">▷</div></div>');   //  play button
        musicArt.append(playButton);                                                                //  add play button to music art div
        playButton.attr('data-id', id);                                                             // store item id in play button

        // when the play button is clicked, add the item to queue and play the first thing in the item
        playButton.on('click', function() {

            // ajax call to enqueue item using type and id 
            // @result dictionary result 
            //      result = {
            //          'Insertion': new queue,
            //          'Num': new number in queue,
            //      }
            // each tuple in the queue is formatted as such:
            //      tuple[0] is the name of the song
            //      tuple[1] is the song id
            //      tuple[2] is the song's artist's name
            $.ajax({
                type: "POST",
                url: "/enqueue_" + type + "/" + playButton.attr('data-id'),
                dataType : "json",
                contentType: "application/json",
                success: function(result) {
                    console.log(result);

                    queue = result['Insertion']     // set queue to new queue after insertion
                    q_num = result['Num']           // set q_num to new q_num after insertion
                    setMusic(q_num)                 // set music to new q_num in queue
                    btnPause()                      // play music
                }
            })
            event.stopPropagation()
        })
    } else if (type == 'artist') {
        musicArt.addClass('profile-pic')            // if artist, add class profile pic to make the picture round
    }

    // add all parts to the card
    musicCard.append(musicArt);
    musicCard.append(musicName);
    musicCard.append(musicCreator);

    // add the card to the container
    container.append(musicCard);
}


// creates music list card (like a card, but it is in list form, i.e. horizontal and long) in specified container for a specific music item
// @params
//      container - jQuery element representing outer container to append the card to
//      names - array [item-name, item-creator-name] e.g. ['Shake It Off', 'Taylor Swift']
//      id - string representing item's id
//      type - string representing item's type e.g. 'song'
//      add_btn - integer representing what type of button the list card needs
//          0 => no button, 1 => add-btn, 2 => del-btn
//      index - integer representing the index in the list that the corresponding item is in, if it is not in a corresponding list, the index defaults to -1
export function createMusicListCard(container, names, id, type='', add_btn=0, index=-1) {
    let musicCard = $('<div class="music-card-list"></div>');                                               // music list card representing the item
    let musicArt = $('<div class="music-art-list"></div>').css("background-color", getRandomColor());       // music art with random color
    let musicName = $('<div class="music-name-list"></div>').html(names[0]);                                // music name showing item-name
    let musicCreator = $('<div class="music-creator-list"></div>').html(names[1]);                          // music creator showing item-creator-name

    // store item's data in music card's attributes
    musicCard.attr('data-id', id);          // store id
    musicCard.attr('data-type', type);      // store type
    musicCard.attr('data-name', names[0])   // store name
    musicCard.attr('data-index', index)     // store index
    musicCard.addClass('clickable');        // indicate that the card is clickable (it goes to an info page)

    // add click handler to go to item's info page
    musicCard.on('click', function() {
        event.stopPropagation()
        goToPage(musicCard)
    })

    // if the type of the item is not an artist
    // the music list card needs a play button because it can be played, i.e. song, album, or playlist
    if (type == 'song' || type == 'album' || type == 'playlist') {
        let playButton = $('<div class="play-btn-2-list"><div class="play-btn-icon-2"><i class="bi bi-play"></i></div></div>');    // play button
        musicArt.append(playButton);                                                                                               // add play button to music art div
        playButton.attr('data-id', id);                                                                                            // store item id in play button

        // when the play button is clicked, add the item to queue and play the first thing in the item
        playButton.on('click', function() {

            // ajax call to enqueue item using type and id 
            // @result dictionary result 
            //      result = {
            //          'Insertion': new queue,
            //          'Num': new number in queue,
            //      }
            // each tuple in the queue is formatted as such:
            //      tuple[0] is the name of the song
            //      tuple[1] is the song id
            //      tuple[2] is the song's artist's name
            $.ajax({
                type: "POST",
                url: "/enqueue_" + type + "/" + playButton.attr('data-id'),
                dataType : "json",
                cache: true,
                contentType: "application/json",
                success: function(result) {
                    console.log(result);
                    queue = result['Insertion']     // set queue to new queue after insertion
                    q_num = result['Num']           // set q_num to new q_num after insertion
                    setMusic(q_num)                 // set music to new q_num in queue
                    btnPause();                     // play music
                }
            })
            event.stopPropagation()
        })
    } else if (type == 'artist') {
        musicArt.addClass('profile-pic')            // if artist, add class profile pic to make the picture round
    }

    // add all parts to the card
    musicCard.append(musicArt);
    musicCard.append(musicName);
    musicCard.append(musicCreator);

    // add card to the container
    const wrapper = $('<div class="addable-wrapper"></div>')

    // if the item needs an add button (because it is in edit_playlists's search results)
    if (add_btn == 1) {
        
        const button = $('<button class="btn pedit-btn add-btn">+</button>')    // construct add button
        button.attr('data-id', id);                                             // store item id
        button.attr('data-type', type);                                         // store item type
        button.attr('data-name', names[0])                                      // store item name
        button.attr('data-index', index)                                        // store item index in list
        button.attr('data-creator', names[1])                                   // store item's creator's name

        wrapper.append(button)      // add button to wrapper
        wrapper.append(musicCard)   // add music list card to wrapper
        container.append(wrapper)   // add wrapper to outer container
    } 
    
    // else if the item needs a del button (because it is in edit_playlist's songs list)
    else if (add_btn == -1) {
        const button = $('<button class="btn pedit-btn del-btn">-</button>')    // construct del button
        button.attr('data-id', id);                                             // store item id
        button.attr('data-type', type);                                         // store item type
        button.attr('data-name', names[0])                                      // store item name
        button.attr('data-index', index)                                        // store item index in list
        button.attr('data-creator', names[1])                                   // store item's creator's name

        wrapper.append(button)      // add button to wrapper
        wrapper.append(musicCard)   // add music list card to wrapper
        container.append(wrapper)   // add wrapper to outer container
    } 
    else {
        container.append(musicCard); // add music list card to outer container
    }
}

//  for creating clickable sidebar playlist names
//  @param container - jquery element to add item to
//  @param name - string representing item name
//  @param id - string representing item id
export function createPlaylistItem(container, name, id) {
    let playlistName = $('<div class="sidebar-playlist-name"></div>').html(name);   // construct playlist name item
    playlistName.attr('data-id', id)                                                // store item id
    playlistName.attr('data-type', 'playlist')                                      // store item type
    playlistName.addClass('clickable')                                              // make item clickable

    // event handler on click go to info page
    playlistName.on('click', function() {
        goToPage(this)
    })

    // add playlist name item to outer container
    container.append(playlistName);
}

// toggle following button
// @param button element that is being toggled
export function toggleFollowing(button) {
    
    // if currently the button item is being followed
    if (button.attr('data-following') == '1') {

        // 
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

export function populateCardContainer(container, iterable, type) {
    for (let i = 0; i < iterable.length; i++) {
        const item = iterable[i]
        
        createMusicCard($(container), [item[0], item[2]], item[1], type)
    }
}

export function populateListCardContainer(container, iterable, type, add_btn = 0) {
    container.empty()
    for (let i = 0; i < iterable.length; i++) {
        const item = iterable[i]
        
        createMusicListCard($(container), [item[0], item[2]], item[1], type, add_btn, i)
    }
}

export function toggleLike(button) {
    
    if (button.attr('data-liked') == '1') {
        $.ajax({
            type: 'POST',
            url: "/dislike_" + button.data('type') + "/"+button.data('id'),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(result){
                console.log(result)
                constructLikedButton(button, 0, button.data('id'), button.data('type'))
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
            url: "/like_" + button.data('type') + "/"+button.data('id'),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(result){
                console.log(result)
                constructLikedButton(button, 1, button.data('id'), button.data('type'))
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

export function constructLikedButton(likedButton, isLiked, id, type) {
    likedButton.attr('data-id', id)
    likedButton.attr('data-type', type)
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

export function setLikedButton(button, id, type) {
    $.ajax({
        type: 'POST',
        url: "/is_liked_" + type + "/" + id,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        success: function(result){
            constructLikedButton(button, result, id, type)
        },
        error: function(request, status, error){
            console.log("Error");
            console.log(request)
            console.log(status)
            console.log(error)
        }
    });
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

    setLikedButton($("#like-btn-icon"), queue[i][1], 'song');

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
    window.location.href="/user/" + user.user_id
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

export function goToEditPlaylist(pid) {
    window.location.href = '/edit_playlist/' + pid
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

function myOnLoadedData() {
    setMusic(q_num);
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
    $("#new-playlist-btn").on('click', function() {
        goToEditPlaylist("new")
    });

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