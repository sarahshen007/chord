import os
import random
from sqlalchemy import *
from sqlalchemy.pool import NullPool
from flask import Flask, request, render_template, g, redirect, Response, jsonify

app = Flask(__name__)
DATABASEURI = "postgresql://ss6170:6400@34.75.94.195/proj1part2"
engine = create_engine(DATABASEURI)

global q
global user
global q_num

q = []
user = {"username": "", "user_id": ""}
q_num = -1

@app.before_request
def before_request():
  try:
    g.conn = engine.connect()
  except:
    print("uh oh, problem connecting to database")
    import traceback; traceback.print_exc()
    g.conn = None

#############
# PAGES HERE
#############

# LOGIN PAGE / HOME
@app.route('/')
def home():
    global q
    global q_num

    if len(user["username"]) == 0:
        return render_template('login.html')
    else:
        if len(q) == 0:
            q = get_recommended_songs()['Recommendations']
            q_num = 0
        return render_template('home.html', user=user, queue=q, q_num=q_num)

@app.route("/signup")
def signup():
    if len(user['user_id']) == 0:
        return home()
    return render_template('signup.html')
    
@app.route("/signup_post", methods=['POST'])
def signup_post():
    username = request.get_json()
    user_id = str(hash(username))
    result = {
        "username": "",
        "user_id": ""
    }

    try:
        g.conn.execute("INSERT INTO Users(user_id, username) VALUES(%s, %s)", user_id, username)
        result["username"] = username
        result["user_id"] = user_id

        user['username'] = username
        user['user_id'] = user_id
    except:
        print('sign up error')

    return result

# SEARCH PAGE
@app.route('/search_page')
def viewSearch():
    if len(user['user_id']) == 0:
        return home()
    return render_template('search.html', user=user, queue=q, q_num=q_num)

# MY SONGS PAGE
@app.route('/my_songs')
def viewMySongs():
    if len(user['user_id']) == 0:
        return home()

    songs = get_liked_songs(user['user_id'])[user['user_id']]

    return render_template('my_songs.html', user=user, queue=q, songs=songs, q_num=q_num)

# MY ARTISTS PAGE
@app.route('/my_artists')
def viewMyArtists():
    if len(user['user_id']) == 0:
        return home()

    artists = get_followed_artists(user['user_id'])[user['user_id']]

    return render_template('my_artists.html', user=user, queue=q, artists=artists, q_num=q_num)

# MY PODCASTS PAGE
@app.route('/my_podcasts')
def viewMyPodcasts():
    if len(user['user_id']) == 0:
        return home()
    uid = user['user_id']

    podcasts = get_followed_podcasts(uid)[uid]

    return render_template('my_podcasts.html', user=user, queue=q, podcasts=podcasts, q_num=q_num)

# MY PLAYLISTS PAGE
@app.route('/my_playlists')
def viewMyPlaylists():
    if len(user['user_id']) == 0:
        return home()
    uid = user['user_id']
    playlists = get_playlists(uid)[uid]
    liked_playlists = get_liked_playlists(uid)[uid]

    return render_template('my_playlists.html', user=user, queue=q, q_num=q_num, playlists=playlists, liked_playlists=liked_playlists)

# PROFILE PAGE 
@app.route('/user/<uid>')
def viewProfile(uid=""):
    if len(user['user_id']) == 0:
        return home()

    db = g.conn.execute("SELECT U.user_id, U.username \
                    FROM Users U \
                    WHERE U.user_id = %s", uid)

    profile_users = []
    for i in db:
        profile_users.append(tuple(i))

    profile_user = profile_users[0]
    created_playlists = get_playlists(uid)[uid]
    liked_songs_num = len(get_liked_songs(uid)[uid])
    liked_artists = get_followed_artists(uid)[uid]
    liked_podcasts = get_followed_podcasts(uid)[uid]

    return render_template('user.html', user=user, queue=q, liked_artists=liked_artists, liked_podcasts=liked_podcasts, profile_user=profile_user, created_playlists=created_playlists, q_num=q_num, liked_songs_num=liked_songs_num)

@app.route('/album/<aid>')
def viewAlbum(aid=""):
    if len(user['user_id']) == 0:
        return home()

    db = g.conn.execute("SELECT DISTINCT A.album_name, A.album_id, T.artist_name, T.artist_id \
                    FROM Albums A, Artists T, By B \
                    WHERE A.album_id = %s AND B.artist_id = T.artist_id AND B.album_id = A.album_id;", aid)

    album_info = []
    for i in db:
        album_info.append(tuple(i))

    db = g.conn.execute("SELECT S.song_name, S.song_id, T.artist_name, B.artist_id \
                    FROM Albums A, By B, Songs S, Artists T \
                    WHERE A.album_id = %s AND B.album_id = A.album_id AND B.song_id = S.song_id AND T.artist_id = B.artist_id;", aid)

    album_songs = []
    for i in db:
        album_songs.append(tuple(i))

    album = {
        'Info': album_info,
        'Songs': album_songs,        
    }
    return render_template('album.html', user=user, queue=q, q_num=q_num, album=album)

@app.route('/song/<sid>')
def viewSong(sid=""):
    db = g.conn.execute("SELECT DISTINCT A.album_name, A.album_id \
                        FROM Albums A, By B \
                        WHERE B.song_id = %s AND B.album_id = A.album_id;", sid)
    albums = []
    for i in db:
        albums.append(tuple(i))

    if len(albums) != 0:
        return viewAlbum(albums[0][1])
    else:
        return home()

@app.route('/episode/<eid>')
def viewEpisode(eid=""):
    db = g.conn.execute("SELECT DISTINCT P.podcast_name, P.podcast_id \
                        FROM Podcasts P, Contains2 C \
                        WHERE C.episode_id = %s AND P.podcast_id = C.podcast_id;", eid)
    podcasts = []
    for i in db:
        podcasts.append(tuple(i))

    if len(podcasts) != 0:
        return viewPodcast(podcasts[0][1])
    else:
        return home()

@app.route('/artist/<aid>')
def viewArtist(aid=""):
    if len(user['user_id']) == 0:
        return home()

    db = g.conn.execute("SELECT DISTINCT A.artist_name, A.artist_id \
                    FROM Artists A \
                    WHERE A.artist_id = %s", aid)

    artist_info = []
    for i in db:
        artist_info.append(tuple(i))

    db = g.conn.execute("SELECT A.album_name, A.album_id, T.artist_name, T.artist_id \
                    FROM Albums A, By B, Artists T \
                    WHERE T.artist_id = %s AND B.album_id = A.album_id AND B.artist_id = T.artist_id \
                        ORDER BY A.album_name ASC", aid)

    artist_albums = []
    for i in db:
        artist_albums.append(tuple(i))

    artist = {
        'Info': artist_info,
        'Albums': artist_albums,        
    }
    return render_template('artist.html', user=user, queue=q, q_num=q_num, artist=artist)

@app.route('/playlist/<pid>')
def viewPlaylist(pid=""):
    if len(user['user_id']) == 0:
        return home()

    db = g.conn.execute("SELECT DISTINCT P.playlist_name, P.playlist_id, U.username, U.user_id \
                    FROM Playlists P, Creates C, Users U \
                    WHERE P.playlist_id = %s AND C.playlist_id = P.playlist_id AND U.user_id = C.user_id;", pid)

    playlist_info = []
    for i in db:
        playlist_info.append(tuple(i))

    db = g.conn.execute("SELECT S.song_name, S.song_id, A.artist_name, A.artist_id \
                    FROM Playlists P, Contains C, Songs S, Artists A, By B \
                    WHERE P.playlist_id = %s AND P.playlist_id = C.playlist_id AND C.song_id = S.song_id AND B.artist_id = A.artist_id AND S.song_id = B.song_id \
                        ORDER BY S.song_id ASC;", pid)

    playlist_songs = []
    for i in db:
        playlist_songs.append(tuple(i))

    playlist = {
        'Info': playlist_info,
        'Songs': playlist_songs,        
    }
    return render_template('playlist.html', user=user, queue=q, q_num=q_num, playlist=playlist)

@app.route('/podcast/<pid>')
def viewPodcast(pid=""):
    if len(user['user_id']) == 0:
        return home()

    db = g.conn.execute("SELECT DISTINCT P.podcast_name, P.podcast_id \
                    FROM Podcasts P \
                    WHERE P.podcast_id = %s;", pid)

    podcast_info = []
    for i in db:
        podcast_info.append(tuple(i))

    db = g.conn.execute("SELECT E.episode_name, E.episode_id, P.podcast_name, P.podcast_id \
                    FROM Podcasts P, Contains2 C, Episodes E \
                    WHERE P.podcast_id = %s AND P.podcast_id = C.podcast_id AND C.episode_id = E.episode_id \
                        ORDER BY E.episode_id ASC;", pid)

    podcast_episodes = []
    for i in db:
        podcast_episodes.append(tuple(i))

    podcast = {
        'Info': podcast_info,
        'Episodes': podcast_episodes,        
    }

    return render_template('podcast.html', user=user, queue=q, q_num=q_num, podcast=podcast)


# GET WHETHER A SONG IS LIKED
@app.route('/is_liked_song/<song_id>', methods=['POST'])
def is_liked_song(song_id=""):

    db = g.conn.execute("SELECT L.song_id, S.song_name \
                        FROM likes_song L, Songs S \
                        WHERE L.user_id = %s AND S.song_id = L.song_id", user["user_id"])

    songs = []    
    for i in db:
        songs.append(tuple(i)[0])

    if song_id in set(songs):
        return jsonify(1)
    return jsonify(0)

@app.route('/is_liked_playlist/<pid>', methods=['POST'])
def is_liked_playlist(pid=""):

    db = g.conn.execute("SELECT L.playlist_id, P.playlist_name \
                        FROM likes_playlist L, Playlists P \
                        WHERE L.user_id = %s AND P.playlist_id = L.playlist_id", user["user_id"])

    playlists = []    
    for i in db:
        playlists.append(tuple(i)[0])

    if pid in set(playlists):
        return jsonify(1)
    return jsonify(0)

# GET WHETHER THE USER FOLLOWS AN ARTIST 
@app.route('/follows_artist/<aid>', methods=['GET'])
def follows_artist(aid=''):
    db = g.conn.execute("SELECT A.artist_id, A.artist_name \
                        FROM Follows F, Artists A \
                        WHERE F.user_id = %s AND A.artist_id = F.artist_id", user["user_id"])

    artists = []    
    for i in db:
        artists.append(tuple(i)[0])

    if aid in set(artists):
        return jsonify(1)
    return jsonify(0)

@app.route('/follows_podcast/<pid>', methods=['GET'])
def follows_podcast(pid=''):
    db = g.conn.execute("SELECT P.podcast_id, P.podcast_name \
                        FROM Follows2 F, Podcasts P \
                        WHERE F.user_id = %s AND P.podcast_id = F.podcast_id", user["user_id"])

    podcasts = []    
    for i in db:
        podcasts.append(tuple(i)[0])

    if pid in set(podcasts):
        return jsonify(1)
    return jsonify(0)


# GET SONG RECS BASED ON GENRE
@app.route('/song_recommendations', methods=['POST'])
def get_recommended_songs():
    uid = user['user_id']
    
    db = g.conn.execute("SELECT I.genre_name \
                        FROM likes_song L, is_genre I \
                        WHERE L.song_id = I.song_id AND L.user_id = %s \
                        GROUP BY I.genre_name \
                        ORDER BY COUNT(*) DESC \
                        LIMIT 1;", uid)

    max_g = [i for i in db]
    db_songs = []

    if len(max_g) > 0:
        db_songs = g.conn.execute("SELECT S.song_name, S.song_id, A.artist_name, B.artist_id, D.album_name, B.album_id \
                                FROM Songs S, Is_genre I, by B, Artists A, Albums D \
                                WHERE S.song_id = I.song_id AND I.genre_name = %s \
                                    AND A.artist_id = B.artist_id AND B.song_id = S.song_id \
                                    AND D.album_id = B.album_id;", max_g[0][0])
    else:
        db_songs = g.conn.execute("SELECT S.song_name, S.song_id, A.artist_name, B.artist_id, D.album_name, B.album_id \
                                FROM Songs S, Is_genre I, by B, Artists A, Albums D \
                                WHERE S.song_id = I.song_id AND I.genre_name = %s \
                                    AND A.artist_id = B.artist_id AND B.song_id = S.song_id \
                                    AND D.album_id = B.album_id;", "pop")

    rec_songs = []
    for i in db_songs:
        rec_songs.append(tuple(i))

    return {'Recommendations': random.sample(rec_songs, 14)}

# GET ALL SONGS A USER HAS LIKED
@app.route('/songs/<uid>', methods=['GET'])
def get_liked_songs(uid=""):
    db = g.conn.execute("SELECT S.song_name, L.song_id, A.artist_name, B.artist_id \
                          FROM likes_song L, Songs S, by B, Artists A \
                          WHERE L.user_id = %s AND S.song_id = L.song_id AND S.song_id = B.song_id AND A.artist_id = B.artist_id \
                            ORDER BY S.song_name ASC;", user['user_id'])

    songs = []
    for i in db:
        songs.append(tuple(i))

    return {uid: songs}

# GET ALL ARTISTS FOLLOWED BY A USER
@app.route('/artists/<uid>', methods=['GET'])
def get_followed_artists(uid=''):
    db = g.conn.execute("SELECT A.artist_name, F.artist_id \
                          FROM Follows F, Artists A\
                          WHERE F.user_id = %s and F.artist_id = A.artist_id\
                            ORDER BY A.artist_name ASC;", user['user_id'])

    artists = []
    for i in db:
        artists.append(tuple(i))
    
    return {uid: artists}

# GET ALL PLAYLISTS CREATED BY A USER
@app.route('/playlists/<uid>', methods=['GET'])
def get_playlists(uid=""):
    db = g.conn.execute("SELECT P.playlist_name, P.playlist_id, U.username, U.user_id \
                          FROM Playlists P, creates C, Users U \
                          WHERE C.user_id = %s AND P.playlist_id = C.playlist_id AND C.user_id = U.user_id;", uid)
    
    playlists = []
    for i in db:
        playlists.append(tuple(i))

    return {uid: playlists}

@app.route('/liked_playlists/<uid>', methods=['GET'])
def get_liked_playlists(uid=""):
    db = g.conn.execute("SELECT P.playlist_name, P.playlist_id, U.username, U.user_id \
                          FROM Playlists P, Likes_Playlist L, Users U, Creates C \
                          WHERE L.user_id = %s AND P.playlist_id = L.playlist_id AND C.playlist_id = L.playlist_id AND C.user_id = U.user_id;", uid)
    
    playlists = []
    for i in db:
        playlists.append(tuple(i))

    return {uid: playlists}

# GET ALL PODCASTS FOLLOWED BY A USER
@app.route('/podcasts/<uid>', methods=['GET'])
def get_followed_podcasts(uid=""):
    db = g.conn.execute("SELECT P.podcast_name, P.podcast_id \
                          FROM Podcasts P, follows2 F \
                          WHERE F.user_id = %s AND P.podcast_id = F.podcast_id\
                          ORDER BY P.podcast_name ASC;", uid)
    
    podcasts = []
    for i in db:
        podcasts.append(tuple(i))

    return {uid: podcasts}


# GET ALL ALBUMS AN ARTIST CREATES
@app.route('/artist_albums', methods=['GET'])
def get_artist_albums():
    req = request.get_json()
    artist_id = req['artist_id']
    db = g.conn.execute("SELECT A.album_name, A.album_id \
                          FROM Albums A, By B \
                          WHERE B.artist_id = %s AND A.album_id = B.album_id\
                            ORDER BY A.album_name ASC;", artist_id)
    
    albums = []
    for i in db:
        albums.append(tuple(i))
    return {'albums': albums}


# GET PODCAST EPISODES IN A PODCAST
@app.route('/podcast_episodes', methods=['GET'])
def get_podcast_episodes():
    req = request.get_json()
    podcast_id = req['podcast_id']
    db = g.conn.execute("SELECT E.episode_name, E.episode_id \
                          FROM Episodes E, Contains2 C \
                          WHERE C.podcast_id = %s AND E.episode_id = C.episode_id\
                            ORDER BY E.episode_name ASC;", podcast_id)

    episodes = []
    for i in db:
        episodes.append(tuple(i))
    return {'episodes': episodes}


# GET SONGS IN AN ALBUM
@app.route('/album_songs', methods=['GET'])
def get_album_songs():
    req = request.get_json()
    album_id = req['album_id']
    db = g.conn.execute("SELECT S.song_name, S.song_id \
                          FROM Songs S, Is_genre I \
                          WHERE I.album_id = %s AND S.song_id = I.song_id;", album_id)
    
    album_songs = []
    for i in db:
        album_songs.append(tuple(i))
    return {'album_songs': album_songs}


# GET SONGS IN A PLAYLIST
@app.route('/playlist_songs', methods=['GET'])
def get_playlist_songs():
    req = request.get_json()
    playlist_id = req['playlist_id']
    db = g.conn.execute("SELECT S.song_name, S.song_id \
                          FROM Songs S, Contains C \
                          WHERE C.playlist_id = %s AND S.song_id = C.song_id;", playlist_id)
    
    playlist_songs = []
    for i in db:
        playlist_songs.append(tuple(i))
    return {'playlist_songs': playlist_songs}


# GET SEARCH RESULTS FOR Songs, Podcasts, Episodes, Users, Artists categories
@app.route('/search', methods=['POST'])
def search_entities():
    req = request.get_json()
    query = req
    entities = [("Songs", "song_name", "song_id"), ("Podcasts", "podcast_name", "podcast_id"), 
                ("Episodes", "episode_name", "episode_id"), ("Playlists", "playlist_name", "playlist_id"), 
                ("Users", "username", "user_id"), ("Albums", "album_name", "album_id"), 
                ("Artists", "artist_name", "artist_id")]
    
    res = {}
    for e in entities:
        db = g.conn.execute("SELECT DISTINCT "+e[0]+"."+e[1]+", "+e[0]+"."+e[2]+" \
                             FROM "+e[0]+" \
                             WHERE "+e[0]+"."+e[1]+"~* %s\
                             ORDER BY "+e[0]+"."+e[1]+" ASC;", query)
        
        vals = []
        for i in db:
            vals.append(tuple(i))
        res[e[0]] = vals
    
    return res

@app.route('/search_songs', methods=['POST'])
def search_songs():
    req = request.get_json()
    query = req
    
    res = []
    db = g.conn.execute("SELECT DISTINCT S.song_name, S.song_id, A.artist_name, A.artist_id \
                            FROM Songs S, Artists A, By B \
                            WHERE S.song_name~* %s AND A.artist_id = B.artist_id AND S.song_id = B.song_id\
                            ORDER BY S.song_name ASC;", query)
        
    for i in db:
        res.append(tuple(i))
    
    return {'results': res}


# LOGIN AND SET USER
@app.route('/login', methods=['POST'])
def login():
    global user
    username = request.get_json()

    db = g.conn.execute("SELECT U.user_id, U.username\
                        FROM users U \
                        WHERE U.username = %s", username)

    result = list(db)

    if len(result) > 0:
        user['username'] = result[0][1]
        user['user_id'] = result[0][0]
        
    return jsonify(user)

# SIGNOUT AND RESET Q, USER, Q_NUM
@app.route('/signout', methods=['POST'])
def signout():
    global user
    global q
    
    q = []
    user = {"username": "", "user_id": ""}
    q_num = -1

    return jsonify(user)

# SET NUM IN QUEUE
@app.route('/set_q_num', methods=['POST'])
def set_q_num():
    global q_num

    q_num = int(request.get_json())
    
    return jsonify(q_num)

# MAKE A PLAYLIST
@app.route('/create_playlist', methods=['GET', 'POST'])
def create_playlist():
    req = request.get_json()
    playlist_name = req['playlist_name']
    user_id = req['user_id']

    db = g.conn.execute("SELECT MAX(P.playlist_id) \
                         FROM Playlists P;")
    
    max_val = [int(i) for i in db]

    g.conn.execute("INSERT INTO Playlists(playlist_id, playlist_name) VALUES(%s, %s)", str(max_val+1), playlist_name)
    g.conn.execute("INSERT INTO Creates(user_id, playlist_id VALUES(%s, %s)", user_id, str(max_val+1))
    return {"playlist_id": str(max_val+1)}

# ADD A SONG TO PLAYLIST
@app.route('/add_song', methods=['POST'])
def add_song():
    req = request.get_json()
    song_id = req['song_id']
    playlist_id = req['playlist_id']

    g.conn.execute("INSERT INTO Contains(playlist_id, song_id) VALUES(%s, %s)", playlist_id, song_id)
    return {"Insertion": (song_id, playlist_id)}

# FOLLOW AN ARTIST
@app.route('/follow_artist/<artist_id>', methods=['POST'])
def follow_artist(artist_id=""):
    user_id = user['user_id']

    g.conn.execute("INSERT INTO Follows(user_id, artist_id) VALUES(%s, %s)", user_id, artist_id)
    return {"Insertion": (artist_id, user_id)}

# UNFOLLOW AN ARTIST
@app.route('/unfollow_artist/<artist_id>', methods=['POST'])
def unfollow_artist(artist_id=""):
    user_id = user['user_id']

    g.conn.execute("DELETE FROM Follows F WHERE F.user_id = %s AND F.artist_id = %s;", user_id, artist_id)
    return {"Deletion": (artist_id, user_id)}

# FOLLOW A PODCAST
@app.route('/follow_podcast/<podcast_id>', methods=['POST'])
def follow_podcast(podcast_id=""):
    user_id = user['user_id']

    g.conn.execute("INSERT INTO Follows2(podcast_id, user_id) VALUES(%s, %s)", podcast_id, user_id)
    return {"Insertion": (podcast_id, user_id)}

# UNFOLLOW A PODCAST
@app.route('/unfollow_podcast/<pid>', methods=['POST'])
def unfollow_podcast(pid=""):
    user_id = user['user_id']

    g.conn.execute("DELETE FROM Follows2 F WHERE F.user_id = %s AND F.podcast_id = %s;", user_id, pid)
    return {"Deletion": (pid, user_id)}

# LIKE A SONG
@app.route('/like_song/<song_id>', methods=['POST'])
def like_song(song_id=None):
    user_id = user['user_id']

    g.conn.execute("INSERT INTO Likes_song(song_id, user_id) VALUES(%s, %s)", song_id, user_id)
    return {"Insertion": (song_id, user_id)}

# REMOVE A LIKE FROM A SONG
@app.route('/dislike_song/<song_id>', methods=['POST'])
def dislike_song(song_id=None):
    user_id = user['user_id']

    g.conn.execute("DELETE FROM Likes_song L WHERE L.song_id = %s AND L.user_id = %s", song_id, user_id)
    return {"Deletion": (song_id, user_id)}

@app.route('/like_playlist/<pid>', methods=['POST'])
def like_playlist(pid=None):
    user_id = user['user_id']

    g.conn.execute("INSERT INTO Likes_Playlist(playlist_id, user_id) VALUES(%s, %s)", pid, user_id)
    return {"Insertion": (pid, user_id)}

@app.route('/dislike_playlist/<pid>', methods=['POST'])
def dislike_playlist(pid=None):
    user_id = user['user_id']

    g.conn.execute("DELETE FROM Likes_Playlist L WHERE L.playlist_id = %s AND L.user_id = %s", pid, user_id)
    return {"Deletion": (pid, user_id)}

# ADD A SONG TO QUEUE
@app.route('/enqueue_song/<song_id>', methods=['POST'])
def enqueue_song(song_id = ""):
    global q
    global q_num

    db = g.conn.execute("SELECT S.song_name, S.song_id, A.artist_name, A.artist_id \
                         FROM Songs S, Artists A, By B \
                         WHERE S.song_id = %s AND S.song_id = B.song_id AND A.artist_id = B.artist_id", song_id)
    
    for i in db:
        q.append(tuple(i))
        q_num = len(q) - 1
    
    return {"Insertion": q, "Num": q_num}

# ADD A PLAYLIST TO QUEUE
@app.route('/enqueue_playlist/<playlist_id>', methods=['POST'])
def enqueue_playlist(playlist_id = ""):
    global q_num

    db = g.conn.execute("SELECT S.song_name, S.song_id \
                         FROM Songs S, Contains C \
                         WHERE C.playlist_id = %s AND S.song_id = C.song_id", playlist_id)
    
    temp = len(q) - 1

    for i in db:
        q.append(tuple(i))
        temp = q_num + 1
    
    q_num = temp

    return {"Insertion": q, "Num": q_num}

# ADD ALBUM TO QUEUE
@app.route('/enqueue_album/<album_id>', methods=['POST'])
def enqueue_album(album_id = ""):
    global q_num
    db = g.conn.execute("SELECT S.song_name, S.song_id \
                         FROM Songs S, By B \
                         WHERE B.album_id = %s AND S.song_id = B.song_id", album_id)
    
    temp = len(q) - 1

    for i in db:
        q.append(tuple(i))
    
    q_num = temp
    
    return {"Insertion": q, "Num": q_num}


@app.route('/edit_playlist/<pid>')
def editPlaylist(pid='new'):
    if len(user['user_id']) == 0:
        return home()

    playlist_info = []
    playlist_songs = []

    if pid != 'new':
        db = g.conn.execute("SELECT DISTINCT P.playlist_name, P.playlist_id, U.username, U.user_id \
                    FROM Playlists P, Creates C, Users U \
                    WHERE P.playlist_id = %s AND C.playlist_id = P.playlist_id AND U.user_id = C.user_id;", pid)

        
        for i in db:
            playlist_info.append(tuple(i))

        db = g.conn.execute("SELECT S.song_name, S.song_id, A.artist_name, A.artist_id \
                        FROM Playlists P, Contains C, Songs S, Artists A, By B \
                        WHERE P.playlist_id = %s AND P.playlist_id = C.playlist_id AND C.song_id = S.song_id AND B.artist_id = A.artist_id AND S.song_id = B.song_id \
                            ORDER BY S.song_id ASC;", pid)

        
        for i in db:
            playlist_songs.append(tuple(i))


    playlist = {
        'Info': playlist_info,
        'Songs': playlist_songs,        
    }

    return render_template('edit_playlist.html', user=user, queue=q, q_num=q_num, playlist=playlist)

@app.route('/new_playlist', methods=['POST'])
def newPlaylist():
    req = request.get_json()
    pid = str(req['pid'])
    pname = req['pname']
    songs = req['songs']

    g.conn.execute("DELETE FROM Creates C WHERE C.playlist_id = %s;", pid)
    g.conn.execute("DELETE FROM Likes_playlist L WHERE L.playlist_id = %s", pid)
    g.conn.execute("DELETE FROM Contains C WHERE C.playlist_id = %s", pid)
    g.conn.execute("DELETE FROM Playlists P WHERE P.playlist_id = %s;", pid)

    g.conn.execute("INSERT INTO Playlists(playlist_id, playlist_name) VALUES(%s, %s)", pid, pname)
    g.conn.execute("INSERT INTO Creates(playlist_id, user_id) VALUES(%s, %s)", pid, user['user_id'])

    for song in songs:
        song_id= song[1]
        g.conn.execute("INSERT INTO Contains(song_id, playlist_id) VALUES(%s, %s)", song_id, pid)

    return {'url' : '/playlist/' + pid}

@app.route('/del_playlist', methods=['POST'])
def delPlaylist():
    pid = request.get_json()

    g.conn.execute("DELETE FROM Creates C WHERE C.playlist_id = %s;", pid)
    g.conn.execute("DELETE FROM Likes_playlist L WHERE L.playlist_id = %s", pid)
    g.conn.execute("DELETE FROM Contains C WHERE C.playlist_id = %s", pid)
    g.conn.execute("DELETE FROM Playlists P WHERE P.playlist_id = %s;", pid)

    return {'url': '/'}
# @app.route('/old_playlist', methods=['POST'])
# def oldPlaylist():
#     req = request.get_json()
#     pid = str(req['pid'])
#     pname = req['pname']
#     songs = req['songs']

#     return {'url': '/playlist/' + pid}

if __name__ == "__main__":
  import click

  @click.command()
  @click.option('--debug', is_flag=True)
  @click.option('--threaded', is_flag=True)
  @click.argument('HOST', default='0.0.0.0')
  @click.argument('PORT', default=8111, type=int)

  def run(debug, threaded, host, port):
    HOST, PORT = host, port
    print("running on %s:%d" % (HOST, PORT))
    app.run(host=HOST, port=PORT, debug=debug, threaded=threaded)

  run()