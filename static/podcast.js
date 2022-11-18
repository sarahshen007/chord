// FILE FOR podcast.html
// show info about a podcast

// imports
import { populateListCardContainer } from "./layout.js";
import { getRandomColor } from "./layout.js";
import { constructFollowButton } from "./layout.js";
import {isFollowing} from "./layout.js";

// get initial following status of podcast
let following = isFollowing($("#follow-btn").data('id'), 'podcast')

// when document is ready
$(document).ready(function() {

    // change profile pic to random color
    $("#profile-pic").css('background-color', getRandomColor())

    // populate albums container with list of episodes in podcast
    populateListCardContainer($('#albums-container'), podcast.Episodes, 'episode')

    // set follow button given status
    constructFollowButton($("#follow-btn"), following, $('#follow-btn').data('id'), 'podcast');

})