import { buildYouTubeVideoDescriptor, extractYouTubeVideoId } from './youtube-video.util';

describe('YouTube video util', () => {
  it('extracts the video id from a watch URL', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=cf940AVFnIg')).toBe('cf940AVFnIg');
  });

  it('builds a normalized descriptor', () => {
    expect(buildYouTubeVideoDescriptor('https://www.youtube.com/watch?v=cf940AVFnIg')).toEqual({
      id: 'cf940AVFnIg',
      watchUrl: 'https://www.youtube.com/watch?v=cf940AVFnIg',
      embedUrl: 'https://www.youtube.com/embed/cf940AVFnIg',
    });
  });

  it('rejects unsupported URLs', () => {
    expect(extractYouTubeVideoId('https://example.com/watch?v=cf940AVFnIg')).toBeNull();
  });
});
