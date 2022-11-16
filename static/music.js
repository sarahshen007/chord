export class Music {
    constructor(song="", song_id="", artist="", artist_id="", album="", album_id="") {
        this.song = song
        this.song_id = song_id
        this.artist = artist
        this.artist_id = artist_id
        this.album = album
        this.album_id = album_id
    }
}


export function createMusicCard(container, names, ids) {
    let musicCard = $('<div class="music-card"></div>');
    let musicArt = $('<div class="music-art"></div>').css("background-color", this.art);
    let playButton = $('<div class="play-btn-2"><div class="play-btn-icon-2">▷</div></div>');
    musicArt.append(playButton);

    let musicName = $('<div class="music-name"></div>').html(names[0]);
    let musicCreator = $('<div class="music-creator"></div>').html(names[1]);

    

    musicCard.append(musicArt);
    musicCard.append(musicName);
    musicCard.append(musicCreator);

    container.append(musicCard);

    return musicCard, playButton
}

export class SongCard {
    constructor(item= new Music()) {
      this.item = item;
      this.art = "rgb(" + Math.floor((Math.random() * 256)) + "," + Math.floor((Math.random() * 256)) + "," + Math.floor((Math.random() * 256)) + ")"
    }
  
    createSongCard(container) {
        let musicCard = $('<div class="music-card"></div>');
        let musicArt = $('<div class="music-art"></div>').css("background-color", this.art);
        let playButton = $('<div class="play-btn-2"><div class="play-btn-icon-2">▷</div></div>');
        musicArt.append(playButton);

        let musicName = $('<div class="music-name"></div>').html(this.item.song);
        let musicCreator = $('<div class="music-creator"></div>').html(this.item.artist);

        musicCard.append(musicArt);
        musicCard.append(musicName);
        musicCard.append(musicCreator);

        container.append(musicCard);

        return musicCard, playButton
    }
}



export class Person {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }

}

export class Artist extends Person {
    constructor(name, id, albums) {
        super(name, id);
        this.playlists = albums;
    }
}

export class User extends Person {
    constructor(name, id, playlists) {
        super(name, id);
        this.playlists = playlists;
    }
}