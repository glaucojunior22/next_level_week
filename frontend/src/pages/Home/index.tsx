import React from 'react';
import './styles.css';
import logo from '../../assets/logo.svg';
import { FiLogIn } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Home = () => {
  return(
    <div id="page-home">
      <div className="content">
        <header>
          <img src={ logo } alt="logo ecoleta"/>
        </header>
        <main>
          <h1>Seu maketplace de coleta de resíduos.</h1>
          <p>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</p>
          <Link to="/create-point">
            <span> <FiLogIn /> </span>
            <strong>Cadastre seu ponto de coleta</strong>
          </Link>
        </main>
      </div>
    </div>
  );
}

export default Home;