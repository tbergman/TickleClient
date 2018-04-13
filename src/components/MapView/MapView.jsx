import React, { PureComponent } from 'react';
// import * as d3 from 'd3';

import 'mapbox-gl/dist/mapbox-gl.css';
// import { Motion, spring } from 'react-motion';
import PropTypes from 'prop-types';
import * as Icon from 'react-feather';
import Spinner from 'react-loader-spinner';

// TODO: { LinearInterpolator, FlyToInterpolator }
import MapGL, { FlyToInterpolator } from 'react-map-gl';
import * as d3 from 'd3';
import { colorScale, brighterColorScale } from '../cards/styles';

// import ReactTimeout from 'react-timeout';
// import rasterTileStyle from 'raster-tile-style';
// import ngeohash from 'ngeohash';,
// import cx from './MapView.scss';
import { Card, CardMarker } from '../cards';
import SvgOverlay from '../utils/map-layers/SvgOverlay';
import CardGrid from './CardGrid';
import ContextView from './ContextView';
import ForceOverlay from './ForceOverlay';
import Title from './Title';
import TagBar from './TagBar';
import TagList from './TagList';
import { setify } from './utils';
// import StartNav from './StartNav';
// import { VisibleView, VisibleElement } from '../utils/MySensor.jsx';

// import { Grid } from '../utils';
// import { ScrollElement, ScrollView } from '../utils/ScrollView';

// import Modal from './components/utils/Modal';

// import CardOverlay from '../utils/map-layers/CardOverlay';
import {
  UserOverlay
  // UserMarker,
} from '../utils/map-layers/DivOverlay';

import ExtendableMarker from '../utils/ExtendableMarker';
import MapAreaRadius from '../utils/map-layers/MapAreaRadius';
import chroma from 'chroma-js';
// import cardIconSrc from '../utils/map-layers/cardIcon.svg';
import { Modal } from '../utils/modal';

const line = d3.line();

//TODO: adapt colors
const tagColors = [
  '#ffd700',
  '#ffb14e',
  '#fa8775',
  '#ea5f94',
  '#cd34b5',
  '#9d02d7',
  '#0000ff'
].map(c => chroma(c).alpha(0.1));

// const TimoutGrid = ReactTimeout(CardGrid);

const CardMetaControl = ({ action }) => (
  <div
    key={action.key}
    className="w-100"
    style={{ display: 'flex', alignContent: 'center', marginBottom: 30 }}
  >
    <button
      className="btn w-100"
      style={{
        background: 'whitesmoke',
        fontWeight: 'bold',
        transition: 'opacity 1s'
        // position: 'absolute',
        // top: -100
      }}
      onClick={action.func}
    >
      {(() => {
        switch (action.key) {
          case 'route':
            return <Icon.Map />;
          case 'selectCard':
            return <Icon.MapPin />;
          case 'flyToUser':
            return <Icon.User />;
          default:
            return <Spinner type="ThreeDots" color="grey" height={24} />;
        }
      })()}
    </button>
  </div>
);

CardMetaControl.propTypes = {
  action: PropTypes.shape({ key: PropTypes.string, func: PropTypes.func })
    .isRequired
};

class MapView extends PureComponent {
  static propTypes = {
    cards: PropTypes.array.isRequired,
    mapZoom: PropTypes.number.isRequired,
    userLocation: PropTypes.array.isRequired,
    selectedCardId: PropTypes.string.isRequired,
    selectedCard: PropTypes.object.isRequired,
    extCardId: PropTypes.string.isRequired,
    tagListView: PropTypes.bool.isRequired,
    tsneView: PropTypes.bool.isRequired,
    // centerLocation: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    cardChallengeOpen: PropTypes.bool.isRequired,
    AppOpenFirstTime: PropTypes.bool.isRequired,
    mapViewport: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number,
      zoom: PropTypes.number,
      latitude: PropTypes.number,
      longitude: PropTypes.number
    }).isRequired,

    userMoveAction: PropTypes.func.isRequired,
    changeMapViewportAction: PropTypes.func.isRequired,
    selectCardAction: PropTypes.func.isRequired,
    extCardAction: PropTypes.func.isRequired,
    toggleCardChallengeAction: PropTypes.func.isRequired,
    flyToUserAction: PropTypes.func.isRequired,
    screenResizeAction: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    // TODO put into container element
    const { screenResizeAction } = props;

    // this._onChangeViewport = this._onChangeViewport.bind(this);
    // this._userMove = this._userMove.bind(this);
    // this.gridSpan = this.gridSpan.bind(this);

    const width = window.innerWidth;
    const height = window.innerHeight;

    window.addEventListener('resize', () => {
      screenResizeAction({
        width: window.innerWidth,
        height: window.innerHeight
      });
    });

    // TODO: respect margins
    screenResizeAction({
      width,
      height
    });

    this.scrollTo = scrollTo.bind(this);
    this.node = null;
  }

  componentDidMount() {
    const map = this.map.getMap();
    // map._refreshExpiredTiles = false;
    console.log('mapREF', map);

    // const {
    //   computeTopicMapAction,
    //   width,
    //   height,
    //   longitude,
    //   latitude,
    //   zoom,
    //   cards
    // } = this.props;
    //
    // window.addEventListener('resize', () => {
    //   computeTopicMapAction({
    //     width: window.innerWidth,
    //     height: window.innerHeight,
    //     latitude,
    //     longitude,
    //     zoom,
    //     cards
    //   });
    // });

    // computeTopicMapAction({
    //   width,
    //   height,
    //   latitude,
    //   longitude,
    //   zoom,
    //   cards
    // });
    // const { screenResize } = this.props;
    // window.addEventListener('resize', () => {
    //   this.setState({
    //     mapHeight: {
    //       width: window.innerWidth,
    //       height: window.innerHeight
    //     }
    //   });
    // });

    navigator.geolocation.watchPosition(
      pos => {
        const userLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };

        // TODO:
        const centerLocation = { ...userLocation };
      },
      // 50.846749, 4.352349
      d => console.log('error watch pos', d),
      { timeout: 1000000 }
    );
  }

  componentWillUnmount() {
    window.addEventListener('resize', () => {});
    navigator.geolocation.watchPosition(() => {}, () => {}, { timeout: 1 });
    navigator.geolocation.getCurrentPosition(() => {}, () => {}, {
      timeout: 1
    });

    // navigator.geolocation.clearWatch(this.state.watchPosId);
  }

  render() {
    const {
      cards,
      zoom,
      userLocation,
      selectedCardId,
      latitude,
      longitude,
      width,
      height,
      extCardId,
      selectedCard,
      direction,
      mapViewport,
      // setCardOpacity,
      userSelected,
      userChangedMapViewport,
      compass,
      birdsEyeView,
      gridView,
      tsneView,
      tagListView,
      // AppOpenFirstTime,
      // headerPad,

      userMoveAction,
      changeMapViewportAction,
      selectCardAction,
      extCardAction,
      cardChallengeOpen,
      toggleCardChallengeAction,
      fetchDirectionAction,
      filterCardsAction,
      // flyToUserAction,
      nextCardControlAction,
      toggleTagListAction,
      toggleTsneViewAction,
      toggleGridAction
      // navigateFirstTimeAction
    } = this.props;

    // const vp = new PerspectiveMercatorViewport({
    //   width,
    //   height,
    //   zoom,
    //   latitude,
    //   longitude
    // });

    const cardPadding = 15;
    const paddingTop = 16;

    const cardSets = setify(cards);

    const tagColorScale = d3
      .scaleOrdinal()
      .domain(cardSets.map(s => s.key))
      .range(tagColors);

    const selectedTags = selectedCard ? selectedCard.tags : [];

    const barScale = d3
      .scaleLinear()
      .domain(d3.extent(cardSets, d => d.count))
      .range([20, 100]);

    const [w, h] = [20, 20];
    const r = 30;
    const animatedMarker = ({ x, y, selectedCardId, ...c }) => (
      <ExtendableMarker
        key={c.id}
        selected={extCardId === c.id}
        width={extCardId === c.id ? width - cardPadding : 25}
        height={extCardId === c.id ? height - cardPadding : 30}
        x={x}
        y={y}
        offsetX={extCardId === c.id ? 3 : 0}
        offsetY={3}
        preview={
          <div
            className="w-100 h-100"
            style={{
              position: 'relative'
            }}
          >
            {selectedCardId === c.id && (
              <div
                className="m-3"
                style={{
                  position: 'absolute',
                  background: 'grey',
                  border: '2px solid black',
                  borderRadius: '50%',
                  width: r * 2, // '13vw',
                  height: r * 2, // '13vw',
                  transform: `translate(${-r}px,${-r}px)`,
                  opacity: 0.5,
                  zIndex: -1000
                }}
              />
            )}
            <CardMarker
              {...c}
              style={{
                opacity: 1,
                position: 'absolute',
                zIndex: -100
                // width: w,
                // height: h
              }}
            />
          </div>
        }
      >
        <Card
          {...c}
          onClose={() => extCardAction(null)}
          onCollect={() =>
            toggleCardChallengeAction({ cardChallengeOpen: true })
          }
        />
      </ExtendableMarker>
    );

    return (
      <div className="w-100 h-100">
        <Modal
          visible={cardChallengeOpen}
          onClose={() =>
            toggleCardChallengeAction({ cardChallengeOpen: false })
          }
        >
          {/* TODO: put in real challenge */}
          <iframe
            title="emperors"
            src="http://thescalli.com/emperors/"
            style={{ border: 'none', width: '100%', height: '90vh' }}
          />
        </Modal>

        <div style={{ display: 'flex', width: '200px' }}>
          <button
            className="mt-3 ml-3 btn"
            style={{
              // position: 'absolute',
              zIndex: 3000,
              background: tagListView ? 'whitesmoke' : null
            }}
            onClick={toggleTagListAction}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                transform: 'rotate(90deg)'
              }}
            >
              <Icon.BarChart size={30} />
            </div>
          </button>
          <button
            className="mt-3 ml-3 btn"
            style={{
              // position: 'absolute',
              zIndex: 3000,
              background: gridView ? 'whitesmoke' : null
            }}
            onClick={toggleGridAction}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Icon.Grid size={30} />
            </div>
          </button>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            filter: tsneView && 'blur(4px)'
          }}
        >
          <MapGL
            ref={m => (this.map = m)}
            {...mapViewport}
            mapStyle={'mapbox://styles/jmaushag/cjesg6aqogwum2rp1f9hdhb8l'}
            onViewportChange={changeMapViewportAction}
            onClick={({ lngLat, deltaTime }) =>
              // TODO: fix later
              deltaTime > 30 && userMoveAction({ lngLat })
            }
          >
            <UserOverlay {...mapViewport} location={userLocation} />
            <SvgOverlay
              {...mapViewport}
              data={
                direction !== null
                  ? [
                    Object.values(userLocation).reverse(),
                    ...direction.routes[0].geometry.coordinates
                  ]
                  : []
              }
            >
              {([x, y], [nx, ny]) =>
                nx !== null &&
                ny !== null && (
                    <g>
                    <circle
                        r={3}
                      cx={x}
                      cy={y}
                        fill={colorScale(
                        selectedCard.challenge
                            ? selectedCard.challenge.type
                            : 'quiz'
                      )}
                      />
                    <path
                        d={line([[x, y], [nx, ny]])}
                        style={{
                        stroke: colorScale(selectedCard.challenge.type),
                          strokeWidth: 8
                        }}
                      />
                  </g>
                  )
              }
            </SvgOverlay>
          </MapGL>
        </div>
        <div
          style={{
            opacity: gridView ? 1 : 0,
            display: !gridView ? 'none' : null,
            transition: 'opacity 0.5s'
          }}
        >
          <CardGrid
            cards={cards}
            onSelect={selectCardAction}
            selectedCardId={selectedCardId}
            onExtend={extCardAction}
            width={98}
            unit={'vw'}
            controls={
              <CardMetaControl
                key={nextCardControlAction.key}
                action={nextCardControlAction}
              />
            }
            style={{
              height: '24vh',
              marginLeft: '2vw',
              marginRight: '2vw',
              zIndex: 2000,
              paddingTop
            }}
          />
          <TagBar
            tags={cardSets.filter(d => selectedTags.includes(d.key))}
            colorScale={tagColorScale}
            scale={barScale}
            onClick={filterCardsAction}
            className="mt-3"
            style={{ zIndex: 5000 }}
          />
        </div>
        <div
          style={{
            paddingTop,
            opacity: tagListView ? 1 : 0,
            transition: 'opacity 0.5s',
            display: !tagListView ? 'none' : null,
            zIndex: tagListView ? 5000 : null
          }}
        >
          <TagList data={cardSets} scale={barScale} />
        </div>
        <Title />
        <ForceOverlay
          viewport={mapViewport}
          data={cards}
          sets={cardSets}
          selectedCardId={selectedCardId}
          mode={!tsneView ? 'geo' : 'som'}
          padBottom={!gridView && !tagListView ? height * 1 / 6 : 50}
          padTop={gridView || tagListView ? height * 1 / 2 : height * 1 / 6}
          padLeft={70}
          padRight={70}
          colorScale={tagColorScale}
        >
          {animatedMarker}
        </ForceOverlay>
        <button
          className="fixed-bottom-right btn m-3"
          style={{
            // position: 'absolute',
            zIndex: 1000,
            background: tsneView && 'whitesmoke'
          }}
          onClick={toggleTsneViewAction}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Icon.Eye size={30} />
          </div>
        </button>
      </div>
    );
  }
}
export default MapView;
// export default MapView;
