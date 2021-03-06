import fetch from 'cross-fetch';
import * as d3 from 'd3';

import { receivePlaces, receiveCards, receiveAuthoredCards} from './components/MapView/actions';

import NearbyPlaces from './places.json';

import {
  // WebMercatorViewport,
  PerspectiveMercatorViewport
} from 'viewport-mercator-project';

import firestore from 'DB';

import gapi from './gapi';
// export const REQUEST_CHALLENGES = 'REQUEST_CHALLENGES';
// function requestChallenges(subreddit) {
//   return {
//     type: REQUEST_CHALLENGES,
//     subreddit
//   };
// }
// export const RECEIVE_CHALLENGES = 'RECEIVE_CHALLENGES';
// function receiveCards(json) {
//   return {
//     type: RECEIVE_CHALLENGES,
//     challenges: json,
//     receivedAt: Date.now()
//   };
// }

// export const SCREEN_RESIZE = 'SCREEN_RESIZE_jan';
// export function screenResize(options) {
//   return { type: SCREEN_RESIZE, options };
// }

gapi.load('client', () => {
  const discoveryUrl =
    'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest';

  // Initialize the gapi.client object, which app uses to make API requests.
  // Get API key and client ID from API Console.
  // 'scope' field specifies space-delimited list of access scopes.
  gapi.client
    .init({
      apiKey: process.env.GoogleAccessToken,
      discoveryUrl
      // discoveryDocs: [discoveryUrl]
      // clientId:
      //   '655124348640-ip7r33kh1vt5lbc2h5rij96mku6unreu.apps.googleusercontent.com',
      // scope: SCOPE
    })
    .then(() =>
      gapi.client
        .request({
          path: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
          params: {}
        })
        .execute(
          d => console.log('hey rexxxx', d),
          err => console.log('err', err)
        )
    );
});

// Meet our first thunk action creator!
// Though its insides are different, you would use it just like any other action creator:
// store.dispatch(fetchPosts('reactjs'))
// export function fetchChallenges(userid) {
//   // Thunk middleware knows how to handle functions.
//   // It passes the dispatch method as an argument to the function,
//   // thus making it able to dispatch actions itself.
//   console.log('dispatch fetch challenges');
//   return function(dispatch) {
//     // First dispatch: the app state is updated to inform
//     // that the API call is starting.
//     // dispatch(requestChallenges(userid));
//     // The function called by the thunk middleware can return a value,
//     // that is passed on as the return value of the dispatch method.
//     // In this case, we return a promise to wait for.
//     // This is not required by thunk middleware, but it is convenient for us.
//     return fetch(
//       'http://thescalli.com/root/index.php/scheduleREST1/schedule/id/64'
//     )
//       .then(
//         response => response.json(),
//         // Do not use catch, because that will also catch
//         // any errors in the dispatch and resulting render,
//         // causing a loop of 'Unexpected batch number' errors.
//         // https://github.com/facebook/react/issues/6895
//         error => console.log('An error occurred in fetching challenges.', error)
//       )
//       .then(json => {
//         // We can dispatch many times!
//         // Here, we update the app state with the results of the API call.
//         console.log('challenges', json);
//         dispatch(receiveCards(json));
//       });
//   };
// }

export function fetchCards(userid) {
  // Thunk middleware knows how to handle functions.
  // It passes the dispatch method as an argument to the function,
  // thus making it able to dispatch actions itself.
  return function(dispatch) {
    return firestore
      .collection('cards')
      .get()
      .then(querySnapshot => {
        const data = [];
        querySnapshot.forEach(doc => data.push(doc.data()));
        dispatch(receiveCards(data));
      });
  };
}

export function fetchAuthoredCards(userid) {
  // Thunk middleware knows how to handle functions.
  // It passes the dispatch method as an argument to the function,
  // thus making it able to dispatch actions itself.
  return function(dispatch) {
    return firestore
      .collection('authoredCards')
      .get()
      .then(querySnapshot => {
        const data = [];
        querySnapshot.forEach(doc => data.push(doc.data()));
        dispatch(receiveAuthoredCards(data));
      });
  };
}

// export function computeTSNE(userid) {
//   // Thunk middleware knows how to handle functions.
//   // It passes the dispatch method as an argument to the function,
//   // thus making it able to dispatch actions itself.
//   return function(dispatch) {
//     // First dispatch: the app state is updated to inform
//     // that the API call is starting.
//     // dispatch(requestChallenges(userid));
//     // The function called by the thunk middleware can return a value,
//     // that is passed on as the return value of the dispatch method.
//     // In this case, we return a promise to wait for.
//     // This is not required by thunk middleware, but it is convenient for us.
//     return fetch('http://thescalli.com/root/index.php/scheduleREST1/schedules')
//       .then(
//         response => response.json(),
//         // Do not use catch, because that will also catch
//         // any errors in the dispatch and resulting render,
//         // causing a loop of 'Unexpected batch number' errors.
//         // https://github.com/facebook/react/issues/6895
//         error => console.log('An error occurred.', error)
//       )
//       .then(json =>
//         // We can dispatch many times!
//         // Here, we update the app state with the results of the API call.
//         dispatch(receiveCards(json))
//       );
//   };
// }

// export function computeTopicMap({
//   cards,
//   width,
//   height,
//   longitude,
//   latitude,
//   zoom
// }) {
//   // Thunk middleware knows how to handle functions.
//   // It passes the dispatch method as an argument to the function,
//   // thus making it able to dispatch actions itself.
//   const vp = new PerspectiveMercatorViewport({
//     width,
//     height,
//     zoom,
//     latitude,
//     longitude
//   });
//
//   const cardsPos = cards.map(c => vp.project(c.loc));
//
//   return function(dispatch) {
//     return new Promise(resolve => {
//       d3.forceSimulation(cardsPos).on('end', () => {
//         dispatch(getTopicMap(cardsPos));
//       });
//     });
//
//     // .force('x', d3.forceX((d, i) => normPos[i].tx).strength(0.1))
//     // .force('y', d3.forceY((d, i) => normPos[i].ty).strength(0.1))
//     // .force(
//     //   'cont',
//     //   forceSurface()
//     //     .surfaces([
//     //       { from: { x: 0, y: 0 }, to: { x: 0, y: h } },
//     //       { from: { x: 0, y: h }, to: { x: w, y: h } },
//     //       { from: { x: w, y: h }, to: { x: w, y: 0 } },
//     //       { from: { x: w, y: 0 }, to: { x: 0, y: 0 } }
//     //     ])
//     //     .oneWay(true)
//     //     .elasticity(1)
//     //     .radius(r)
//     // )
//     // .force(
//     //   'collide',
//     //   d3.forceCollide(r).strength(1)
//     //   // .iterations(10)
//     // )
//     // return fetch('http://thescalli.com/root/index.php/scheduleREST1/schedules')
//     //   .then(
//     //     response => response.json(),
//     //     // Do not use catch, because that will also catch
//     //     // any errors in the dispatch and resulting render,
//     //     // causing a loop of 'Unexpected batch number' errors.
//     //     // https://github.com/facebook/react/issues/6895
//     //     error => console.log('An error occurred.', error)
//     //   )
//     //   .then(json =>
//     //     // We can dispatch many times!
//     //     // Here, we update the app state with the results of the API call.
//     //     dispatch(receiveCards(json))
//     //   );
//   };
// }

export function fetchNearByPlaces() {
  // Thunk middleware knows how to handle functions.
  // It passes the dispatch method as an argument to the function,
  // thus making it able to dispatch actions itself.
  return function(dispatch) {
    const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
    // First dispatch: the app state is updated to inform
    // that the API call is starting.
    // dispatch(requestChallenges(userid));
    // The function called by the thunk middleware can return a value,
    // that is passed on as the return value of the dispatch method.
    // In this case, we return a promise to wait for.
    // This is not required by thunk middleware, but it is convenient for us.

    dispatch(receivePlaces(NearbyPlaces));
    return (
      fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=50.847109,4.352439&radius=500&key=${
          process.env.GoogleAccessToken
        }${PROXY_URL}`
      )
    // .then(
    //   response => console.log('nearbysearch', response),
    //   // Do not use catch, because that will also catch
    //   // any errors in the dispatch and resulting render,
    //   // causing a loop of 'Unexpected batch number' errors.
    //   // https://github.com/facebook/react/issues/6895
    //   error => console.log('An error occurred.', error)
    // )
      .then(json => {
        dispatch(receivePlaces(NearbyPlaces));
      })
    );
  };
}
