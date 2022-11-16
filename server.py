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

q = []
user = {"username": "", "user_id": ""}

@app.before_request
def before_request():
  try:
    g.conn = engine.connect()
  except:
    print("uh oh, problem connecting to database")
    import traceback; traceback.print_exc()
    g.conn = None

#############
# ROUTES HERE
#############

# LOGIN PAGE / HOME
@app.route('/')
def home():
    if len(user["username"]) == 0:
        return render_template('login.html')
    else:
        return render_template('home.html', user=user, queue=q)

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

@app.route('/signout', methods=['POST'])
def signout():
    global user
    
    user = {"username": "", "user_id": ""}

    return jsonify(user)

@app.route('/search_page')
def viewSearch():
    return render_template('search.html', user=user, queue=q)

@app.route('/my_songs')
def viewMySongs():
    db = g.conn.execute("SELECT S.song_name, L.song_id, A.artist_name, B.artist_id \
                          FROM likes_song L, Songs S, by B, Artists A \
                          WHERE L.user_id = %s AND S.song_id = L.song_id AND S.song_id = B.song_id AND A.artist_id = B.artist_id;", user['user_id'])

    songs = []
    for i in db:
        songs.append(tuple(i))

    return render_template('songs.html', user=user, queue=q, songs=songs)

@app.route('/my_artists')
def viewMyArtists():
    db = g.conn.execute("SELECT A.artist_name, F.artist_id \
                          FROM Follows F, Artists A\
                          WHERE F.user_id = %s and F.artist_id = A.artist_id", user['user_id'])

    artists = []
    for i in db:
        artists.append(tuple(i))

    return render_template('artists.html', user=user, queue=q, artists=artists)

@app.route('/my_podcasts')
def viewMyPodcasts():
    uid = user['user_id']
    db = g.conn.execute("SELECT P.podcast_name, P.podcast_id \
                          FROM Podcasts P, follows2 F \
                          WHERE F.user_id = %s AND P.podcast_id = F.podcast_id;", uid)
    
    podcasts = []
    for i in db:
        podcasts.append(tuple(i))

    return render_template('podcasts.html', user=user, queue=q, podcasts=podcasts)

# GET ALL PLAYLISTS A USER MADE
@app.route('/my_playlists')
def viewMyPlaylists():
    uid = user['user_id']
    db = g.conn.execute("SELECT P.playlist_name, P.playlist_id \
                          FROM Playlists P, creates C \
                          WHERE C.user_id = %s AND P.playlist_id = C.playlist_id;", uid)
    
    playlists = []
    for i in db:
        playlists.append(tuple(i))
    return render_template('playlists.html', user=user, queue=q, playlists=playlists)

@app.route('/is_liked/<song_id>', methods=['POST'])
def is_liked(song_id=None):

    db = g.conn.execute("SELECT * \
                        FROM likes_song L \
                        WHERE L.song_id = %s AND L.user_id = %s", song_id, user["user_id"])


    songs = []    
    for i in db:
        songs.append(tuple(i))
    if len(songs) > 0:
        return jsonify(True)
    return jsonify(False)


# GET SONG RECS BASED ON GENRE
@app.route('/song_recommendations', methods=['POST'])
def get_recommended_songs():
    req = request.get_json()
    uid = req['user_id']
    
    db = g.conn.execute("SELECT I.genre_name \
                        FROM likes_song L, is_genre I \
                        WHERE L.song_id = I.song_id AND L.user_id = %s \
                        GROUP BY I.genre_name \
                        ORDER BY COUNT(*) DESC \
                        LIMIT 1;", uid)

    max_g = [i for i in db]

    db_songs = g.conn.execute("SELECT S.song_name, S.song_id, A.artist_name, B.artist_id, D.album_name, B.album_id \
                               FROM Songs S, Is_genre I, by B, Artists A, Albums D \
                               WHERE S.song_id = I.song_id AND I.genre_name = %s \
                                AND A.artist_id = B.artist_id AND B.song_id = S.song_id \
                                AND D.album_id = B.album_id;", max_g[0][0])
    
    rec_songs = []
    for i in db_songs:
        rec_songs.append(tuple(i))

    return {'recommended_songs': random.sample(rec_songs, 4)}


# GET ALL ALBUMS AN ARTIST CREATES
@app.route('/artist_albums', methods=['GET'])
def get_artist_albums():
    req = request.get_json()
    artist_id = req['artist_id']
    db = g.conn.execute("SELECT A.album_name, A.album_id \
                          FROM Albums A, By B \
                          WHERE B.artist_id = %s AND A.album_id = B.album_id;", artist_id)
    
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
                          WHERE C.podcast_id = %s AND E.episode_id = C.episode_id;", podcast_id)

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
        db = g.conn.execute("SELECT "+e[0]+"."+e[1]+", "+e[0]+"."+e[2]+" \
                             FROM "+e[0]+" \
                             WHERE "+e[0]+"."+e[1]+"~* %s", 
                             query)
        
        vals = []
        for i in db:
            vals.append(tuple(i))
        res[e[0]] = vals
    
    return res

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
@app.route('/follow_artist', methods=['POST'])
def follow_artist():
    req = request.get_json()
    artist_id = req['artist_id']
    user_id = req['user_id']

    g.conn.execute("INSERT INTO Follows(user_id, artist_id) VALUES(%s, %s)", user_id, artist_id)
    return {"Insertion": (artist_id, user_id)}


# FOLLOW A PODCAST
@app.route('/follow_podcast', methods=['POST'])
def follow_podcast():
    req = request.get_json()
    podcast_id = req['podcast_id']
    user_id = req['user_id']

    g.conn.execute("INSERT INTO Follows2(podcast_id, user_id) VALUES(%s, %s)", podcast_id, user_id)
    return {"Insertion": (podcast_id, user_id)}


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

    g.conn.execute("DELETE FROM Likes_song L WHERE L.song_id = %s AND L.user_id = %s)", song_id, user_id)
    return {"Deletion": (song_id, user_id)}


# LIKE A PLAYLIST
@app.route('/like_playlist', methods=['POST'])
def like_playlist():
    req = request.get_json()
    playlist_id = req['playlist_id']
    user_id = req['user_id']

    g.conn.execute("INSERT INTO Likes_playlist(playlist_id, user_id) VALUES(%s, %s)", playlist_id, user_id)
    return {"Insertion": (playlist_id, user_id)}


# ADD A SONG TO QUEUE
@app.route('/enqueue_song', methods=['POST'])
def enqueue_song():
    req = request.get_json()
    song_id = req

    db = g.conn.execute("SELECT S.song_name, S.song_id, A.artist_name, A.artist_id \
                         FROM Songs S, Artists A, By B \
                         WHERE S.song_id = %s AND S.song_id = B.song_id AND A.artist_id = B.artist_id", song_id)
    
    for i in db:
        q.append(tuple(i))
    
    return {"Insertion": q}


# ADD A PLAYLIST TO QUEUE
@app.route('/enqueue_playlist', methods=['POST'])
def enqueue_playlist():
    req = request.get_json()
    playlist_id = req['playlist_id']

    db = g.conn.execute("SELECT S.song_name, S.song_id \
                         FROM Songs S, Contains C \
                         WHERE C.playlist_id = %s AND S.song_id = C.song_id", playlist_id)
    
    for i in db:
        q.append(tuple(i))
    
    return {"Insertion": playlist_id}


# GO TO NEXT SONG
@app.route('/next_song', methods=['GET'])
def next_song():
    song_name, song_id = q.pop(0)
    return {'song_name': song_name, 'song_id': song_id}

# ADD ALBUM TO QUEUE
@app.route('/enqueue_album', methods=['POST'])
def enqueue_album():
    req = request.get_json()
    album_id = req['album_id']

    db = g.conn.execute("SELECT S.song_name, S.song_id \
                         FROM Songs S, By B \
                         WHERE B.album_id = %s AND S.song_id = B.song_id", album_id)
    
    for i in db:
        q.append(tuple(i))
    
    return {"Insertion": album_id}

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