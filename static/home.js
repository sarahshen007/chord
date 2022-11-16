import {SongCard} from "./music.js";
import {Music} from "./music.js"

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
                const recommended_songs = result['recommended_songs']
                const musicObj = new Music(recommended_songs[i][0], recommended_songs[i][1], recommended_songs[i][2], recommended_songs[i][3], recommended_songs[i][4], recommended_songs[i][5])
                const song = new SongCard(musicObj);
                recommended.push(song);
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
                let song = recommended[i]
                let musicCard, playButton = song.createSongCard($("#recommendations"));

                $(musicCard).data(song.album_id);
                $(playButton).data(song.song_id);

                console.log($(musicCard).data());

            }
        }
    });
}

$(document).ready(function (){    

    populateForYou();
});

