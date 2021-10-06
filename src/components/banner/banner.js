import bannerImage from "../images/sample_banner.png"
import arrowLeft from "../images/arrowLeft.png"
import arrowRight from "../images/arrowRight.png"
import play from "../images/play.png"

import './banner.css';

function Banner() {
    return (
        <div>
        
        <div className="bannerContainer1">
            <div className="bannerContainer2">
            <span className="arrowLeft"><img src={arrowLeft} alt={arrowLeft}></img></span>
            <span><img id="banner" src={bannerImage} alt={bannerImage}></img></span>
            <span className="arrowRight"><img src={arrowRight} alt={arrowRight}></img></span>
            </div>

            <div className="title">Lamda Minted his first NFTs</div>
            <div className="songPlay">
            <div className="song">Lamda - Living as a Kopino</div>
            <img className="play"src={play} alt={play}></img>

            </div>
        </div>

        </div>
    );
}

export default Banner;