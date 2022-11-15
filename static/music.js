export class Music {
    constructor(type, name, name_id, creator, creator_id) {
      this.type = type;
      this.name = name;
      this.name_id = name_id;
      this.creator = creator;
      this.creator_id = creator_id;
      this.art = "rgb(" + Math.floor((Math.random() * 256)) + "," + Math.floor((Math.random() * 256)) + "," + Math.floor((Math.random() * 256)) + ")"
    }

    goToPage() {
        if (this.type == "song") {

        }
    }

    addToQueue() {

    }
  
    createMusicCard(container) {
        let musicCard = $('<div class="music-card"></div>');
        let musicArt = $('<div class="music-art"></div>').css("background-color", this.art);
        let playButton = $('<div class="play-btn-2"><div class="play-btn-icon-2">▷</div></div>');
        musicArt.append(playButton);
        let musicName = $('<div class="music-name"></div>').html(this.name);
        let musicCreator = $('<div class="music-creator"></div>').html(this.creator);

        musicCard.on('click', this.goToPage());
        musicCard.on('click', this.addToQueue());

        musicCard.append(musicArt);
        musicCard.append(musicName);
        musicCard.append(musicCreator);

        container.append(musicCard);
    }
}