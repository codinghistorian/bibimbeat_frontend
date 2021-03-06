import React, { useState, useRef, useEffect } from 'react'
import stylesPlayer from "./audioPlayer.module.css"
import { FaStepForward, FaStepBackward, FaRegPlayCircle, FaRegPauseCircle, FaRandom, FaVolumeUp } from "react-icons/fa"
import { ImLoop } from "react-icons/im";
import { MdPlaylistPlay } from "react-icons/md"
import { useSelector } from 'react-redux';

function Player() {

    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // references
    const audioPlayer = useRef();
    const progressBar = useRef(); //ref to progressBar
    const animationRef = useRef(); //ref the animation

    const musicUrl = useSelector((state) => state.playButtonReducer.musicUrl);
    const artist = useSelector((state) => state.playButtonReducer.artist);
    const title = useSelector((state) => state.playButtonReducer.title);

    const whilePlaying = () => {
        progressBar.current.value = audioPlayer.current.currentTime;
        changePlayerCurrentTime();
        animationRef.current = requestAnimationFrame(whilePlaying);
    }

    useEffect(() => {
        const seconds = Math.floor(audioPlayer.current.duration);
        setDuration(seconds);
        progressBar.current.max = seconds;

    }, [audioPlayer?.current?.loadedmetadata, audioPlayer?.current?.readyState]);

    const calculateTime = (secs) => {
        const minutes = Math.floor(secs / 60);
        const returnedMinutes = `${minutes}`;
        const seconds = Math.floor(secs % 60);
        const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${returnedMinutes}.${returnedSeconds}`;
    }

    const togglePlayPause = async () => {
        const prevValue = isPlaying;
        setIsPlaying(!prevValue); // isPlaying = false, prevValue = true
        if (!prevValue) { // if prevValue = false
            console.log("play!");
            audioPlayer.current.play();
            animationRef.current = requestAnimationFrame(whilePlaying);
        } else {
            console.log("pause!");
            console.log(audioPlayer.current);
            audioPlayer.current.pause();
            cancelAnimationFrame(animationRef.current);
        }
    }

    const changeRange = () => {
        audioPlayer.current.currentTime = progressBar.current.value;
        changePlayerCurrentTime();
    }

    const changePlayerCurrentTime = () => {
        progressBar.current.style.setProperty('--seek-before-width', `${progressBar.current.value / duration * 100}%`)
        setCurrentTime(progressBar.current.value);
    }

    const backThirty = () => {
        progressBar.current.value = (Number(progressBar.current.value) - 30).toString();
        changeRange();
    }

    const forwardThirty = () => {
        progressBar.current.value = (Number(progressBar.current.value) + 30).toString();
        changeRange();
    }

    return (
        <div className={stylesPlayer.centerer}>
<div className={stylesPlayer.audioPlayer}>
            <audio ref={audioPlayer} src={musicUrl} preload="metadata" onLoadedMetadata={(e) => {
                setIsPlaying(true);
                audioPlayer.current.play();
                animationRef.current = requestAnimationFrame(whilePlaying);
                setDuration(audioPlayer.current.duration);
                }}></audio>
            <button className={stylesPlayer.forwardBackward} onClick={backThirty}><FaStepBackward /> </button>
            <button onClick={togglePlayPause} className={stylesPlayer.playPause}>
                {isPlaying ? <FaRegPauseCircle /> : <FaRegPlayCircle />}
            </button>
            <button className={stylesPlayer.forwardBackward} onClick={forwardThirty}><FaStepForward /></button>
            <div className={stylesPlayer.blank}></div>
            <button className={stylesPlayer.forwardBackward}><FaRandom /></button>
            <button className={stylesPlayer.forwardBackward}><ImLoop /></button>
            <button className={stylesPlayer.forwardBackward}><MdPlaylistPlay /></button>

            {/* current time */}

            <div className={stylesPlayer.currentTime}>{calculateTime(currentTime)}</div>

            {/*  progress bar */}

            <div>
                <input type="range" className={stylesPlayer.progressBar} defaultValue="0" ref={progressBar} onChange={changeRange} />
            </div>

            {/* duration */}
            <div className={stylesPlayer.duration}>{isNaN(duration) ? calculateTime(0) : calculateTime(duration)}</div>
            <button className={stylesPlayer.forwardBackward}><FaVolumeUp /></button>
            <div>
                <div className={stylesPlayer.artistInfo}>
                    {artist}
                </div>
                <div className={stylesPlayer.titleInfo}>
                    {title}
                </div>
            </div>
        </div>
        </div>


    );
}

export default Player;