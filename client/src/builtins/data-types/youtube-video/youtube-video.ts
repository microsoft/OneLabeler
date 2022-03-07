/**
 * Custom YoutubeVideoElement that mocks the api of HTMLVideoElement.
 *
 * References:
 * [1] https://github.com/markcellus/youtube-video-js
 * [2] https://github.com/muxinc/youtube-video-element
 */

import YTPlayer from 'yt-player';

const getIdFromUrl = (url: string): string => {
  const re = new RegExp(
    // eslint-disable-next-line quotes
    `https?:\\/\\/(?:[0-9A-Z-]+\\.)?(?:youtu\\.be\\/|youtube(?:-nocookie)?\\.com\\S*[^\\w\\s-])([\\w-]{11})(?=[^\\w-]|$)(?![?=&+%\\w.-]*(?:['"][^<>]*>|<\\/a>))[?=&+%\\w.-]*`,
    'ig',
  );
  return url.replace(re, '$1');
};

class YoutubeVideoElement extends HTMLElement {
  paused = true;

  private metadataLoaded = false;

  private ytPlayer: YTPlayer | null = null;

  private ytPlayerContainer: HTMLElement | null = null;

  private mediaError: Error | null = null;

  connectedCallback(): void {
    this.ytPlayerContainer = document.createElement('div');
    // to adhere to shape of youtube generated iframe
    this.ytPlayerContainer.style.display = 'block';
    this.ytPlayerContainer.style.width = '100%';
    this.ytPlayerContainer.style.height = '100%';
    this.appendChild(this.ytPlayerContainer);

    // Note: the player cannot be built before connectedCallback
    // because the Youtube iframe api requires the
    // rendered location (i.e., the ytPlayerContainer)
    // to be on the DOM when creating the player.
    this.ytPlayer = this.buildPlayer(this.ytPlayerContainer);
    this.load();
  }

  attributeChangedCallback(name: string): void {
    if (name === 'src') {
      this.load();
    }
  }

  disconnectedCallback(): void {
    if (this.ytPlayer) {
      this.ytPlayer.destroy();
    }
  }

  static get observedAttributes(): string[] { return ['src']; }

  private load(): void {
    this.metadataLoaded = false;
    this.dispatchEvent(new CustomEvent('loadstart'));
    if (this.ytPlayer === null) return;
    this.ytPlayer.load(getIdFromUrl(this.src));
  }

  // Dispatch loadedmetadata after duration is available.
  private loadMetadata(): void {
    if (this.metadataLoaded) return;
    if (!(this.duration > 0)) {
      setTimeout(() => this.loadMetadata(), 50);
    } else {
      this.metadataLoaded = true;
      this.dispatchEvent(new CustomEvent('loadedmetadata'));
    }
  }

  // Note: play() of native video element returns a promise
  async play(): Promise<void> {
    this.paused = false;
    if (!this.src) {
      this.error = new Error('DOMException: The element has no supported sources.');
    } else if (this.ytPlayer !== null) {
      this.ytPlayer.play();
    }
  }

  pause(): void {
    if (this.ytPlayer) {
      this.ytPlayer.pause();
    }
  }

  private buildPlayer(container: HTMLElement): YTPlayer {
    const player = new YTPlayer(container, {
      width: this.width,
      height: this.height,
      autoplay: this.autoplay,
      controls: this.controls,
      playsInline: this.playsinline,
    });
    player.on('error', () => {
      this.error = new Error('player could not be built');
    });
    player.on('ended', () => {
      this.paused = true;
      this.dispatchEvent(new CustomEvent('ended'));
    });
    player.on('playing', () => {
      this.paused = false;
      this.dispatchEvent(new CustomEvent('play'));
      this.dispatchEvent(new CustomEvent('playing'));

      // Note: metadata is normally available after playing
      // reference: https://developers.google.com/youtube/iframe_api_reference
      this.loadMetadata();
    });
    player.on('paused', () => {
      this.paused = true;
      this.dispatchEvent(new CustomEvent('pause'));
    });
    player.on('buffering', () => {
      this.dispatchEvent(new CustomEvent('buffering'));
    });
    player.on('timeupdate', () => {
      this.dispatchEvent(new CustomEvent('timeupdate'));
    });
    return player;
  }

  get autoplay(): boolean {
    return this.hasAttribute('autoplay');
  }

  get controls(): boolean {
    return this.hasAttribute('controls');
  }

  set currentTime(value: number) {
    if (this.ytPlayer === null) return;
    this.ytPlayer.seek(value);
    this.dispatchEvent(new CustomEvent('timeupdate'));
  }

  get currentTime(): number {
    if (this.ytPlayer === null) return 0;
    return this.ytPlayer.getCurrentTime();
  }

  get duration(): number {
    if (this.ytPlayer === null) return NaN;
    return this.ytPlayer.getDuration();
  }

  private set error(error: Error | null) {
    if (error !== null) {
      const { message } = error;
      this.dispatchEvent(new ErrorEvent(message));
    }
    this.mediaError = error;
    throw error;
  }

  get error(): Error | null {
    return this.mediaError;
  }

  get height(): number {
    return Number(this.getAttribute('height'));
  }

  get muted(): boolean {
    if (this.ytPlayer === null) return false;
    return this.ytPlayer.isMuted();
  }

  set muted(mute: boolean) {
    if (this.ytPlayer === null) return;
    if (mute) this.ytPlayer.mute();
    else this.ytPlayer.unMute();
    this.dispatchEvent(new CustomEvent('volumechange'));
  }

  get playbackRate(): number {
    if (this.ytPlayer === null) return 1;
    return this.ytPlayer.getPlaybackRate();
  }

  set playbackRate(value: number) {
    if (this.ytPlayer === null) return;
    this.ytPlayer.setPlaybackRate(value);
  }

  get playsinline(): boolean {
    return this.hasAttribute('playsinline');
  }

  set src(value: string) {
    this.setAttribute('src', value);
    // Note: mimic the behavior of native video element
    // that fires loadstart when src is changed.
    this.load();
  }

  get src(): string {
    return this.getAttribute('src') ?? '';
  }

  get volume(): number {
    if (this.ytPlayer === null) return 1;
    return this.ytPlayer.getVolume() / 100;
  }

  set volume(value: number) {
    if (this.ytPlayer === null) return;
    this.ytPlayer.setVolume(value * 100);
    this.dispatchEvent(new CustomEvent('volumechange'));
  }

  get width(): number {
    return Number(this.getAttribute('width'));
  }
}

export default YoutubeVideoElement;
