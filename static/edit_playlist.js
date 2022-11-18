// FILE FOR edit_playlist.html
// to edit playlists, make playlists, and delete playlists


// imports
import {getRandomColor} from "./layout.js"
import { populateListCardContainer } from "./layout.js"
import {createMusicListCard} from "./layout.js"

// array that contains all songs to change the playlist's contained songs to
let newPlaylistSongs = playlist.Songs

// function to get hash for a new playlist's id based on the hash of the playlist's name
function hash(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

// search for all songs that partially match the query string and populate the results container with the search results
// @param query - a string
function getSearchResults(query) {

    // only search if the length of the query is greater than 2
    if (query.length >= 2) {

        // ajax call to search query in Songs
        // @data query 
        // @result dictionary containing array of tuples representing search results
        // each tuple in the array is formatted as such:
        //      tuple[0] is the name of the song
        //      tuple[1] is the song id
        //      tuple[2] is the song's artist's name
        $.ajax({
            type: "POST",
            url: "/search_songs",                
            dataType : "json",
            contentType: "application/json",
            data : JSON.stringify(query),
            success: function(result){
                console.log(result)

                // populate search results container
                populateResults(result);
            },
            error: function(request, status, error){
                console.log("Error");
                console.log(request);
                console.log(status);
                console.log(error);
            }
        });
    }
}

// populate results container
// @param results - dictionary containing array of tuples representing search results
// each tuple in the array is formatted as such:
//      tuple[0] is the name of the song
//      tuple[1] is the song id
//      tuple[2] is the song's artist's name
function populateResults(results) {

    // empty search results container
    $("#search-results").empty();

    // extract array of resulting tuples
    let r = results['results']

    // check if the array of search results actually has results in it
    if (r.length > 0) {

        // wrapper to contain items in search results
        let wrapper = $('<div class="section-card"></div>')

        // for loop going through each item 
        for (var key in r) {

            // get the type and item tuple
            const type = 'song';
            const item = r[key]

            // create list card for the item and append it to wrapper 
            createMusicListCard(wrapper, [item[0], item[2]], item[1], type, 1)
        }

        // append wrapper to the search results container
        $("#search-results").append(wrapper)
    }

    // clicking any add button will add the corresponding song to the newPlaylistSongs list
    $(".add-btn").on('click', function(){
        event.stopPropagation()

        // get the button clicked
        const button = $(this)

        // add song corresponding to button to the list of new playlist songs
        newPlaylistSongs.push([button.data('name'), button.data('id'), button.data('creator')])

        // refresh the displayed list of songs in the playlist to represent change
        // #songs-container - the container on the page showing all the songs in the playlist
        populateListCardContainer($("#songs-container"), newPlaylistSongs, 'song', -1)

    })

}


// determines whether the edits made in the edit form are valid or not
// @returns boolean
function validateForm() {
    let valid = true

    // if the input for playlist name doesn't have anything in it
    if ($("#playlist-name").val().length == 0) {
        // the form is not valid
        valid = false
    }

    return valid
}


// deletes playlist currently being edited
function delPlaylist() {

    let pid = "";

    // if the playlist currently being edited is a new playlist (i.e., it doesn't have any original info)
    if (playlist.Info.length == 0) {
        // do nothing
        return
    } 
    // else
    else {

        // get the playlist id from original playlist info
        pid = playlist.Info[0][1]

        // ajax call to search delete current playlist
        // @data string pid - playlist_id 
        // @result {'url': string} dictionary containing url to go to after playlist has been deleted (in this case the url will always be '/', the home page)
        $.ajax({
            type: "POST",
            url: "/del_playlist",                
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data : JSON.stringify(pid),
            success: function(result){
                console.log(result)

                // go to homepage
                // result['url'] == '/'
                window.location.href = result['url']
            },
            error: function(request, status, error){
                console.log("Error");
                console.log(request);
                console.log(status);
                console.log(error);
            }
        })
    }
}


// adds playlist to db
function addPlaylist() {

    
    const pname = $("#playlist-name").val();  // get playlist's name from text input #playlist-name
    let pid = ""; // playlist id, initially nothing


    // if the playlist being added is a new playlist
    // i.e. playlist.Info containing original playlist information has nothing in it
    if (playlist.Info.length == 0) {
        pid = hash(pname) // get a new playlist id by hashing the playlist name
    }
    else {
        pid = playlist.Info[0][1] // else if old playlist being edited, just get original playlist id from playlist.Info[0]
    }

    // construct newPlaylist data to send
    // dictionary with string playlist id, string playlist name, and list of songs in playlist
    let newPlaylist = {
        'pid': pid,
        'pname': pname,
        'songs': newPlaylistSongs
    }

    // ajax call to add playlist
    // @data newPlaylist
    //      newPlaylist = {
    //          playlist_id
    //          playlist_name
    //          songs
    //      } 
    // @result {'url': string} dictionary containing url to go to after playlist has been deleted (
    //      in this case the url will always be '/playlist/playlist_id', the info page of the playlist just edited or created
    $.ajax({
        type: "POST",
        url: "/new_playlist",                
        dataType : "json",
        contentType: "application/json",
        data : JSON.stringify(newPlaylist),
        success: function(result){
            console.log(result)
            window.location.href = result['url']
        },
        error: function(request, status, error){
            console.log("Error");
            console.log(request);
            console.log(status);
            console.log(error);
        }
    })
}

$(document).ready(function() {

    // set playlist picture to new random color
    $('#album-pic').css('background-color', getRandomColor())

    // set playlist name to original playlist name, if it exists
    if (playlist.Info.length > 0) {
        $("#playlist-name").val(playlist.Info[0][0])
    }

    // display the list of songs already in the playlist
    populateListCardContainer($("#songs-container"), playlist.Songs, 'song', -1, 1)

    // event handler on input in search
    // when you type in the search bar, get search results based on the query you typed into #search-bar
    $("#search-bar").on('input' ,function() {
        getSearchResults($('#search-bar').val())
    });  

    // event handler on click #done-btn
    // #done-btn - the button 'Done' which the user clicks to complete editing the playlist
    $('#done-btn').on('click', function() {

        // if the entry is valid
        if(validateForm()) { 
            // make edits to db
            addPlaylist()
        }
    })

    // event handler on click #del-btn
    // #del-btn - the button 'Delete'
    //      to delete the current playlist
    $("#del-btn").on('click', function() {
        delPlaylist();
    })

    // event handler on click .del-btn
    // .del-btn
    //      to delete its respective song from the playlist
    $("#songs-container").on('click', ".del-btn", function() {
        // get the button clicked
        const button = $(this)

        // get the index of the song in the playlist corresponding to the del-btn that's been clicked
        const index = button.data('index')

        // remove the song from the list of songs
        newPlaylistSongs.splice(index, 1)

        // refresh display of songs in playlist
        populateListCardContainer($("#songs-container"), newPlaylistSongs, 'song', -1)
    });

})