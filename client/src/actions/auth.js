import axios from 'axios';
import { setAlert } from './alert';
import setAuthToken from '../utils/setAuthToken';
import {
	REGISTER_SUCCESS,
	REGISTER_FAIL,
	USER_LOADED,
	AUTH_ERROR,
	LOGIN_SUCCESS,
	LOGIN_FAIL,
	LOGOUT
} from './types';

//Load User
export const loadUser = () => async dispatch => {
	//if there is a token, set it up to headers
	if (localStorage.token) {
		setAuthToken(localStorage.token)
	}
	try {
		//if request goes well, we want to dispatch USER_LOADED
		const res = await axios.get('/api/auth');
		
		dispatch({
			type: USER_LOADED,
			payload: res.data 
			//the user will be sent to the action type USER_LOADED in the reducer
		})
	} catch (err) {
		dispatch({
			type: AUTH_ERROR
		})
	}
}



// Register User 
export const register = ({ name, email, password }) => async dispatch => {
	const config = {
		headers: {
			'Content-Type': 'application/json'
		}
	}
	const body = JSON.stringify({ name, email, password });
	try {
		const res = await axios.post('/api/users', body, config);
		dispatch({
			type: REGISTER_SUCCESS,
			payload: res.data
		});
		dispatch(loadUser());
	} catch (err) {
		const errors = err.response.data.errors;
		if(errors) {
			errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
		}
		dispatch({
			type: REGISTER_FAIL
		});
	}
}

// Login User 
export const login = ({ email, password }) => async dispatch => {
	const config = {
		headers: {
			'Content-Type': 'application/json'
		}
	}
	const body = JSON.stringify({ email, password });
	try {
		console.log('user creds', email, password)
		console.log('body', body)
		const res = await axios.post('/api/auth', body, config);
		dispatch({
			type: LOGIN_SUCCESS,
			payload: res.data
		});
		dispatch(loadUser());
	} catch (err) {
		const errors = err.response.data.errors;
		if(errors) {
			errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
		}
		dispatch({
			type: LOGIN_FAIL
		});
	}
}

//Logout / Clear Profile
export const logout = () => dispatch => {
	dispatch({ type: LOGOUT });
}