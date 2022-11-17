import {getRandomColor} from "./layout.js"
import {createMusicCard} from "./layout.js"
import {goToPage} from "./layout.js"

function populatePlaylists() {
    for (let i = 0; i < created_playlists.length; i++) {
        createMusicCard($("#playlists-container"), [created_playlists[i][0], created_playlists[i][2]], created_playlists[i][1], 'playlist')
    }
}

function populateArtists() {
    for (let i = 0; i < liked_artists.length; i++) {
        createMusicCard($("#artists-container"), [liked_artists[i][0], ''], liked_artists[i][1], 'artist')
    }
}

function populatePodcasts() {
    for (let i = 0; i < liked_podcasts.length; i++) {
        createMusicCard($("#podcasts-container"), [liked_podcasts[i][0], ''], liked_podcasts[i][1], 'podcast')
    }
}

$(document).ready(function() {
    populatePlaylists();
    populateArtists();
    populatePodcasts();

    $("#profile-pic").css('background-color', getRandomColor());
})

$(document).ready(function() {
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})