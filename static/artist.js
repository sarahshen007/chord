import { getRandomColor } from "./layout.js";

import { populateCardContainer } from "./layout.js";
import { constructFollowButton } from "./layout.js";
import {isFollowing} from "./layout.js";
import {goToPage} from "./layout.js"

$(document).ready(function() {
    $("#profile-pic").css('background-color', getRandomColor())

    populateCardContainer($("#albums-container"), artist.Albums, 'album')

    constructFollowButton($("#follow-btn"), isFollowing($("#follow-btn").data('id'), 'artist'), $('#follow-btn').data('id'), 'artist');
    
})

$(document).ready(function() {
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})