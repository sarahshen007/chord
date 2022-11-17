import {getRandomColor} from "./layout.js"
import { populateListCardContainer } from "./layout.js"
import {goToPage} from "./layout.js"
import {setLikedButton} from "./layout.js"

$(document).ready(function() {
    $('#album-pic').css('background-color', getRandomColor())
})

const playlistLikeButton = $("#like-btn-icon-playlist")

$(document).ready(function() {
    populateListCardContainer($("#songs-container"), playlist.Songs, 'song')
    setLikedButton(playlistLikeButton, playlistLikeButton.data('id'), playlistLikeButton.data('type'));

    $(".clickable").on('click', function() {
        goToPage(this)
    });

    $("#edit-btn-playlist").on('click', function() {
        window.location.href='/edit_playlist/' + playlist.Info[0][1]
    })
})