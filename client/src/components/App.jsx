// External dependencies
import React, { useState } from "react";
import axios from "axios";

// Internal dependencies
import TimeStampList from "./TimeStampList";
import UserList from "./UserList";
import languageOptions from "../common/internationalization/languageOptions";

const App = () => {
	// App state
	const [languageOption, setLanguageOption] = useState(languageOptions[0]);
	const [inputFile, setInputFile] = useState(null);
	const [shouldDisplayResult, setShouldDisplayResult] = useState(false);

	// Result data to display
	const [timeStampList, setTimeStampList] = useState({});
	const [userList, setUserList] = useState([]);

	const onFileUpload = () => {
		setShouldDisplayResult(true);
		const formData = new FormData();
		formData.append("userLanguage", languageOption.languageCode);
		formData.append("inputFile", inputFile);
		axios
			.post("api/test", formData)
			.then((res) => {
				setTimeStampList(res.data[0]);
				setUserList(
					Object.keys(res.data[1]).map((d) => ({
						name: d,
						value: res.data[1][d],
					}))
				);
			})
			.catch((err) => console.log(err));
	};

	const logo = () => <div className="logo">🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘</div>;

	const topNavigation = () => (
		<div className="nav-bar">
			<nav>
				<a href="/home/">HOME</a> |<a href="/etc/">ETC</a>
			</nav>
			<select
				value={languageOption.label}
				onChange={(e) => {
					setLanguageOption(
						languageOptions.find((option) => option.label === e.target.value)
					);
				}}
			>
				{languageOptions.map((option) => (
					<option key={option.languageCode} value={option.label}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);

	const preChatUploadMainContent = () => (
		<div className="file-upload">
			<h3>{languageOption.chatUploadPrompt}</h3>
			<input
				type="file"
				accept=".txt, .csv"
				onChange={(e) => setInputFile(e.target.files[0])}
			/>
			<button onClick={onFileUpload}>{languageOption.submit}</button>
		</div>
	);

	const postAnalysisMainContent = () => (
		<div className="results">
			<div>
				<h3>{languageOption.result}</h3>
				{timeStampList?.length > 0 ? (
					<TimeStampList timeStampList={timeStampList} />
				) : null}
				{Object.keys(userList).length !== 0 ? (
					<UserList data={userList} />
				) : null}
				<h3>{languageOption.retryPrompt}</h3>
				<button>{languageOption.submit}</button>
			</div>
		</div>
	);

	return (
		<div>
			<div className="header">
				{logo()}
				{topNavigation()}
				<div className="main">
					{shouldDisplayResult
						? postAnalysisMainContent()
						: preChatUploadMainContent()}
				</div>
			</div>
		</div>
	);
};

export default App;
