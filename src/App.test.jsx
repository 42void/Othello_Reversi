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

test('initial state', async () => {
  expect(wrapper.state().player).toEqual(1);
  expect(wrapper.state().grid).toEqual([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ]);
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
  });
  it('createGrid should return a array', () => {
    expect(app.createGrid()).toBeType('array');
  });
  it('canPlay should return a boolean', () => {
    expect(app.canPlay(wrapper.state().grid, 1)).toBeType('boolean');
  });
  it('victoryMessage should return a string', () => {
    expect(app.victoryMessage(wrapper.state().grid)).toBeType('string');
  });
  it('getScore should return a object', () => {
    expect(app.getScore(wrapper.state().grid)).toBeType('object');
    expect(app.getScore(wrapper.state().grid)).toEqual({ scoreWhite: 2, scoreBlack: 2 });
  });
  it('should make a post request', () => {
    const postSpy = jest.spyOn(axios, 'post');
    shallow(
      <App />,
    );
    expect(postSpy).toBeCalled();
  });
  it('should display the message in corresponding <p> if state.msg contains a message', () => {
    const appComponent = shallow(<App />);
    appComponent.setState({ msg: 'HEY' });
    expect(appComponent.containsMatchingElement(<p className="message">HEY</p>)).toEqual(true);
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
