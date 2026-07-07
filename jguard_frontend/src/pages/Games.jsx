import React from 'react';
import { Link } from 'react-router-dom';
import { FaGamepad, FaArrowRight } from 'react-icons/fa';
import './Games.css';
import mascotInspect from '../assets/mascot/inspect.png';
import mascotDocument from '../assets/mascot/document.png';

const GAMES = [
    {
        to: '/games/prevention',
        mascot: mascotInspect,
        badge: '추리 시뮬레이션',
        title: '전세사기 예방: 사건 서류철',
        desc: '실제 사기 수법을 바탕으로 한 9개의 사건을 조사하고, 계약 여부를 직접 결정해 보세요. 탐정이 되어 위험 신호를 찾아내는 훈련입니다.',
    },
    {
        to: '/games/inspector',
        mascot: mascotDocument,
        badge: '서류 검수 게임',
        title: '안심부동산: 계약 심사관',
        desc: '신분증·등기부등본·계약서를 대조해 서류의 허점을 찾아내세요. 사기 계약을 반려하고 시민의 보증금을 지키는 심사관이 됩니다.',
    },
];

const Games = () => {
    return (
        <div className="games-page">
            <div className="page-head">
                <span className="page-eyebrow"><FaGamepad /> 예방 게임</span>
                <h1>게임으로 배우는 전세사기 예방</h1>
                <p>
                    실제 사기 사건에서 가져온 시나리오를 게임으로 체험하며,
                    계약 전에 확인해야 할 것들을 자연스럽게 익혀보세요.
                </p>
            </div>

            <div className="games-grid">
                {GAMES.map((g) => (
                    <Link to={g.to} className="game-card card card-hover" key={g.to}>
                        <img src={g.mascot} alt="" className="game-mascot" />
                        <span className="badge badge-brand">{g.badge}</span>
                        <h2>{g.title}</h2>
                        <p>{g.desc}</p>
                        <span className="game-more">플레이하기 <FaArrowRight /></span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Games;
