import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import App, { directions } from './App';

Enzyme.configure({ adapter: new Adapter() });

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
  it('canPlay should return a boolean', () => {
    expect(app.canPlay(wrapper.state().grid, 1)).toBeType('boolean');
  });
});
