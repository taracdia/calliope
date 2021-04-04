import React, { useEffect, useState } from "react";
import { Text, View, Image, TouchableOpacity } from "react-native";
import TrackPlayer, {
	TrackPlayerEvents,
	STATE_PLAYING,
} from "react-native-track-player";
import {
	useTrackPlayerProgress,
	useTrackPlayerEvents,
} from "react-native-track-player/lib/hooks";
import Slider from "@react-native-community/slider";

import styles from "../styles";
import { primary } from "./ThemeChoose";

const songs = [
	{
		id: 0,
		url:
			"https://audio-previews.elements.envatousercontent.com/files/103682271/preview.mp3",
		title: "Song 0",
		album: "Great Album",
		artist: "A Great Dude",
		artwork: "https://picsum.photos/300",
		type: "default",
	},
	{
		id: 1,
		url:
			"https://audio-previews.elements.envatousercontent.com/files/103682271/preview.mp3",
		title: "Song 1",
		album: "Great Album",
		artist: "A Great Dude",
		artwork: "https://picsum.photos/300",
		type: "default",
	},
	{
		id: 2,
		url:
			"https://audio-previews.elements.envatousercontent.com/files/103682271/preview.mp3",
		title: "Song 2",
		album: "Great Album",
		artist: "A Great Dude",
		artwork: "https://picsum.photos/300",
		type: "default",
	},
];

const trackPlayerInit = async () => {
	await TrackPlayer.setupPlayer();
	TrackPlayer.updateOptions({
		stopWithApp: true,
		capabilities: [
			TrackPlayer.CAPABILITY_PLAY,
			TrackPlayer.CAPABILITY_PAUSE,
			TrackPlayer.CAPABILITY_JUMP_FORWARD,
			TrackPlayer.CAPABILITY_JUMP_BACKWARD,
		],
	});
	await TrackPlayer.add(songs).catch(e => console.log(e.message));
	return true;
};

const PlayMusic = () => {
	const [isTrackPlayerInit, setIsTrackPlayerInit] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [sliderValue, setSliderValue] = useState(0);
	const [isSeeking, setIsSeeking] = useState(false);
	const { position, duration } = useTrackPlayerProgress(250);

	const [songNumber, setSongNumber] = useState(0);

	useEffect(() => {
		const startPlayer = async () => {
			let isInit = await trackPlayerInit();
			setIsTrackPlayerInit(isInit);
		};
		startPlayer();
	}, []);

	//this hook updates the value of the slider whenever the current position of the song changes
	useEffect(() => {
		if (!isSeeking && position && duration) {
			setSliderValue(position / duration);
		}
	}, [position, duration]);

	useTrackPlayerEvents([TrackPlayerEvents.PLAYBACK_STATE], event => {
		if (event.state === STATE_PLAYING) {
			setIsPlaying(true);
		} else {
			setIsPlaying(false);
		}
	});

	const playPausePressed = () => {
		if (!isPlaying) {
			TrackPlayer.play();
			//setIsPlaying(true);
		} else {
			TrackPlayer.pause();
			//setIsPlaying(false);
		}
	};

	const slidingStarted = () => {
		setIsSeeking(true);
	};

	const slidingCompleted = async value => {
		await TrackPlayer.seekTo(value * duration);
		setSliderValue(value);
		setIsSeeking(false);
	};

	const nextButton = () => {
		const newSongNumber = songNumber + 1;
		if (songs.length > newSongNumber) {
			setSongNumber(newSongNumber);
		} else {
			setSongNumber(0);
		}
	};

	const prevButton = () => {
		if (songNumber === 0) {
			setSongNumber(songs.length - 1);
		} else {
			setSongNumber(songNumber - 1);
		}
	};

	const skipBackward = async () => {
		let newPosition = await TrackPlayer.getPosition();
		newPosition -= 10;
		if (newPosition < 0) {
			newPosition = 0;
		}
		TrackPlayer.seekTo(newPosition);
	};

	const skipForward = async () => {
		let newPosition = await TrackPlayer.getPosition();
		let duration = await TrackPlayer.getDuration();
		newPosition += 10;
		if (newPosition > duration) {
			newPosition = duration;
		}
		TrackPlayer.seekTo(newPosition);
	};

	const convertTime = input => {
		const minutes = Math.floor(input / 60);
		let secs = Math.floor(input % 60);
		if (secs < 10) {
			secs = "0" + secs;
		}
		return `${minutes}:${secs}`;
	};

	return (
		<View
			style={[
				{ alignSelf: "center", justifyContent: "center" },
				styles.flex,
			]}
		>
			<View style={[styles.center, styles.flex]}>
				<Image
					source={{
						uri: songs[songNumber].artwork,
					}}
					resizeMode="contain"
					style={[styles.center, styles.flex, styles.albumImage]}
				/>
			</View>
			<View style={[styles.center, styles.flex]}>
				<Text style={styles.bigBold}>{songs[songNumber].title}</Text>
				<Text style={styles.artist}>by {songs[songNumber].artist}</Text>
				<Text style={styles.artist}>
					from {songs[songNumber].album}
				</Text>
			</View>
			<View style={[styles.flex, styles.row, styles.center]}>
				<Text>{convertTime(position)}</Text>
				<Slider
					style={{ width: 300 }}
					minimumValue={0}
					maximumValue={1}
					value={sliderValue}
					minimumTrackTintColor={primary}
					maximumTrackTintColor={primary}
					onSlidingStart={slidingStarted}
					onSlidingComplete={slidingCompleted}
					thumbTintColor={primary}
				/>
				<Text>{convertTime(duration)}</Text>
			</View>
			<View style={[styles.center, styles.flex, styles.row]}>
				<TouchableOpacity
					onPress={prevButton}
					disabled={!isTrackPlayerInit}
				>
					<Image
						source={require("../icons/prev.png")}
						tintColor={primary}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={skipBackward}
					disabled={!isTrackPlayerInit}
				>
					<Image
						source={require("../icons/backward10.png")}
						tintColor={primary}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={playPausePressed}
					disabled={!isTrackPlayerInit}
				>
					<Image
						source={
							isPlaying
								? require("../icons/pause.png")
								: require("../icons/play.png")
						}
						tintColor={primary}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={skipForward}
					disabled={!isTrackPlayerInit}
				>
					<Image
						source={require("../icons/forward10.png")}
						tintColor={primary}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={nextButton}
					disabled={!isTrackPlayerInit}
				>
					<Image
						source={require("../icons/next.png")}
						tintColor={primary}
					/>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default PlayMusic;
