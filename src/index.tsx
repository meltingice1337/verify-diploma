import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.min.css';
import '../public/styles/main.scss';
import { SetupFontAwesome } from '@utils/FontAwesomeSetup';

toast.configure();

SetupFontAwesome();

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('root')
);