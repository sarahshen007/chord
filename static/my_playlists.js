// FILE FOR my_playlists.html
// show a user's playlists and liked playlists

// imports
import {goToPage} from "./layout.js"
import {populateCardContainer} from "./layout.js"

// when the document is ready
$(document).ready(function() {

    populateCardContainer($("#playlists-container"), playlists, 'playlist')                 // populate playlists container with cards of user's created playlists
    populateCardContainer($("#liked-playlists-container"), liked_playlists, 'playlist')     // populate liked-playlists container with cards of user's liked playlists

        
    // making sure all the clickable buttons that go to info pages go to that page
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})