import os
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