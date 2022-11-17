import { createMusicCard } from "./layout.js";
import { getRandomColor } from "./layout.js";
import { constructFollowButton } from "./layout.js";
import {isFollowing} from "./layout.js";
import {goToPage} from "./layout.js"

function populateAlbumsContainer() {
    for (let i = 0; i < artist.Albums.length; i++) {
        createMusicCard($("#albums-container"), [artist.Albums[i][0], artist.Albums[i][2]], artist.Albums[i][1], 'album') 
    }
}

$(document).ready(function() {
    $("#profile-pic").css('background-color', getRandomColor())

    populateAlbumsContainer();
    constructFollowButton($("#follow-btn"), isFollowing($("#follow-btn").data('id'), 'artist'), $('#follow-btn').data('id'), 'artist');
    
})

$(document).ready(function() {
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})