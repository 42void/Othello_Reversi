import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import axios from 'axios';
import WS from 'jest-websocket-mock';
import App, { directions } from './App';

Enzyme.configure({ adapter: new Adapter() });

console.error = jest.fn();
console.log = jest.fn();
console.warn = jest.fn();

jest.mock('axios');

let wrapper;
beforeEach(() => {
  wrapper = mount(<App />);
});

const values = [
  [0, 1], [0, -1], [1, 0], [-1, 0],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

test('directions values', () => {
  expect(directions.toString()).toContain(values);
});

const initialGrid = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 2, 1, 0, 0, 0],
  [0, 0, 0, 1, 2, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const blackWins = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const whiteWins = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 2, 2, 0, 0, 0],
  [0, 0, 2, 2, 2, 2, 0, 0],
  [0, 0, 0, 0, 2, 2, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const nobodyWins = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 2, 2, 0, 1, 1],
  [0, 0, 0, 2, 2, 0, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const whiteCannotPlay = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0],
];

// different games that can appear in the array returned by getGamesList
const mockGameId = '981bs81mockGameID';
const initialGame = {
  id: 0,
  currentPlayer: 1,
  grid: initialGrid,
  gameID: mockGameId,
  blackID: null,
  whiteID: null,
  lastChanged: 1570000000,
};

const blackWinsGame = {
  id: 1,
  currentPlayer: 1,
  grid: blackWins,
  gameID: '111231mockGameID',
  blackID: null,
  whiteID: null,
  lastChanged: 1570000001,
};

const nobodyWinsGame = {
  id: 2,
  currentPlayer: 1,
  grid: nobodyWins,
  gameID: '0000121mockGameID',
  blackID: null,
  whiteID: null,
  lastChanged: 1570000002,
};

const whiteCannotPlayGame = {
  id: 3,
  currentPlayer: 3,
  grid: whiteCannotPlay,
  gameID: '22222mockGameID',
  blackID: null,
  whiteID: null,
  lastChanged: 1570000003,
};

const whiteWinsGame = {
  id: 4,
  currentPlayer: 1,
  grid: whiteWins,
  gameID: '2223a9881n1mockGameID',
  blackID: null,
  whiteID: null,
  lastChanged: 1570000004,
};


expect.extend({
  toBeType(received, argument) {
    const initialType = typeof received;
    let type;
    if (initialType === 'object') {
      if (Array.isArray(received)) {
        type = 'array';
      } else {
        type = initialType;
      }
    } else {
      type = initialType;
    }
    return type === argument ? {
      message: () => `expected ${received} to be type ${argument}`,
      pass: true,
    } : {
      message: () => `expected ${received} to be type ${argument}`,
      pass: false,
    };
  },
});

describe('Game logic', () => {
  const app = new App();

  it('getOpponent should return opponent of type number', () => {
    expect(app.getOpponent(1)).toEqual(2);
    expect(app.getOpponent(2)).toEqual(1);
    expect(app.getOpponent(2)).toBeType('number');
  });
  it('inGrid should return false of type boolean if not in grid', () => {
    expect(app.inGrid(8, 8)).toBeType('boolean');
    expect(app.inGrid(0, 0)).toEqual(true);
    expect(app.inGrid(7, 7)).toEqual(true);
    expect(app.inGrid(4, 8)).toEqual(false);
    expect(app.inGrid(-1, 4)).toEqual(false);
    expect(app.inGrid(4, -1)).toEqual(false);
    expect(app.inGrid(8, 8)).toEqual(false);
    expect(app.inGrid(8, 4)).toEqual(false);
    expect(app.inGrid(4, 8)).toEqual(false);
  });
  it('canPlay should return a correct boolean', () => {
    expect(app.canPlay(initialGrid, 1)).toBeType('boolean');
    expect(app.canPlay(initialGrid, 1)).toBe(true);
    expect(app.canPlay(initialGrid, 2)).toBe(true);
    expect(app.canPlay(blackWins, 1)).toBe(false);
    expect(app.canPlay(blackWins, 2)).toBe(false);
    expect(app.canPlay(whiteWins, 1)).toBe(false);
    expect(app.canPlay(whiteWins, 2)).toBe(false);
    expect(app.canPlay(nobodyWins, 1)).toBe(false);
    expect(app.canPlay(nobodyWins, 2)).toBe(false);
    expect(app.canPlay(whiteCannotPlay, 1)).toBe(true);
    expect(app.canPlay(whiteCannotPlay, 2)).toBe(false);
  });
  it('victoryMessage should return a correct string', () => {
    expect(app.victoryMessage(initialGrid)).toBeType('string');
    expect(app.victoryMessage(blackWins)).toMatch(/black/i);
    expect(app.victoryMessage(whiteWins)).toMatch(/white/i);
    expect(app.victoryMessage(nobodyWins)).toMatch(/draw/i);
  });
  it('getScore should return a correct object', () => {
    expect(app.getScore(initialGrid)).toBeType('object');
    expect(app.getScore(initialGrid)).toEqual({ scoreWhite: 2, scoreBlack: 2 });
    expect(app.getScore(nobodyWins)).toEqual({ scoreWhite: 4, scoreBlack: 4 });
    expect(app.getScore(blackWins)).toEqual({ scoreWhite: 0, scoreBlack: 8 });
    expect(app.getScore(whiteWins)).toEqual({ scoreWhite: 8, scoreBlack: 0 });
  });
  it('gameEnded should return a correct boolean', () => {
    expect(app.gameEnded(initialGrid)).toBeType('boolean');
    expect(app.gameEnded(initialGrid)).toBe(false);
    expect(app.gameEnded(blackWins)).toBe(true);
    expect(app.gameEnded(whiteWins)).toBe(true);
    expect(app.gameEnded(nobodyWins)).toBe(true);
    expect(app.gameEnded(whiteCannotPlay)).toBe(false);
  });
  it('possibleMoves should return a correct array', () => {
    expect(app.possibleMoves(initialGrid, 1)).toBeType('array');
    expect(app.possibleMoves(initialGrid, 1)).toHaveLength(4);
    expect(app.possibleMoves(initialGrid, 2)).toHaveLength(4);
    expect(app.possibleMoves(blackWins, 2)).toHaveLength(0);
    expect(app.possibleMoves(whiteWins, 2)).toHaveLength(0);
    expect(app.possibleMoves(nobodyWins, 2)).toHaveLength(0);
    expect(app.possibleMoves(whiteCannotPlay, 1)).toHaveLength(1);
    expect(app.possibleMoves(whiteCannotPlay, 2)).toHaveLength(0);
  });
  it('playerName should be the correct string', () => {
    expect(app.playerName(1)).toMatch(/black/i);
    expect(app.playerName(2)).toMatch(/white/i);
  });
  it('stringOfInProgressGame should be a correct string', () => {
    expect(app.stringOfInProgressGame(initialGame)).toMatch(/black.s.turn/i);
    expect(app.stringOfInProgressGame(whiteCannotPlayGame)).toMatch(/white.s.turn/i);
  });
  it('stringOfEndedGame should be a correct string', () => {
    expect(app.stringOfEndedGame(blackWinsGame)).toMatch(/black won/i);
    expect(app.stringOfEndedGame(whiteWinsGame)).toMatch(/white won/i);
    expect(app.stringOfEndedGame(nobodyWinsGame)).toMatch(/draw/i);
  });
});

describe('App component', () => {
  const app = new App();

  it('renders', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
  it('matches snapshot', () => {
    const component = renderer.create(<App />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('contains a title "Othello"', () => {
    const appComponent = shallow(<App />);
    expect(appComponent.containsMatchingElement(<h1>Othello</h1>)).toEqual(true);
  });
  it('Should call reverseAndAddPiecesIfValid on square click', async () => {
    const sq = wrapper.find('.square');

    const instance = wrapper.instance();
    const fn = jest.spyOn(instance, 'reverseAndAddPiecesIfValid');

    sq.at(44).simulate('click', fn);
    expect(fn).toHaveBeenCalledTimes(1);

    fn.mockClear();
  });
  it('createGrid should return a array', () => {
    expect(app.createGrid()).toBeType('array');
  });
  it('saveGame should make a post request', () => {
    const postSpy = jest.spyOn(axios, 'post');
    app.saveGame();
    expect(postSpy).toBeCalledTimes(1);
  });
  it('checkVictoryAndSaveGame should make a post request', () => {
    const postSpy = jest.spyOn(axios, 'post');
    app.checkVictoryAndSaveGame(initialGrid, 1);
    expect(postSpy).toBeCalled();
  });
  it('should make a post request', () => {
    const postSpy = jest.spyOn(axios, 'post');
    shallow(
      <App />,
    );
    expect(postSpy).toBeCalled();
  });
  it('playRandomMove should make a post request', async () => {
    const postSpy = jest.spyOn(axios, 'post');
    app.playRandomMove();
    expect(postSpy).toBeCalled();
  });
  it('the msg in the state should be displayed in corresponding tag', () => {
    const appComponent = shallow(<App />);
    appComponent.setState({ msg: 'TESTINGSTRING18471b2' });
    expect(appComponent.containsMatchingElement(<p className="message">TESTINGSTRING18471b2</p>)).toEqual(true);
  });
  it('the current player should be displayed', () => {
    const appComponent = shallow(<App />);
    appComponent.setState({ player: 1 });
    expect(appComponent.text()).not.toMatch(/WHITE/);
    expect(appComponent.text()).toMatch(/BLACK/);
    appComponent.setState({ player: 2 });
    expect(appComponent.text()).toMatch(/WHITE/);
    expect(appComponent.text()).not.toMatch(/BLACK/);
  });
  it('the gamesList should be displayed', () => {
    const appComponent = shallow(<App />);
    appComponent.setState({ gamesList: [] });
    expect(appComponent.text()).toMatch(/no ended game/i);
    expect(appComponent.text()).toMatch(/no game in progress/i);
    expect(appComponent.text()).not.toMatch(/white.s.turn/i);
    expect(appComponent.text()).not.toMatch(/black.s.turn/i);
    expect(appComponent.text()).not.toMatch(/black won/i);
    expect(appComponent.text()).not.toMatch(/white won/i);
    expect(appComponent.text()).not.toMatch(/draw/i);
    appComponent.setState({ gamesList: [initialGame] });
    expect(appComponent.text()).toMatch(/no ended game/i);
    expect(appComponent.text()).not.toMatch(/no game in progress/i);
    expect(appComponent.text()).not.toMatch(/white.s.turn/i);
    expect(appComponent.text()).toMatch(/black.s.turn/i);
    expect(appComponent.text()).not.toMatch(/black won/i);
    expect(appComponent.text()).not.toMatch(/white won/i);
    expect(appComponent.text()).not.toMatch(/draw/i);
    appComponent.setState({ gamesList: [whiteCannotPlayGame] });
    expect(appComponent.text()).toMatch(/no ended game/i);
    expect(appComponent.text()).not.toMatch(/no game in progress/i);
    expect(appComponent.text()).toMatch(/white.s.turn/i);
    expect(appComponent.text()).not.toMatch(/black.s.turn/i);
    expect(appComponent.text()).not.toMatch(/black won/i);
    expect(appComponent.text()).not.toMatch(/white won/i);
    expect(appComponent.text()).not.toMatch(/draw/i);
    appComponent.setState({ gamesList: [blackWinsGame] });
    expect(appComponent.text()).not.toMatch(/no ended game/i);
    expect(appComponent.text()).toMatch(/no game in progress/i);
    expect(appComponent.text()).not.toMatch(/white.s.turn/i);
    expect(appComponent.text()).not.toMatch(/black.s.turn/i);
    expect(appComponent.text()).toMatch(/black won/i);
    expect(appComponent.text()).not.toMatch(/white won/i);
    expect(appComponent.text()).not.toMatch(/draw/i);
    appComponent.setState({ gamesList: [whiteWinsGame] });
    expect(appComponent.text()).not.toMatch(/no ended game/i);
    expect(appComponent.text()).toMatch(/no game in progress/i);
    expect(appComponent.text()).not.toMatch(/white.s.turn/i);
    expect(appComponent.text()).not.toMatch(/black.s.turn/i);
    expect(appComponent.text()).not.toMatch(/black won/i);
    expect(appComponent.text()).toMatch(/white won/i);
    expect(appComponent.text()).not.toMatch(/draw/i);
    appComponent.setState({ gamesList: [nobodyWinsGame] });
    expect(appComponent.text()).not.toMatch(/no ended game/i);
    expect(appComponent.text()).toMatch(/no game in progress/i);
    expect(appComponent.text()).not.toMatch(/white.s.turn/i);
    expect(appComponent.text()).not.toMatch(/black.s.turn/i);
    expect(appComponent.text()).not.toMatch(/black won/i);
    expect(appComponent.text()).not.toMatch(/white won/i);
    expect(appComponent.text()).toMatch(/draw/i);
    appComponent.setState({
      gamesList: [initialGame, whiteCannotPlayGame, blackWinsGame, whiteWinsGame, nobodyWinsGame],
    });
    expect(appComponent.text()).not.toMatch(/no ended game/i);
    expect(appComponent.text()).not.toMatch(/no game in progress/i);
    expect(appComponent.text()).toMatch(/white.s.turn/i);
    expect(appComponent.text()).toMatch(/black.s.turn/i);
    expect(appComponent.text()).toMatch(/black won/i);
    expect(appComponent.text()).toMatch(/white won/i);
    expect(appComponent.text()).toMatch(/draw/i);
  });
});

test('the server keeps track of received messages', async () => {
  const server = new WS('ws://localhost:4242');
  const client = new WebSocket('ws://localhost:4242');

  await server.connected;
  client.send('hello');
  await expect(server).toReceiveMessage('hello');
  expect(server).toHaveReceivedMessages(['hello']);
});

test('the mock server sends messages to connected clients', async () => {
  const server = new WS('ws://localhost:w');
  const client1 = new WebSocket('ws://localhost:w');
  await server.connected;
  const client2 = new WebSocket('ws://localhost:w');
  await server.connected;

  const messages = { client1: [], client2: [] };
  client1.onmessage = (e) => {
    messages.client1.push(e.data);
  };
  client2.onmessage = (e) => {
    messages.client2.push(e.data);
  };

  server.send('hello everyone');
  expect(messages).toEqual({
    client1: ['hello everyone'],
    client2: ['hello everyone'],
  });
});
