import React, { Component } from 'react';
import PropTypes from 'prop-types';
import throttle from 'react-throttle-render';
// import VisibilitySensor from 'react-visibility-sensor/visibility-sensor.js';

import { TransitionGroup, Transition } from 'react-transition-group/';
// import { ScrollView, ScrollElement } from '../utils/ScrollView';
import { PreviewCard } from '../cards';

function createStacks(cards, selectedCardId) {
  const selectedCardIndex = cards.findIndex(d => d.id === selectedCardId);
  return [
    {
      position: 'left',
      cards: cards.slice(0, selectedCardIndex)
    },
    {
      position: 'center',
      cards: [cards[selectedCardIndex]]
    },
    {
      position: 'right',
      cards: cards.slice(selectedCardIndex + 1, cards.length).reverse()
    }
  ];
}

class CardGrid extends Component {
  static propTypes = {
    cards: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    onExtend: PropTypes.func.isRequired,
    controls: PropTypes.node.isRequired,
    offset: PropTypes.number.isRequired,
    selectedCardId: PropTypes.any,
    style: PropTypes.object,
    visible: PropTypes.bool
  };

  static defaultProps = {
    style: {},
    selectedCardId: null,
    setCardOpacity(d) {
      return d;
    },
    visible: true
  };

  constructor(props) {
    super(props);
    this.id = null;
    this.box = null;
    // TODO: remove later when cards is empty
    const selectedCardId = props.cards[0].id;
    this.state = {
      selectedCardId,
      selectedCardStack: null,
      cardStacks: createStacks(props.cards, selectedCardId)
    };

    this.transitionStyles = this.transitionStyles.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { cards, selectedCardId } = nextProps;
    const cardStacks = createStacks(cards, selectedCardId);
    // this.setState({ cardStacks });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.selectedCardId !== nextState.selectedCardId ||
      this.props.cards.length !== nextProps.cards.length
    ); // nextProps.selected !== this.props.selected;
    // return true;
  }

  componentDidUpdate(prevProps, prevState) {
    const { onSelect } = this.props;
    const { selectedCardId } = this.state;
    if (
      selectedCardId !== null &&
      prevState.selectedCardId !== selectedCardId
    ) {
      onSelect(selectedCardId);
    }
  }

  transitionStyles = (i, j, slotSize) => {
    const { selectedCardStack, cardStacks } = this.state;
    const [leftCards, rightCards] = [cardStacks[0].cards, cardStacks[2].cards];
    const zStep = 10;
    const zIndex =
      selectedCardStack === 'right'
        ? leftCards.length + 1
        : rightCards.length + 1;

    const entered = {
      left: `${i * slotSize}vw`,
      transform: `translateZ(${j * 10}px) scale(1)`
    };
    return {
      entered,
      entering: { display: 'none' },
      exiting: {
        left: `${slotSize * (selectedCardStack === 'right' ? i - 1 : i + 1)}vw`,
        transitionTimingFunction: 'ease-in',
        transform: `translate3d(0,0,${zIndex * zStep}px) scale(1)`,
        zIndex: 2000
      }
    };
  };
  // componentWillUpdate(nextProps, nextState) {
  //   const { selectedCardId } = this.state;
  //   if (
  //     selectedCardId !== null &&
  //     nextState.selectedCardId !== selectedCardId
  //   ) {
  //     this._scroller.scrollTo(selectedCardId);
  //   }
  // }

  render() {
    const { cards, onExtend, style, controls, onSelect, visible } = this.props;
    const { selectedCardId, cardStacks } = this.state;

    if (cards.length === 0 || !visible) return null;
    const selectedCardIndex = cards.findIndex(d => d.id === selectedCardId);

    const duration = 500;
    const margin = 5;
    const slotSize = 100 / cardStacks.length;

    const dotOpacity = { entering: 0, entered: 1, exiting: 0, exited: 0 };

    return (
      <div style={{ ...style, height: '30vh' }}>
        <TransitionGroup
          style={{
            perspective: '2400px',
            perspectiveOrigin: '50% -50%',
            height: '20vh'
          }}
        >
          {cardStacks.map((s, i) =>
            s.cards.map((d, j) => (
              <Transition
                key={d.id}
                in={false}
                timeout={duration}
                className="h-100"
              >
                {state => (
                  <div
                    className="h-100"
                    style={{
                      position: 'absolute',
                      width: `${slotSize - 2 * margin}vw`,
                      marginLeft: `${margin}vw`,
                      marginRight: `${margin}vw`,
                      cursor: 'pointer',
                      maxWidth: '30vw',
                      transition: `left ${duration /
                        1000}s, transform ${duration / 1000}s`,
                      ...this.transitionStyles(i, j, slotSize)[state]
                    }}
                    onClick={() =>
                      selectedCardId === d.id
                        ? onExtend(d.id)
                        : this.setState({
                            selectedCardId: d.id,
                          selectedCardStack: s.position,
                          cardStacks: createStacks(cards, d.id)
                        })
                    }
                  >
                    <div style={{ opacity: selectedCardId === d.id ? 1 : 0 }}>
                      {controls}
                    </div>
                    <PreviewCard {...d} selected={selectedCardId === d.id} />
                  </div>
                )}
              </Transition>
            ))
          )}
        </TransitionGroup>
        <TransitionGroup
          className="ml-3 mr-3"
          style={{
            marginTop: 120,
            display: 'flex',
            justifyContent: 'center',
            // border: 'solid 5px rosybrown',
            zIndex: 2000
          }}
        >
          {cards.map((c, i) => (
            <Transition key={c.id} timeout={{ enter: 400, exit: 400 }}>
              {state => (
                <div
                  className="ml-1 mr-1"
                  style={{
                    width: '4vw',
                    height: '4vw',
                    border: 'solid 2px rosybrown',
                    borderRadius: '50%',
                    background: selectedCardIndex === i ? 'rosybrown' : 'white',
                    opacity: dotOpacity[state],
                    transition: 'opacity 0.3s',
                    zIndex: 2000
                  }}
                />
              )}
            </Transition>
          ))}
        </TransitionGroup>
      </div>
    );
  }
}
export default throttle(1000)(CardGrid);
