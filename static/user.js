import {getRandomColor} from "./layout.js"
import { populateCardContainer } from "./layout.js"
import {goToPage} from "./layout.js"


$(document).ready(function() {

    populateCardContainer($("#playlists-container"), created_playlists, 'playlist')
    populateCardContainer($("#artists-container"), liked_artists, 'artist')
    populateCardContainer($("#podcasts-container"), liked_podcasts, 'podcast')



    $("#profile-pic").css('background-color', getRandomColor());
})

$(document).ready(function() {
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})