import logo from '../images/logo.png';
import './menuBar.css';
import './logo.css'


function BibimbeatLogo() {
    return (
        <div>
            <div className="flex-containerLogo">
                <img id='logo' src={logo} alt={logo}></img>
                <div className="flex-containerLogo2">
                    <div>Bibimbeat</div>
                    <div>Music NFT Market</div>
                </div>
            </div>

        </div>
    );
}

export default BibimbeatLogo;