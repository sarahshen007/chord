import { populateListCardContainer } from "./layout.js";
import { getRandomColor } from "./layout.js";
import { constructFollowButton } from "./layout.js";
import {isFollowing} from "./layout.js";

let following = isFollowing($("#follow-btn").data('id'), 'podcast')

$(document).ready(function() {
    $("#profile-pic").css('background-color', getRandomColor())

    populateListCardContainer($('#albums-container'), podcast.Episodes, 'episode')

    constructFollowButton($("#follow-btn"), following, $('#follow-btn').data('id'), 'podcast');

})