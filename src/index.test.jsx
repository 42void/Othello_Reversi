import ReactDOM from 'react-dom';
import React from 'react';
import App from './App';

jest.mock('react-dom', () => ({ render: jest.fn() }));

describe('Application root', () => {
  it('should render without crashing', () => {
    const div = document.createElement('div');
    div.id = 'app';
    document.body.appendChild(div);
    // eslint-disable-next-line global-require
    require('./index.jsx');
    expect(ReactDOM.render).toHaveBeenCalledWith(<App />, div);
  });
});
