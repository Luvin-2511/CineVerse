import React, { useEffect, useRef, useState } from "react";
import "../styles/loader.scss";

const Loader = ({onComplete,fast=false}) => {
  const intervalRef = useRef();
  const changerText = useRef();
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadingComplete, setloadingComplete] = useState(false);
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev <= 20) {
          changerText.current.innerText = "◈ CONNECTING TO DATABASE ...";
        } else if (prev <= 40) {
          changerText.current.innerText = "◈ FETCHING MOVIE CATALOG ...";
        } else if (prev <= 70) {
          changerText.current.innerText = "◈ LOADING TRAILERS ...";
        } else if (prev <= 97) {
          changerText.current.innerText = "◈ PREPARING EXPERIENCE ...";
        } else {
          changerText.current.innerText = "◈ SYSTEM READY ...";
          changerText.current.style.color = "white";
        }
        if (prev >= 100) {
          setloadingComplete(true);
          clearInterval(intervalRef.current);
          setTimeout(() => {
            onComplete?.(); // ← fires after delay
          }, fast ? 200 : 800);
          return 100;
        }
        return Math.min(prev + (fast?5:1), 100);
      });
    }, fast?25:15);
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  const arr = new Array(15).fill(0);
  return (
    <div className="loading-page">
      <div className="scanlines"></div>
      <div className="loading-page-grid"></div>
      <div className="text-cross-wrapper">
        <div className="crosshair">
          <div className="corner corner-tl"></div>
          <div className="corner corner-tr"></div>
          <div className="corner corner-bl"></div>
          <div className="corner corner-br"></div>
          <div className="line-x"></div>
          <div className="line-y"></div>
          <div className="outer-circle">
            <div className="inner-circle">
              <div className="center-aim"></div>
            </div>
          </div>
        </div>
        <div className="init-text">INITIALIZING SYSTEM</div>
        <div className="logo-text-wrapper">
          <div
            style={{
              animation: loadingComplete ? "glitch 0.15s linear infinite" : "",
            }}
            className="logo-text"
          >
            CINEVERSE
          </div>
          <div className="logo-text-absolute">CINEVERSE</div>
        </div>
        <div className="end-text">PREMIUM CINEMA PLATFORM</div>
        <div className="loader-wrapper">
          <div className="loader-text">
            <div className="left">LOADING ASSETS</div>
            <div className="right">
              {loadProgress.toString().padStart(3, 0)}%
            </div>
          </div>
          <div className="loader-top">
            <div
              style={{
                width: `${loadProgress}%`,
              }}
              className="loader"
            >
              <div className="loader-dot"></div>
            </div>
          </div>
          <div className="loader-bottom">
            <div
              style={{
                width: `${loadProgress}%`,
              }}
              className="loader"
            ></div>
          </div>
        </div>
        <div ref={changerText} className="final-text">
          ◈ FETCHING MOVIE CATALOG...
        </div>
      </div>
      <div className="filmer left-filmer">
        {arr.map((a, ind) => {
          return (
            <div
              style={{
                "--i": ind,
              }}
              className="film-reel"
            >
              <div className="left">
                <div className="top-c cir"></div>
                <div className="bottom-c cir"></div>
              </div>
              <div className="middle"></div>
              <div className="right">
                <div className="top-c cir"></div>
                <div className="bottom-c cir"></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="filmer right-filmer">
        {arr.map((a, ind) => {
          return (
            <div
              style={{
                "--i": ind,
              }}
              className="film-reel"
            >
              <div className="left">
                <div className="top-c cir"></div>
                <div className="bottom-c cir"></div>
              </div>
              <div className="middle"></div>
              <div className="right">
                <div className="top-c cir"></div>
                <div className="bottom-c cir"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Loader;
