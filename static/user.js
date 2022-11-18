// FILE FOR user.html
// show user info

// imports
import {getRandomColor} from "./layout.js"
import { populateCardContainer } from "./layout.js"
import {goToPage} from "./layout.js"

// when document is ready
$(document).ready(function() {

    // populate playlists container with created playlists
    populateCardContainer($("#playlists-container"), created_playlists, 'playlist')

    // populate artists container with followed artists
    populateCardContainer($("#artists-container"), liked_artists, 'artist')

    // populate podcasts container with followed podcasts
    populateCardContainer($("#podcasts-container"), liked_podcasts, 'podcast')

    // set profile pic to random color
    $("#profile-pic").css('background-color', getRandomColor())

    // making sure all the clickable buttons that go to info pages go to that page
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})