import { useState, useRef, useEffect } from 'react';
import { chatConfig } from '../config';

interface AudioPlayerProps {
  audioUrl: string;
  duration: number;
  isFromLead: boolean;
  readReceiptIcon?: React.ReactNode | null;
  nowTime: string;
}

export default function AudioPlayer({ nowTime, audioUrl, duration, isFromLead, readReceiptIcon = null }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => setIsLoading(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleEnded = () => {
      audio.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const percent = parseFloat(e.target.value);
    const currentTimeInSeconds = ((percent * audioDuration) / 100);
    audio.currentTime = currentTimeInSeconds;
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const milliseconds = seconds * 1000;
    return new Date(milliseconds).toISOString().substr(14, 5);
  };

  const percentPlayed = audioDuration > 0 ? (currentTime * 100) / audioDuration : 0;
  const displayTime = currentTime === 0 ? formatTime(audioDuration) : formatTime(currentTime);

  const bgColor = isFromLead ? '#262d31' : '#056162';
  const featuredColor = '#00e5c0';

  return (
    <div
      className="inline-flex min-w-[200px] max-w-[280px] w-full rounded-lg p-2 shadow-md select-none"
      style={{
        backgroundColor: bgColor,
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <audio ref={audioRef} src={audioUrl} />

      {isFromLead ? (
        <>
          <div className="flex-1 flex">
            <button
              type="button"
              onClick={togglePlayPause}
              disabled={isLoading}
              className="outline-none border-0 bg-transparent cursor-pointer pr-3 pl-2 disabled:cursor-default"
            >
              {isLoading ? (
                <span
                  className="inline-block text-[38px] opacity-80"
                  style={{
                    color: '#c5c6c8',
                    animation: 'spin 1s linear infinite'
                  }}
                >
                  ⟳
                </span>
              ) : isPlaying ? (
                <span className="inline-block text-[38px] opacity-80" style={{ color: '#c5c6c8' }}>
                  <svg viewBox="0 0 34 34" height="34" width="34" preserveAspectRatio="xMidYMid meet" className="" version="1.1" x="0px" y="0px" enableBackground="new 0 0 34 34"><title>audio-pause</title><path fill="currentColor" d="M9.2,25c0,0.5,0.4,1,0.9,1h3.6c0.5,0,0.9-0.4,0.9-1V9c0-0.5-0.4-0.9-0.9-0.9h-3.6 C9.7,8,9.2,8.4,9.2,9V25z M20.2,8c-0.5,0-1,0.4-1,0.9V25c0,0.5,0.4,1,1,1h3.6c0.5,0,1-0.4,1-1V9c0-0.5-0.4-0.9-1-0.9 C23.8,8,20.2,8,20.2,8z"></path></svg>
                </span>
              ) : (
                <span className="inline-block text-[38px] opacity-80" style={{ color: '#c5c6c8' }}>
                  <svg viewBox="0 0 34 34" height="34" width="34" preserveAspectRatio="xMidYMid meet" className="" version="1.1" x="0px" y="0px" enableBackground="new 0 0 34 34"><title>audio-play</title><path fill="currentColor" d="M8.5,8.7c0-1.7,1.2-2.4,2.6-1.5l14.4,8.3c1.4,0.8,1.4,2.2,0,3l-14.4,8.3 c-1.4,0.8-2.6,0.2-2.6-1.5V8.7z"></path></svg>
                </span>
              )}
            </button>

            <div className="flex-1 flex flex-col relative pb-1">
              <div className="flex-1 flex items-center relative">
                <div
                  className="absolute h-1 rounded-full"
                  style={{
                    width: `${percentPlayed}%`,
                    backgroundColor: featuredColor,
                    height: '0.24rem',
                    borderRadius: 'calc(0.24rem / 2)'
                  }}
                />
                <input
                  dir="ltr"
                  type="range"
                  min="0"
                  max="100"
                  value={percentPlayed}
                  onChange={handleSliderChange}
                  className="flex-1 w-full relative appearance-none bg-transparent border-0 outline-none"
                  style={{
                    background: 'transparent',
                    height: '0.24rem'
                  }}
                />
              </div>

              <div
                className="flex items-center justify-between absolute w-full bottom-0"
                style={{
                  fontSize: '0.68rem',
                  color: '#c5c6c8'
                }}
              >
                <div>{displayTime}</div>
                <div className="flex items-center">
                  <span>{formatTime(audioDuration)}</span>
                </div>
                <div className="flex items-center">
                  <span>{nowTime}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-[55px] h-[55px] ml-6">
            <img
              src={chatConfig.attendantAvatar}
              alt="Avatar"
              className="w-[55px] h-[55px] rounded-full object-cover"
            />
            <span
              className="absolute left-0 bottom-0 text-[1.6rem]"
              style={{
                color: featuredColor,
                transform: 'translateX(-50%)',
                textShadow: `-1px -1px 0 ${bgColor}, 1px -1px 0 ${bgColor}, -1px 1px 0 ${bgColor}, 1px 1px 0 ${bgColor}`
              }}
            >
              🎤
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 flex mr-3">
            <button
              type="button"
              onClick={togglePlayPause}
              disabled={isLoading}
              className="outline-none border-0 bg-transparent cursor-pointer px-3 disabled:cursor-default"
            >
              {isLoading ? (
                <span
                  className="inline-block text-[38px] opacity-80"
                  style={{
                    color: '#c5c6c8',
                    animation: 'spin 1s linear infinite'
                  }}
                >
                  ⟳
                </span>
              ) : isPlaying ? (
                <span className="inline-block text-[38px] opacity-80" style={{ color: '#c5c6c8' }}>
                  <svg viewBox="0 0 34 34" height="34" width="34" preserveAspectRatio="xMidYMid meet" className="" version="1.1" x="0px" y="0px" enableBackground="new 0 0 34 34"><title>audio-pause</title><path fill="currentColor" d="M9.2,25c0,0.5,0.4,1,0.9,1h3.6c0.5,0,0.9-0.4,0.9-1V9c0-0.5-0.4-0.9-0.9-0.9h-3.6 C9.7,8,9.2,8.4,9.2,9V25z M20.2,8c-0.5,0-1,0.4-1,0.9V25c0,0.5,0.4,1,1,1h3.6c0.5,0,1-0.4,1-1V9c0-0.5-0.4-0.9-1-0.9 C23.8,8,20.2,8,20.2,8z"></path></svg>
                </span>
              ) : (
                <span className="inline-block text-[38px] opacity-80" style={{ color: '#c5c6c8' }}>
                  <svg viewBox="0 0 34 34" height="34" width="34" preserveAspectRatio="xMidYMid meet" className="" version="1.1" x="0px" y="0px" enableBackground="new 0 0 34 34"><title>audio-play</title><path fill="currentColor" d="M8.5,8.7c0-1.7,1.2-2.4,2.6-1.5l14.4,8.3c1.4,0.8,1.4,2.2,0,3l-14.4,8.3 c-1.4,0.8-2.6,0.2-2.6-1.5V8.7z"></path></svg>
                </span>
              )}
            </button>

            <div className="flex-1 flex flex-col relative pb-1">
              <div className="flex-1 flex items-center relative">
                <div
                  className="absolute h-1 rounded-full"
                  style={{
                    width: `${percentPlayed}%`,
                    backgroundColor: featuredColor,
                    height: '0.24rem',
                    borderRadius: 'calc(0.24rem / 2)'
                  }}
                />
                <input
                  dir="ltr"
                  type="range"
                  min="0"
                  max="100"
                  value={percentPlayed}
                  onChange={handleSliderChange}
                  className="flex-1 w-full relative appearance-none bg-transparent border-0 outline-none"
                  style={{
                    background: 'transparent',
                    height: '0.24rem'
                  }}
                />
              </div>

              <div
                className="flex items-center justify-between absolute w-full bottom-0"
                style={{
                  fontSize: '0.68rem',
                  color: '#c5c6c8'
                }}
              >
              {/* <div>{displayTime}</div> */}
                <div className="flex items-center gap-1">
                  <span>{formatTime(audioDuration)}</span>
                  {readReceiptIcon}
                </div>
                <div className="flex items-center gap-1">
                  <span>{nowTime}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative w-[55px] h-[55px] mr-0">
            <img
              src={chatConfig.attendantAvatar}
              alt="Avatar"
              className="w-[55px] h-[55px] rounded-full object-cover"
            />
            <span
              className="absolute bottom-0 text-[1.6rem]"
              style={{
                left: '-12px',
                color: featuredColor,
                transform: 'translateX(50%)',
                textShadow: `-1px -1px 0 ${bgColor}, 1px -1px 0 ${bgColor}, -1px 1px 0 ${bgColor}, 1px 1px 0 ${bgColor}`
              }}
            >
              <svg viewBox="0 0 19 26" height="26" width="19" preserveAspectRatio="xMidYMid meet" className="" version="1.1" x="0px" y="0px" enableBackground="new 0 0 19 26"><title>ptt-status</title><path fill="#4D5E56" className="ptt-status-background" d="M9.217,24.401c-1.158,0-2.1-0.941-2.1-2.1v-2.366c-2.646-0.848-4.652-3.146-5.061-5.958L2.004,13.62 l-0.003-0.081c-0.021-0.559,0.182-1.088,0.571-1.492c0.39-0.404,0.939-0.637,1.507-0.637h0.3c0.254,0,0.498,0.044,0.724,0.125v-6.27 C5.103,2.913,7.016,1,9.367,1c2.352,0,4.265,1.913,4.265,4.265v6.271c0.226-0.081,0.469-0.125,0.723-0.125h0.3 c0.564,0,1.112,0.233,1.501,0.64s0.597,0.963,0.571,1.526c0,0.005,0.001,0.124-0.08,0.6c-0.47,2.703-2.459,4.917-5.029,5.748v2.378 c0,1.158-0.942,2.1-2.1,2.1H9.217V24.401z"></path><path fill="currentColor" className="ptt-status-icon" d="M9.367,15.668c1.527,0,2.765-1.238,2.765-2.765V5.265c0-1.527-1.238-2.765-2.765-2.765 S6.603,3.738,6.603,5.265v7.638C6.603,14.43,7.84,15.668,9.367,15.668z M14.655,12.91h-0.3c-0.33,0-0.614,0.269-0.631,0.598 c0,0,0,0-0.059,0.285c-0.41,1.997-2.182,3.505-4.298,3.505c-2.126,0-3.904-1.521-4.304-3.531C5.008,13.49,5.008,13.49,5.008,13.49 c-0.016-0.319-0.299-0.579-0.629-0.579h-0.3c-0.33,0-0.591,0.258-0.579,0.573c0,0,0,0,0.04,0.278 c0.378,2.599,2.464,4.643,5.076,4.978v3.562c0,0.33,0.27,0.6,0.6,0.6h0.3c0.33,0,0.6-0.27,0.6-0.6V18.73 c2.557-0.33,4.613-2.286,5.051-4.809c0.057-0.328,0.061-0.411,0.061-0.411C15.243,13.18,14.985,12.91,14.655,12.91z"></path></svg>
            </span>
          </div>

        </>
      )}

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          background: ${featuredColor};
          width: 0.9rem;
          height: 0.9rem;
          border-radius: 50%;
          margin-top: calc(0.24rem * -1.4);
          cursor: pointer;
        }

        input[type="range"]::-moz-range-thumb {
          appearance: none;
          border: 0;
          background: ${featuredColor};
          width: 0.9rem;
          height: 0.9rem;
          border-radius: 50%;
          margin-top: calc(0.24rem * -1.4);
          cursor: pointer;
        }

        input[type="range"]::-webkit-slider-runnable-track {
          background: rgba(255, 255, 255, 0.2);
          height: 0.24rem;
          border-radius: calc(0.24rem / 2);
        }

        input[type="range"]::-moz-range-track {
          background: rgba(255, 255, 255, 0.2);
          height: 0.24rem;
          border-radius: calc(0.24rem / 2);
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
