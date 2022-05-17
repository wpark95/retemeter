import React, { useState } from 'react';
import axios from 'axios';

import TimeStampList from './TimeStampList';
import UserList from './UserList';

const App = () => {
	const [language, setLanguage] = useState('kor');
	const [submitLang, setSubmitLang] = useState('확인하기');
	const [inputFile, setInputFile] = useState(null);
	const [displayResult, setDisplayResult] = useState(false);
	// Data to display 
	const [timeStampList, setTimeStampList] = useState({});
	const [userList, setUserList] = useState([]);

	const languageOptions = [
		{label: '한국어', value: 'kor', submit: '확인하기'},
		{label: 'English', value: 'eng', submit: 'Submit'},
	]

	const onFileUpload = () => {
		setDisplayResult(true);
		const formData = new FormData();
		formData.append('userLanguage', language);
		formData.append('inputFile', inputFile);
		axios.post('api/test', formData)
		.then(res => {
			setTimeStampList(res.data[0]);
			setUserList(Object.keys(res.data[1]).map((d) => (
				{name: d, value: res.data[1][d]}
			)));
		}).catch(err => console.log(err));
	}

	return (		
		<div>
			<div className='header'>
				<div className='logo'>
					🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘
					<br></br>
					R E T E M E T E R
				</div>
				<div className='nav-bar'>
					Home 
					ETC 
					<select 
						value={language} 
						onChange={(e) => {
							setLanguage(e.target.value);
							setSubmitLang(e.target.submit);
						}
					}>
						{languageOptions.map((lang) => (
						<option key={lang} value={lang.value}>{lang.label}</option>
						))}
					</select>
				</div>
				<div className='main'>
					{displayResult ? 
						<div className='results'>
							<div>
								<h3>Results</h3>
								{timeStampList.length > 0 ? <TimeStampList timeStampList={timeStampList} /> : null}
						 		{Object.keys(userList).length !== 0 ? <UserList data={userList} /> : null}
								{
								language == 'kor' ? 
									<h3>다른 대화도 분석해보시겠어요?</h3>
								:
								language == 'eng' ?
									<h3>Would you like something to drink?</h3>
								: 
									null
								}
								<button>확인하기</button>
							</div>
						</div>
					: 						
						<div className='file-upload'>
							{
							language == 'kor' ?
									<h3> 카카오톡 대화 텍스트 파일을 업로드 해주세요 </h3>
								:
							language == 'eng' ?
									<h3> Please upload your exported KakaoTalk chat </h3>
								:
									null	
							}
							<input 
								type='file'
								accept='.txt, .csv'
								onChange={(e) => setInputFile(e.target.files[0])} 
							/>
							<button onClick={onFileUpload}>
								{/* TO DO: Fix submitLang */}
								{submitLang}
							</button>
						</div>
					}
				</div>
			</div>
		</div>
  );
}

export default App;