import {getRandomColor} from "./layout.js"
import { populateListCardContainer } from "./layout.js"
import {goToPage} from "./layout.js"
import {createMusicListCard} from "./layout.js"

let newPlaylistSongs = playlist.Songs

function hash(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function getSearchResults(query) {
    if (query.length >= 2) {
        $.ajax({
            type: "POST",
            url: "/search_songs",                
            dataType : "json",
            contentType: "application/json",
            data : JSON.stringify(query),
            success: function(result){
                console.log(result)
                populateResults(result);
            },
            error: function(request, status, error){
                console.log("Error");
                console.log(request);
                console.log(status);
                console.log(error);
            }
        });
    }
}

function populateResults(results) {
    $("#search-results").empty();

    let r = results['results']

    if (r.length > 0) {
        let wrapper = $('<div class="section-card"></div>')

        for (var key in r) {
            const type = 'song';
            const item = r[key]

            createMusicListCard(wrapper, [item[0], item[2]], item[1], type, 1)
        }

        $("#search-results").append(wrapper)
    }

    $(".add-btn").on('click', function(){
        event.stopPropagation()
        const button = $(this)
        newPlaylistSongs.push([button.data('name'), button.data('id'), button.data('creator')])
        populateListCardContainer($("#songs-container"), newPlaylistSongs, 'song', -1)

    })

}

function validateForm() {
    let valid = true

    if ($("#playlist-name").val().length == 0) {
        valid = false
    }

    return valid
}

function delPlaylist() {
    let pid = "";
    if (playlist.Info.length == 0) {
        return
    } else {
        pid = playlist.Info[1]

        $.ajax({
            type: "POST",
            url: "/del_playlist",                
            dataType : "json",
            contentType: "application/json",
            data : JSON.stringify(newPlaylist),
            success: function(result){
                console.log(result)
                window.location.href = result['url']
            },
            error: function(request, status, error){
                console.log("Error");
                console.log(request);
                console.log(status);
                console.log(error);
            }
        })
    }
}

function addPlaylist() {
    const pname = $("#playlist-name").val();
    let pid = "";
    let n = true

    if (playlist.Info.length == 0) {
        pid = hash(pname)
    }
    else {
        pid = playlist.Info[0][1]
        n = false
    }

    let newPlaylist = {
        'pid': pid,
        'pname': pname,
        'songs': newPlaylistSongs
    }

    $.ajax({
        type: "POST",
        url: "/new_playlist",                
        dataType : "json",
        contentType: "application/json",
        data : JSON.stringify(newPlaylist),
        success: function(result){
            console.log(result)
            window.location.href = result['url']
        },
        error: function(request, status, error){
            console.log("Error");
            console.log(request);
            console.log(status);
            console.log(error);
        }
    })
}

$(document).ready(function() {

    $('#album-pic').css('background-color', getRandomColor())

    if (playlist.Info.length > 0) {
        $("#playlist-name").val(playlist.Info[0][0])
    }

    populateListCardContainer($("#songs-container"), playlist.Songs, 'song', -1, 1)


    $("#search-bar").on('input' ,function() {
        getSearchResults($('#search-bar').val())
    });  

    $('#done-btn').on('click', function() {
        if(validateForm()) {
            addPlaylist()
        }
    })

    $("#del-btn").on('click', function() {
        delPlaylist();
    })

    $("#songs-container").on('click', ".del-btn", function() {
        const button = $(this)

        const index = button.data('index')
        newPlaylistSongs.splice(index, 1)

        populateListCardContainer($("#songs-container"), newPlaylistSongs, 'song', -1)
    });

})