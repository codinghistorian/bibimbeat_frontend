import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import MusicFactory from '../../abi/MusicFactory.json';
import MusicMarket from '../../abi/MusicMarket.json';
import addresses from '../../environment/ContractAddress.json';
import axios from 'axios';
import './myMusicList.css';

function MyMusicList() {

    const [Images, setImages] = useState([]);
    const [Titles, setTitles] = useState([]);
    const [Artists, setArtists] = useState([]);
    const [Genre, setGenre] = useState([]);
    const [TokenIDs, setTokenIDs] = useState([]);
    const [Descriptions, setDescriptions] = useState([]);
    const [ExternalURLs, setExternalURLs] = useState([]);
    const [Songs, setSongs] = useState([]);
    const [Amounts, setAmounts] = useState([]);

    const [SelectedImage, setSelectedImage] = useState();
    const [SelectedTitle, setSelectedTitle] = useState();
    const [SelectedArtist, setSelectedArtist] = useState();
    const [SelectedGenre, setSelectedGenre] = useState();
    const [SelectedTokenID, setSelectedTokenID] = useState();
    const [SelectedDescription, setSelectedDescription] = useState();
    const [SelectedExternalURL, setSelectedExternalURL] = useState();
    const [SelectedAmount, setSelectedAmount] = useState();

    const [SellButtonText, setSellButtonText] = useState("Sell");
    const [IsInputVisible, setIsInputVisible] = useState("hidden");

    const [Price, setPrice] = useState();

    const putSongInfo = (i) => {
        setSelectedTokenID(TokenIDs[i]);
        setSelectedAmount(Amounts[i]);
        setSelectedTitle(Titles[i]);
        setSelectedArtist(Artists[i]);
        setSelectedGenre(Genre[i]);
        setSelectedDescription(Descriptions[i]);
        setSelectedExternalURL(ExternalURLs[i]);
        setSelectedImage(Images[i]);
    }

    useEffect(() => {
        const renderNFTList = async () => {

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();
            const musicFactory = new ethers.Contract(addresses.musicFactory, MusicFactory.abi, signer);
            const tokenIdList = await musicFactory.getTokenIDs();

            await Promise.all(tokenIdList.map(async (res, index) => {

                //adds token ID
                const tokenID = parseInt(Number(res._hex), 10);
                setTokenIDs(prevArr => [...prevArr, tokenID]);

                //adds token amount
                const amount = await musicFactory.getTokenAmount(tokenID);
                const amountToDec = parseInt(Number(amount._hex), 10);
                setAmounts(prevArr => [...prevArr, amountToDec]);

                // gets metadata from metada uri  
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log(accounts[0])
                const uri = await musicFactory.getTokenURI(accounts[0], tokenID);
                var hex = uri.toString();
                var str = "";
                for (var n = 2; n < hex.length; n += 2) {
                    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
                }
                console.log(str);
                const gatewayUri = getGatewayAddress(str);
                const result = await axios.get(gatewayUri);
                const metadata = result.data;
                const image_url = getGatewayAddress(subIPFS(metadata.image));
                const music_url = getGatewayAddress(subIPFS(metadata.animation_url));

                // adds metadata
                setTitles(prevArr => [...prevArr, metadata.name]);
                setArtists(prevArr => [...prevArr, metadata.artist]);
                setGenre(prevArr => [...prevArr, metadata.genre]);
                setDescriptions(prevArr => [...prevArr, metadata.description]);
                setExternalURLs(prevArr => [...prevArr, metadata.external_url]);
                setImages(prevArr => [...prevArr, image_url]);
                setSongs(prevArr => [...prevArr, music_url]);

                if (index === 0) { // adds initial data
                    setSelectedTokenID(tokenID);
                    setSelectedAmount(amountToDec);
                    setSelectedTitle(metadata.name);
                    setSelectedArtist(metadata.artist);
                    setSelectedGenre(metadata.genre);
                    setSelectedDescription(metadata.description);
                    setSelectedExternalURL(metadata.external_url);
                    setSelectedImage(image_url);
                    setSongs(music_url);
                }
            }));
        }

        renderNFTList();
        window.ethereum.on('accountsChanged', () => {
            console.log("account changed!");
            renderNFTList();
        });
    }, []);

    const getGatewayAddress = (cid) => {
        var gatewayAddress = "https://ipfs.io/ipfs/" + cid
        return gatewayAddress;
    }
    const subIPFS = (str) => {
        return str.slice(7);
    }

    const clickSellButton = () => {
        setSellButtonText("Approve");
    }

    const clickApproveButton = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const musicFactory = new ethers.Contract(addresses.musicFactory, MusicFactory.abi, signer);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!(await musicFactory.isApprovedForAll(accounts[0], addresses.musicMarket))) {
            const tx = await musicFactory.setApprovalForAll(addresses.musicMarket, true);
            await tx.wait();
            window.alert("your token has been approved to smart contract.");    
        }
        setSellButtonText("Add on tradeblock");
        setIsInputVisible("visible");
    }
    
    const clickAddOnTradeblock = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const musicMarket = new ethers.Contract(addresses.musicMarket, MusicMarket.abi, signer);
        const tx = await musicMarket.openTrade(SelectedTokenID, Price, 1);
        await tx.wait();
        window.alert("your NFT has been uploaded on tradeblock!");
        window.location.reload();
    }

    const putPrice = (e) => {
        setPrice(e.target.value);
    }

    return (
        <article>
            <section>
                <div className="container">
                    <div className="tokenInfo">
                        <div className="tokenImage">
                        <img src={SelectedImage} alt={SelectedImage} width="200"></img>
                        </div>
                        <div className="metadata">
                           <p>
                           Token Amount - {SelectedAmount}
                            <br />
                            Title - {SelectedTitle}
                            <br />
                            Artist - {SelectedArtist}
                            <br />
                            Genre - {SelectedGenre}
                            <br />
                            ID - {SelectedTokenID}
                            <br />
                            Description - {SelectedDescription}
                            <br />
                            ExternalURL - {SelectedExternalURL}
                            <br />
                           </p>
                            
                        </div>

                       
                        <div className="buttons">
                        <button className="sell" onClick={() => {
                                if (SellButtonText === "Sell")
                                    clickSellButton();
                                else if (SellButtonText === "Approve")
                                    clickApproveButton();
                                else if (SellButtonText === "Add on tradeblock")
                                    clickAddOnTradeblock();
                            }}>{SellButtonText}</button>
                            <input className="priceInput" type="number" onChange={putPrice} style={{visibility: IsInputVisible}} placeholder="Set price"></input>
                        </div>
                    </div>

                    
                    <div>
                        <div className="tokenInfo">
                        <div className="MTs">
                        {
                            TokenIDs.map((res, index) => (
                                <div key={index}>
                                    <button  style={{ marginBottom: "10px" }}onClick={() => putSongInfo(index)}>{Artists[index]} - {Titles[index]}</button>
                                </div>
                            ))
                        }
                        </div>
                        </div>
                    </div>
                </div>
            </section>
        </article>
    );
}

export default MyMusicList;