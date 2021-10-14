import './menuBar.css';
import music from '../images/music.png';
import './myMusic.css';
import { Link } from 'react-router-dom';

function MyMusic() {
    return (
        <div>
            <Link to="myMusicList" style={{ textDecoration: 'none' }}>
                <div className="myMusic">
                    <div style={{ textDecoration: 'none', backgroundColor: 'red', height: '0px' }}>
                        <span id="my">My</span>
                        <img id="img" src={music} alt={music}></img>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default MyMusic;