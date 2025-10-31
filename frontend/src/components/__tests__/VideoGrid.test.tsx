import { act, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import VideoGrid from '../VideoGrid';
import fetchMock from 'jest-fetch-mock';
import { describe, beforeEach, it, expect } from '@jest/globals';

describe('this component', () => {
  beforeEach(() => {
    fetchMock.resetMocks(); // Reset mocks before each test
  });

  it('renders correctly', async () => {
    // Provide a minimal videos prop to VideoGrid so it can render
    const sampleVideos = [
      { name: 'video1.mp4', title: 'Video One', posterUrl: '/poster1.png' },
      { name: 'video2.mp4', title: 'Video Two', posterUrl: '/poster2.png' },
    ];

    fetchMock.mockResponseOnce(JSON.stringify(['video 1 test', 'video 2 test']));
    const asFragment = await act(async () => {
      return render(
        <MemoryRouter>
          <VideoGrid videos={sampleVideos as any} />
        </MemoryRouter>
      ).asFragment;
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
