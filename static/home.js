import {Music} from "./music.js";

let recommended = []

function populateForYou() {
    $.ajax({
        type: "POST",
        url: "/song_recommendations",                
        dataType : "json",
        cache: true,
        contentType: "application/json",
        data : JSON.stringify(user),
        success: function(result){
            for (let i = 0; i < result['recommended_songs'].length; i++) {
                recommended.push(result['recommended_songs'][i]);
            }
        },
        error: function(request, status, error){
            console.log("Error");
            console.log(request)
            console.log(status)
            console.log(error)
        },
        complete: function(){
            for (let i = 0; i < recommended.length; i++) {
                const song = new Music('song', recommended[i][0], recommended[i][1], recommended[i][2], recommended[i][3]);
                song.createMusicCard($("#recommendations"));
            }
        }
    });
}

$(document).ready(function (){
    populateForYou();
});

