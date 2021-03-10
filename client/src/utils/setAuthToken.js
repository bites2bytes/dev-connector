import axios from 'axios';

const setAuthToken = token => {
	//check if there is token in local storage
	if (token) {
		//if there is a token add it to headers
		axios.defaults.headers.common['x-auth-token'] = token;
	} else {
		//if what we pass is not a token we will remove it from headers
		delete axios.defaults.headers.common['x-auth-token'];
	}
}

//if there is a token, it will be sent with every request

export default setAuthToken;