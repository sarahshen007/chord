import { populateListCardContainer } from "./layout.js";
import { getRandomColor } from "./layout.js";
import { constructFollowButton } from "./layout.js";
import {isFollowing} from "./layout.js";

$(document).ready(function() {
    $("#profile-pic").css('background-color', getRandomColor())

    populateListCardContainer($('#albums-container'), podcast.Episodes, 'episode')

    constructFollowButton($("#follow-btn"), isFollowing($("#follow-btn").data('id'), 'podcast'), $('#follow-btn').data('id'), 'podcast');

})