import { getRandomColor } from "./layout.js";

import { populateCardContainer } from "./layout.js";
import { constructFollowButton } from "./layout.js";
import {isFollowing} from "./layout.js";
import {goToPage} from "./layout.js"

// FILE FOR artist.html
// to display artist name and albums


// get whether the artist isFollowed or not
let following = isFollowing($("#follow-btn").data('id'), 'artist')

$(document).ready(function() {

    // adding random color to profile pic
    $("#profile-pic").css('background-color', getRandomColor())

    // populating albums container with all the albums by the artist
    populateCardContainer($("#albums-container"), artist.Albums, 'album')

    // making follow button 
    constructFollowButton($("#follow-btn"), following, $('#follow-btn').data('id'), 'artist');
    
})

$(document).ready(function() {

    // making sure all the clickable buttons that go to info pages go to that page
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})