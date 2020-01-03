import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Piece from './Piece';

Enzyme.configure({ adapter: new Adapter() });

let wrapper;
beforeEach(() => {
  wrapper = mount(<Piece color={1} />);
});

describe('Piece component', () => {
  it('renders', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Piece color={1} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
  it('matches snapshot', () => {
    const component = renderer.create(<Piece color={1} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
