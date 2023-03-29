'use strict';
const moment = require('moment');
const mysql = require('mysql2/promise')
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
var SpotifyWebApi = require('spotify-web-api-node');
var sp = new SpotifyWebApi({
  clientId: '186e095cb8c74eb79a24f741c8d1ae02',
  clientSecret: '4896b73ced50452893178f8bc6911e36'
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
  



const run = async () => {
  // DATABASE 연결
  let db;
  try {
    db = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'darkwing99!',
      connectTimeout: 3000,
      supportBigNumbers: true,
      multipleStatements: true,
    });
  } catch (e) {
    console.error(`ERROR_MESSAGE: ${e.message ? e.message : e}`);
  }
  if (!db) {
    console.log(`DB Connection failed.`);
    return;
  }

  db.query("SELECT 1").then(console.log("OK"));


  let qry = mysql.format(`
    SELECT name, song FROM crawling.spotify;
  `);
  const res = await db.query(qry);
  
  // console.log((res[0])[0].name)
  console.log((res[0])[0].song)

  try{
    for(let i=0;i<(res[0]).length;i++) {
      console.log(1)
      var check = 0;
      await sp.clientCredentialsGrant().then(
        async function(data) {
          // console.log('The access token expires in ' + data.body['expires_in'])
          // console.log('The access token is ' + data.body['access_token']);
          sp.setAccessToken(data.body['access_token']);
          await sp.searchTracks(`track:${(res[0])[i].song} artist:${(res[0])[i].name}`)
          .then(async function(data) {
            for (var songs of data.body.tracks.items) {
              var temp1 = songs.name.toLocaleLowerCase()
              temp1 = temp1.trim();
              var temp2 = (res[0])[i].song.toLocaleLowerCase()
              temp2 = temp2.trim();
              console.log(temp1, songs.artists[0].name);
              if(temp1 == temp2 && (res[0])[i].name == songs.artists[0].name) {
                await sleep(200);
                console.log(songs.name.toLocaleLowerCase(),"/", songs.artists[0].name, "/", songs.external_urls.spotify);
                check++;
                await sleep(200);
              }
              // {
              //   album: {
              //     album_group: 'single',
              //     album_type: 'single',
              //     artists: [ [Object] ],
              //     external_urls: {
              //       spotify: 'https://open.spotify.com/album/6DEzfRASHtonWMQQKq03Y4'
              //     },
              //     href: 'https://api.spotify.com/v1/albums/6DEzfRASHtonWMQQKq03Y4',
              //     id: '6DEzfRASHtonWMQQKq03Y4',
              //     images: [ [Object], [Object], [Object] ],
              //     is_playable: true,
              //     name: 'Kapit Lang',
              //     release_date: '2021-09-10',
              //     release_date_precision: 'day',
              //     total_tracks: 1,
              //     type: 'album',
              //     uri: 'spotify:album:6DEzfRASHtonWMQQKq03Y4'
              //   },
              //   artists: [
              //     {
              //       external_urls: [Object],
              //       href: 'https://api.spotify.com/v1/artists/7tNO3vJC9zlHy2IJOx34ga',
              //       id: '7tNO3vJC9zlHy2IJOx34ga',
              //       name: 'BINI',
              //       type: 'artist',
              //       uri: 'spotify:artist:7tNO3vJC9zlHy2IJOx34ga'
              //     }
              //   ],
              //   disc_number: 1,
              //   duration_ms: 169903,
              //   explicit: false,
              //   external_ids: { isrc: 'PHS032101734' },
              //   external_urls: { spotify: 'https://open.spotify.com/track/5sN738aTCOh2iFLts7sE99' },
              //   href: 'https://api.spotify.com/v1/tracks/5sN738aTCOh2iFLts7sE99',
              //   id: '5sN738aTCOh2iFLts7sE99',
              //   is_local: false,
              //   name: 'Kapit Lang',
              //   popularity: 17,
              //   preview_url: 'https://p.scdn.co/mp3-preview/801d3753856b1479f47e012cc03a509cf8ae8ff4?cid=186e095cb8c74eb79a24f741c8d1ae02',
              //   track_number: 1,
              //   type: 'track',
              //   uri: 'spotify:track:5sN738aTCOh2iFLts7sE99'
              // }
            }
          }, function(err) {
          console.error(err);
          });
          if(check==0) {
            console.log(`\x1b[47m \x1b[31m ${(res[0])[i].name} 의 ${(res[0])[i].song}이 없다고 하네요 저런... \x1b[0m`)
          }
        },
        function(err) {
          console.log('Something went wrong when retrieving an access token', err);
        }
      )
      console.log(2)
    } 
  }
  finally{
    db && db.end();
  }
}
  
  
  
  
  
  
  
  run()
  