import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
  queryByText,
  queryByTestId,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { DialogMessage } from './index';

afterEach(cleanup);

it('renders as expected', () => {
  const onDismiss = jest.fn();
  const { queryByTestId } = render(
    <DialogMessage onDismiss={onDismiss}>
      <div data-testid="children">Hi mom</div>
    </DialogMessage>
  );
  expect(queryByTestId('dialog-message-container')).toHaveClass('blocker');
  expect(queryByTestId('children')).toBeInTheDocument();
});

it('accepts an alternate className', () => {
  const onDismiss = jest.fn();
  const { queryByTestId } = render(
    <DialogMessage onDismiss={onDismiss} className="barquux">
      <div data-testid="children">Hi mom</div>
    </DialogMessage>
  );
  expect(queryByTestId('dialog-message-content')).toHaveClass('barquux');
});

it('calls onDismiss on click outside', () => {
  const onDismiss = jest.fn();
  const { container, getByTestId } = render(
    <DialogMessage onDismiss={onDismiss}>
      <div data-testid="children">Hi mom</div>
    </DialogMessage>
  );
  fireEvent.click(getByTestId('dialog-message-content'));
  expect(onDismiss).not.toHaveBeenCalled();
  fireEvent.click(container);
  expect(onDismiss).toHaveBeenCalled();
});

it('hides the close button when onDismiss is not supplied', () => {
  const { queryByTestId } = render(
    <DialogMessage>
      <div data-testid="children">Hi mom</div>
    </DialogMessage>
  );
  expect(queryByTestId('dialog-dismiss')).not.toBeInTheDocument();
});
