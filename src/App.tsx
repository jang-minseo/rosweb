import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './component/main/MainComponent';


function App() {

  return (
    
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path='/' Component={MainPage}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
