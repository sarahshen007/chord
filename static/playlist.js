// FILE FOR playlist.html
// show information about a playlist

// imports
import {getRandomColor} from "./layout.js"
import { populateListCardContainer } from "./layout.js"
import {goToPage} from "./layout.js"
import {setLikedButton} from "./layout.js"

// element representing playlist like button
const playlistLikeButton = $("#like-btn-icon-playlist")     

$(document).ready(function() {

    // set art to random color
    $('#album-pic').css('background-color', getRandomColor())

    // populate songs container with list cards of songs in the playlist
    populateListCardContainer($("#songs-container"), playlist.Songs, 'song')

    // set the liked button to proper status based on data
    setLikedButton(playlistLikeButton, playlistLikeButton.data('id'), playlistLikeButton.data('type'));

    // event handler on click edit button 
    // go to edit playlist page
    $("#edit-btn-playlist").on('click', function() {
        window.location.href='/edit_playlist/' + playlist.Info[0][1]
    })

    // making sure all the clickable buttons that go to info pages go to that page
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})