// FILE FOR layout.html
// music player, sidebar. always present on every page
// also contains important export functions

/* GENERAL FUNCTIONS */
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
// @param button - button element that is being toggled
export function toggleFollowing(button) {
    
    // if currently the button item is being followed
    if (button.attr('data-following') == '1') {

        // ajax call to unfollow item using type and id data from the button
        $.ajax({
            type: 'POST',
            url: "/unfollow_"+button.data('type')+"/" + button.data('id'),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(result){
                console.log(result)

                // reconstruct follow button as unfollowed
                constructFollowButton(button, 0, button.data('id'), button.data('type'))
            },
            error: function(request, status, error){
                console.log("Error");
                console.log(request)
                console.log(status)
                console.log(error)
            }
        });
    } 
    
    // else if the button item is currently not followed
    else {

        // ajax call to follow item using type and id data from the button
        $.ajax({
            type: 'POST',
            url: "/follow_"+button.data('type')+'/'+button.data('id'),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(result){
                console.log(result)

                // reconstruct follow button as followed
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

// get whether the item is followed or not
// @param id - item's id
// @param type - item's type
export function isFollowing(id, type) {

    // integer to represent whether user is following the item or not
    let following = 0

    // ajax call to get whether user is following the item or not
    // @result 0 or 1 (false or true)
    $.ajax({
        type: "GET",
        url: "/follows_" + type + "/" + id,
        dataType : "json",
        async: false,
        contentType: "application/json",
        success: function(result) {
            console.log(result);
            following= result // set following to result of call
        }
    })
    return following // return following 
}


// construct follow button
// @param followButton - the button element being modified
// @param isFollowing - 0 or 1 (false or true) indicating whether the user is following the item
// @param type - item type
export function constructFollowButton(followButton, isFollowing, id, type) {
    followButton.attr('data-id', id)                    // set id 
    followButton.attr('data-following', isFollowing)    // set following
    followButton.attr('data-type', type)                // set type

    followButton.off();                                 // turn off all previous handlers
    followButton.on('click', function() {               // event handler on click toggle following (follow -> followeing and vice versa)
        toggleFollowing(followButton);
    })

    if (isFollowing) {                                  // if following the item
        followButton.html("Following")                  // set html to display 'Following
    }
    else {
        followButton.html("Follow")                     // else set html to display "Follow"
    }
}


// populate container with music cards given an array of items and their type
// @param container - outer container to hold cards
// @param iterable - array of items to be made into cards
//      each item in array is structured as following:
//          [item_name, item_id, creator_name...]
// @param type - type of items
export function populateCardContainer(container, iterable, type) {
    for (let i = 0; i < iterable.length; i++) {                                 // loop through items
        const item = iterable[i]                                                // get item at index i
        
        createMusicCard($(container), [item[0], item[2]], item[1], type)        // create music card in container using item data
    }
}


// populate container with music list cards given an array of items and their type
// @param container - outer container to hold cards
// @param iterable - array of items to be made into cards
//      each item in array is structured as following:
//          [item_name, item_id, creator_name...]
// @param type - type of items
// @param add-btn - integer determining what type of button the list card needs
//      0 no button (default)
//      1 add button for adding song
//      2 del button for removing song
export function populateListCardContainer(container, iterable, type, add_btn = 0) {
    container.empty()                       
    for (let i = 0; i < iterable.length; i++) {                                             // loop through items
        const item = iterable[i]                                                            // get item at index i
        
        createMusicListCard($(container), [item[0], item[2]], item[1], type, add_btn, i)    // create music list card in container using item data, add_btn, and index
    }
}


// toggle like button
// @param button - button element that is being toggled
export function toggleLike(button) {
    
    // if button data indicates item is already liked
    if (button.attr('data-liked') == '1') {

        // ajax call to unlike item using type and id data from the button
        $.ajax({
            type: 'POST',
            url: "/dislike_" + button.data('type') + "/"+button.data('id'),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(result){
                console.log(result)

                // reconstruct like button as unliked
                constructLikedButton(button, 0, button.data('id'), button.data('type'))
            },
            error: function(request, status, error){
                console.log("Error");
                console.log(request)
                console.log(status)
                console.log(error)
            }
        });
    } 
    
    // else if the button item is currently not liked
    else {

        // ajax call to like item using type and id data from the button
        $.ajax({
            type: 'POST',
            url: "/like_" + button.data('type') + "/"+button.data('id'),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(result){
                console.log(result)

                // reconstruct like button as liked
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


// construct liked button
// @param likedButton - the button element being modified
// @param isLiked - 0 or 1 (false or true) indicating whether the user likes the item
// @param type - item type
export function constructLikedButton(likedButton, isLiked, id, type) {
    likedButton.attr('data-id', id)             // set id
    likedButton.attr('data-type', type)         // set type
    likedButton.attr('data-liked', isLiked)     // set liked

    likedButton.off();                          // turn off all previous handlers
    likedButton.on('click', function() {        // event handler on click toggles like
        event.stopPropagation()
        toggleLike(likedButton);
    })

    if (isLiked) {                              // if liked
        likedButton.removeClass("bi-heart")     // set icon to liked icon
        likedButton.addClass("bi-heart-fill")
    }
    else {                                      // if not liked
        likedButton.addClass("bi-heart")        // set icon to not liked icon
        likedButton.removeClass("bi-heart-fill")
    }
}

// get whether button status should be liked or not initially, then set button to respective status
// @param button - button element to be set
// @param id - corresponding item id
// @param type - corresponding item type
export function setLikedButton(button, id, type) {

    // ajax call to get whether item of type and id is liked by user
    // @result 0 or 1 (false or true) of whether given item is liked by user
    $.ajax({
        type: 'POST',
        url: "/is_liked_" + type + "/" + id,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        success: function(result){
            // construct liked button based on result
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

/* MUSIC PLAYER */
const music = document.querySelector('#audio'); // audio element containing mp3 file

const seekBar = $('.seek-bar');                 // seek bar for track
const songName = $('#song-name');               // current track's name
const artistName = $('#artist-name');           // current track's artist
const albumArt = $('#album-art');               // current track's art
const currentTime = $('.current-time');         // time in track
const musicDuration = $('.song-duration');      // current track's duration
const playBtn = $('.play-btn');                 // play button
const forwardBtn = $('.forward-btn');           // forward button
const backwardBtn = $('.back-btn');             // back button
const playBtnIcon = $('#play-btn-icon');        // icon of play button (<button> <i> </i> </button>)

// set queue number on server end
function set_q_num(i) {

    // ajax call to change q_num on server
    // @data q_num - number representing the index of the current track being played in the queue
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

// set music in music player given an index representing track in queue
// @global queue - array of arrays representing songs and their information
//      [song_name, song_id, artist_name, artist_id, album_name, album_id]
function setMusic(i) {

    console.log("Setting song to", queue[i]);


    music.currentTime = 0;      // set current time of song to 0
    let song = queue[i];        // set song to song at given index

    q_num = i;                  // set q_num to given index
    set_q_num(i);               // set q_num on server side to given index

    setLikedButton($("#like-btn-icon"), queue[i][1], 'song');       // set liked button depending on whether the user likes the song or not

    songName.html(song[0]);                                         // set track name

    artistName.html(song[2]);                                       // set track artist
    artistName.attr('data-id', queue[i][3])                         // set artist id
    artistName.attr('data-type', 'artist')                          // set artist type

    $(albumArt).css("background-color", getRandomColor());          // set art color to random color
    albumArt.attr('data-id', queue[i][5])                           // set art id to album id
    albumArt.attr('data-type', 'album')                             // set art type to album

    currentTime.html('00:00');                                      // set current time displayed to 00:00
    seekBar.attr('max', music.duration);                            // set seek bar's maximum value to music duration
    musicDuration.html(formatTime(music.duration));                 // set max duration displayed to music duration
}

// set button to pause
// means the music will start playing
function btnPause() {

    // change icon to paused
    playBtnIcon.removeClass("bi-play");
    playBtnIcon.addClass("bi-pause");

    // remove class paused
    playBtn.removeClass("paused");    

    // play music
    music.play();
}


// set button to play
// means the music will be paused
function btnPlay() {

    // change icon to play
    playBtnIcon.addClass("bi-play");
    playBtnIcon.removeClass("bi-pause");

    // add class paused
    playBtn.addClass("paused");   

    // pause music
    music.pause();
}

/* SIDEBAR */

// sign out user
function signout() {

    // ajax call to remove user info on server side
    // @result user =
    //      {
    //          'username': '',
    //          'user_id': ''
    //      }
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
            window.location.href='/';   // on completion redirect to login page
        }
    });
}

// go to home page
function goToHome() {
    window.location.href='/'
}

// go to profile page
function goToProfile() {
    window.location.href="/user/" + user.user_id
}

// go to search page
function goToSearch() {
    window.location.href="/search_page"
}

// go to my songs page
function goToSongs() {
    window.location.href="/my_songs"
}

// go to my artists page
function goToArtists() {
    window.location.href="/my_artists"
}

// go to my podcasts page
function goToPodcasts() {
    window.location.href="/my_podcasts"
}

// go to playlists page
function goToPlaylists() {
    window.location.href="/my_playlists"
}

// go to edit playlist page
export function goToEditPlaylist(pid) {
    window.location.href = '/edit_playlist/' + pid
}

// populate side bar with playlists
function populateSideBarPlaylists() {

    // ajax call to get playlists and populate #sidebar-playlists with clickable playlist names
    // @result result = {
    //              user_id: created_playlists
    //          }
    $.ajax({
        type: 'GET',
        url: "/playlists/"+user.user_id,                
        dataType : "json",
        cache: true,
        contentType: "application/json",
        success: function(result){
            let playlists = result[user.user_id]

            // loop through playlists created by user and make playlist items, add each one to sidebar
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

    // add sidebar click handlers
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

    // populate sidebar playlists
    populateSideBarPlaylists();

    // set music player to whatever q_num is
    setMusic(q_num);

    // pause the music and set the button display to play
    btnPlay();

    // event on click handler for play button
    // if play button gets clicked toggle music and button status
    playBtn.click(function() {
        if (queue.length > 0) {
            if (playBtn.hasClass("paused")) {
                btnPause();
            } else {
                btnPlay();
            }
        }
    });

    // update the seek bar when the music time updates
    music.ontimeupdate = function () {
        seekBar.val(music.currentTime);
        currentTime.html(formatTime(music.currentTime));
        if(Math.floor(music.currentTime) >= Math.floor(seekBar.attr('max'))){
            forwardBtn.click();
        }
    }

    // update current time in track when the seek bar is changed
    seekBar.change(function(e){
        music.currentTime = this.value;
        if (playBtn.hasClass("paused")){
            music.pause();
        } else {
            music.play();
        }
    });

    // event on click handler for forward button
    // if forward button is clicked, change q_num to represent next song index in queue
    forwardBtn.click(function (){
        if (queue.length > 0) {
            if (q_num >= queue.length - 1) {
                q_num = 0;
            } else {
                q_num++;
            }
            
            // toggle play button accordingly
            if (playBtn.hasClass("paused")){
                music.pause();
                btnPlay();
            } else {
                music.play();
                btnPause();
            }
        }

        // set music to new q_num
        setMusic(q_num);
    });

    // event on click handler for backward button
    // if backward button is clicked, change q_num to represent previous song index in queue
    backwardBtn.click(function () {
        if (queue.length > 0) {
            if (q_num <= 0) {
                q_num = queue.length - 1;
            } else {
                q_num--;
            }
            
            // toggle play button accordingly
            if (playBtn.hasClass("paused")){
                btnPlay();
            } else {
                btnPause();
            }
        }

        // set music to new q_num
        setMusic(q_num);
    });    

})


$(document).ready(function() {
    // making sure all the clickable buttons that go to info pages go to that page
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})