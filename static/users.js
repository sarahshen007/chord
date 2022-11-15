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