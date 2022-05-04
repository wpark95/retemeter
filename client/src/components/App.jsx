import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
	const [language, setLanguage] = useState('kor');
	const [inputFile, setInputFile] = useState(null);
	const [topList, setTopList] = useState([]);

	const languageOptions = [
		{label: '한국어', value: 'kor'},
		{label: 'English', value: 'eng'},
	]

	const onFileUpload = () => {
		setTopList([]);
		const formData = new FormData();
		formData.append('userLanguage', language);
		formData.append('inputFile', inputFile);
		axios.post('api/test', formData)
		.then(res => {
			console.log(res.data);
      		// setTopList(topList => [...topList, res.data.frequencyData]);
		})
		.catch(err => console.log(err));
	}
	
	const displayList = () => {
		if (topList[0] != undefined) {
			return topList[0].map(item => <li key={item}>{topList[0].indexOf(item) + 1}위 {item}</li>)
		}
	}

	return (
		<div>
      <h1> R E T E M E T E R </h1>
	  <div>
		  <select value={language} onChange={(e) => setLanguage(e.target.value)}>
				{languageOptions.map((lang) => (
					<option value={lang.value}>{lang.label}</option>
				))}
		  </select>
	  </div>
      <h3> 카카오톡 대화 텍스트 파일을 업로드 해주세요 </h3>
			<div>
				<input 
					type='file'
					accept='.txt, .csv'
					onChange={(e) => setInputFile(e.target.files[0])} 
				/>
				<button onClick={onFileUpload}>
					확인하기
				</button>
      </div>
      <div>
        {displayList()}
      </div>
    </div>
  );
}

export default App;