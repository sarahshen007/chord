import os
import random
from sqlalchemy import *
from sqlalchemy.pool import NullPool
from flask import Flask, request, render_template, g, redirect, Response

app = Flask(__name__)
DATABASEURI = "postgresql://ss6170:6400@34.75.94.195/proj1part2"
engine = create_engine(DATABASEURI)

@app.before_request
def before_request():
  try:
    g.conn = engine.connect()
  except:
    print("uh oh, problem connecting to database")
    import traceback; traceback.print_exc()
    g.conn = None

@app.route('/songs', methods=['GET'])
def get_liked_songs():
    req = request.get_json()
    uid = req['uid']
    db = g.conn.execute("SELECT S.song_name, L.song_id \
                          FROM likes_song L, Songs S \
                          WHERE L.user_id = %s AND S.song_id = L.song_id;", uid)

    songs = []
    for i in db:
        songs.append(tuple(i))
    return {'songs': songs}

@app.route('/podcasts', methods=['GET'])
def get_followed_podcasts():
    req = request.get_json()
    uid = req['uid']
    db = g.conn.execute("SELECT P.podcast_name, P.podcast_id \
                          FROM Podcasts P, follows2 F \
                          WHERE F.user_id = %s AND P.podcast_id = F.podcast_id;", uid)
    
    podcasts = []
    for i in db:
        podcasts.append(tuple(i))
    return {'podcasts': podcasts}

@app.route('/playlists', methods=['GET'])
def get_created_playlists():
    req = request.get_json()
    uid = req['uid']
    db = g.conn.execute("SELECT P.playlist_name, P.playlist_id \
                          FROM Playlists P, creates C \
                          WHERE C.user_id = %s AND P.playlist_id = C.playlist_id;", uid)
    
    playlists = []
    for i in db:
        playlists.append(tuple(i))
    return {'playlists': playlists}

@app.route('/song_recommendations', methods=['GET'])
def get_recommended_songs():
    req = request.get_json()
    uid = req['uid']
    db = g.conn.execute("SELECT I.genre_name \
                        FROM likes_song L, is_genre I \
                        WHERE L.song_id = I.song_id AND L.user_id = %s \
                        GROUP BY I.genre_name \
                        ORDER BY COUNT(*) DESC \
                        LIMIT 1;", uid)

    max_g = [i for i in db]

    db_songs = g.conn.execute("SELECT S.song_name, S.song_id \
                               FROM Songs S, Is_genre I \
                               WHERE S.song_id = I.song_id AND I.genre_name = %s;", max_g[0][0])
    
    rec_songs = []
    for i in db_songs:
        rec_songs.append(tuple(i))
    return {'recommended_songs': random.sample(rec_songs, 4)}

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

@app.route('/search', methods=['GET'])
def search_entities():
    req = request.get_json()
    query = req['query']
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

@app.route('/create_playlist', methods=['GET', 'POST'])
def create_playlist():
    req = request.get_json()
    playlist_name = req['playlist_name']
    user_id = req['user_id']

    db = g.conn.execute("SELECT MAX(P.playlist_id) \
                         FROM Playlists P;")
    
    max_val = [int(i) for i in db]

    g.conn.execute("INSERT INTO Playlists(playlist_id, playlist_name) VALUES (%s, %s)", str(max_val+1), playlist_name)
    g.conn.execute("INSERT INTO Creates(user_id, playlist_id VALUES (%s, %s)", user_id, str(max_val+1))

    return {"playlist_id": str(max_val+1)}

@app.route('/add_song', methods=['POST'])
def add_song():
    req = request.get_json()
    song_id = req['song_id']
    playlist_id = req['playlist_id']

    g.conn.execute("INSERT INTO Contains(playlist_id, song_id) VALUES (%s, %s)", playlist_id, song_id)

    return {"Insertion": (song_id, playlist_id)}

@app.route('/follow_artist', methods=['POST'])
def follow_artist():
    req = request.get_json()
    artist_id = req['artist_id']
    user_id = req['user_id']

    g.conn.execute("INSERT INTO Follows(user_id, artist_id) VALUES (%s, %s)", user_id, artist_id)

    return {"Insertion": (artist_id, user_id)}


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