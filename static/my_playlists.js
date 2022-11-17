import {goToPage} from "./layout.js"
import {populateCardContainer} from "./layout.js"

$(document).ready(function() {
    populateCardContainer($("#playlists-container"), playlists, 'playlist')
    populateCardContainer($("#liked-playlists-container"), liked_playlists, 'playlist')

    $(".clickable").on('click', function() {
        goToPage(this)
    });
})