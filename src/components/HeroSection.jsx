import React from 'react';
import '../App.css';
import { Button } from './Button';
import './HeroSection.css';
import herovid from '../assets/videos/video-1.mp4';

function HeroSection() {
	return (
		<div className="hero-container">
			<video
				src={herovid}
				loop
				autoPlay
				muted
			/>
			<h2>PEDRO ANDRES</h2>
			<h1>FLYNN</h1>
			<p>Software Engineer</p>
			<div className="hero-btns">
				<Button
					className="btns"
					buttonStyle="btn--outline"
					buttonSize="btn--large"
				>
					GET STARTED
				</Button>
				<Button
					className="btns"
					buttonStyle="btn--primary"
					buttonSize="btn--large"
				>
					PLAY <i className="far fa-play-circle" />
				</Button>
			</div>
		</div>
	);
}

export default HeroSection;
