import "./market.css"
import MusicMarket from '../../abi/MusicMarket.json';
import MusicFactory from '../../abi/MusicFactory.json';
import ERC20Minter from '../../abi/ERC20Minter.json';
import addresses from '../../environment/ContractAddress.json';
import { ethers } from 'ethers';
import axios from 'axios';
import { useEffect, useState } from 'react';

function Market() {
    const [Images, setImages] = useState([]);
    const [Titles, setTitles] = useState([]);
    const [Artists, setArtists] = useState([]);
    const [Genre, setGenre] = useState([]);
    const [TokenIDs, setTokenIDs] = useState([]);
    const [Descriptions, setDescriptions] = useState([]);
    const [ExternalURLs, setExternalURLs] = useState([]);
    const [Amounts, setAmounts] = useState([]);
    const [Prices, setPrices] = useState([]);
    const [TradeCounters, setTradeCounters] = useState([]);

    const [SelectedImage, setSelectedImage] = useState();
    const [SelectedTitle, setSelectedTitle] = useState();
    const [SelectedArtist, setSelectedArtist] = useState();
    const [SelectedGenre, setSelectedGenre] = useState();
    const [SelectedTokenID, setSelectedTokenID] = useState();
    const [SelectedDescription, setSelectedDescription] = useState();
    const [SelectedExternalURL, setSelectedExternalURL] = useState();
    const [SelectedAmount, setSelectedAmount] = useState();
    const [SelectedPrice, setSelectedPrice] = useState();
    const [SelectedTradeCounter, setSelectedTradeCounter] = useState();

    const [OpenTradeCounters, setOpenTradeCounters] = useState([]);

    const [BuyButtonText, setBuyButtonText] = useState("Buy");

    const putSongInfo = (i) => {
        setSelectedTokenID(TokenIDs[i]);
        setSelectedAmount(Amounts[i]);
        setSelectedTitle(Titles[i]);
        setSelectedArtist(Artists[i]);
        setSelectedGenre(Genre[i]);
        setSelectedDescription(Descriptions[i]);
        setSelectedExternalURL(ExternalURLs[i]);
        setSelectedImage(Images[i]);
        console.log(OpenTradeCounters[i]);
        setSelectedTradeCounter(OpenTradeCounters[i]);
        setSelectedPrice(Prices[i]);
    }

    const getGatewayAddress = (cid) => {
        var gatewayAddress = "https://ipfs.io/ipfs/" + cid
        return gatewayAddress;
    }

    const subIPFS = (str) => {
        return str.slice(7);
    }

    const getURIStringfromHex = (uri) => {
        var hexStr = uri.toString();
        var str = "";
        for (var n = 2; n < hexStr.length; n += 2) {
            str += String.fromCharCode(parseInt(hexStr.substr(n, 2), 16));
        }
        return str;
    }

    const initializeStates = () => {
        setTokenIDs([]);
        setAmounts([]);
        setTitles([]);
        setArtists([]);
        setGenre([]);
        setDescriptions([]);
        setExternalURLs([]);
        setImages([]);
    }

    useEffect(() => {
        const callTrades = async () => {
            initializeStates();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();
            const musicMarket = new ethers.Contract(addresses.musicMarket, MusicMarket.abi, signer);
            console.log(musicMarket);
            console.log("contract address : " + addresses.musicMarket);

            const tradeCounterHex = await musicMarket.tradeCounter();
            const tradeCounter = parseInt(Number(tradeCounterHex._hex), 10);
            console.log("trade Counter : " + tradeCounter);

            let openTradeCounters = [];
            for (let i = 0; i < tradeCounter; i++) {
                const trade = await musicMarket.trades(i);
                const status = getURIStringfromHex(trade.status);

                if (status.startsWith("OPEN")) {
                    console.log("this is open!");
                    openTradeCounters.push(i);
                }
            }
            console.log("OpenTradeCounter: " + openTradeCounters); // [2]
            console.log("length of open trade counters : " + openTradeCounters.length)
            setOpenTradeCounters(openTradeCounters);
            
            console.log("---------------------------")
            if (openTradeCounters.length > 0) {
                for (let i = 0; i < openTradeCounters.length; i++) {
                    const trade = await musicMarket.trades(openTradeCounters[i]);

                    console.log("Poster : " + trade.poster);
                    console.log("Item : " + trade.item);
                    console.log("Amount : " + trade.amount);
                    console.log("Price : " + trade.price);
                    const status = getURIStringfromHex(trade.status);
                    console.log("Status : " + status);

                    const amount = parseInt(Number(trade.amount._hex), 10);
                    const tokenID = parseInt(Number(trade.item._hex), 10);
                    const price = parseInt(Number(trade.price._hex), 10);
                    // const status = getURIStringfromHex(trades.status._hex);

                    const musicFactory = new ethers.Contract(addresses.musicFactory, MusicFactory.abi, signer);
                    const hexUri = await musicFactory.getTokenURI(tokenID);
                    const uri = getURIStringfromHex(hexUri);
                    const gatewayUri = getGatewayAddress(uri);
                    const result = await axios.get(gatewayUri);
                    const metadata = result.data;
                    const image_url = getGatewayAddress(subIPFS(metadata.image));
                    // const music_url = getGatewayAddress(subIPFS(metadata.animation_url));

                    setTokenIDs(prevArr => [...prevArr, tokenID]);
                    setTradeCounters(prevArr => [...prevArr, i]);
                    setAmounts(prevArr => [...prevArr, amount]);
                    setTitles(prevArr => [...prevArr, metadata.name]);
                    setArtists(prevArr => [...prevArr, metadata.artist]);
                    setGenre(prevArr => [...prevArr, metadata.genre]);
                    setDescriptions(prevArr => [...prevArr, metadata.description]);
                    setExternalURLs(prevArr => [...prevArr, metadata.external_url]);
                    setImages(prevArr => [...prevArr, image_url]);
                    setPrices(prevArr => [...prevArr, price]);

                    if (i === 0) { // adds initial data
                        setSelectedTokenID(tokenID);
                        setSelectedAmount(amount);
                        setSelectedTitle(metadata.name);
                        setSelectedArtist(metadata.artist);
                        setSelectedGenre(metadata.genre);
                        setSelectedDescription(metadata.description);
                        setSelectedExternalURL(metadata.external_url);
                        setSelectedImage(image_url);
                        setSelectedPrice(price);
                        setSelectedTradeCounter(i);
                        // setSongs(music_url);
                    }

                }
            }
        };
        callTrades();
    }, [])

    const clickBuyButton = () => {
        setBuyButtonText("Approve");
    }

    const clickApproveButton = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const erc20Minter = new ethers.Contract(addresses.erc20, ERC20Minter.abi, signer);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("is allowed?")
        // const amountToDec = parseInt(Number(amount._hex), 10);
        const allowedAmount = parseInt(Number(await erc20Minter.allowance(accounts[0], addresses.musicMarket)), 10);
        // if (allowedAmount === 0) {
            const tx = await erc20Minter.approve(addresses.musicMarket, SelectedPrice);
            await tx.wait();
            window.alert("your token has been approved to smart contract.");
        // }
        setBuyButtonText("Purchase");
    }

    const clickPurchaseButton = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const musicMarket = new ethers.Contract(addresses.musicMarket, MusicMarket.abi, signer);
        console.log("Selected Trade Counter : " + SelectedTradeCounter);
        const tx = await musicMarket.executeTrade(SelectedTradeCounter);
        await tx.wait();
        window.alert("you just purchased NFT! please check out My Music.");
        window.location.reload();
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
                            Price - {SelectedPrice}
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
                            <button className="buy" onClick={() => {
                                if (BuyButtonText === "Buy")
                                    clickBuyButton();
                                else if (BuyButtonText === "Approve")
                                    clickApproveButton();
                                else if (BuyButtonText === "Purchase")
                                    clickPurchaseButton();
                            }}>{BuyButtonText}</button>
                        </p>
                       </div>
                    </div>
                    <div>
                    <div className="tokenInfo">
                        <div className="MTs">
                        {
                            [...Array(OpenTradeCounters.length)].map((n, index) => (
                                <div key={index}>
                                    <button onClick={() => putSongInfo(index)}>{Artists[index]} - {Titles[index]}</button>
                                </div>
                            ))
                        }
                        {/* 
                            TradeCounters.map((res, index) => (
                        <div key={index}>
                            <button onClick={(index) => putSongInfo(index)}>{Artists[index]} - {Titles[index]}</button>
                        </div>
                        ))
                        } */}
                    </div>
                    </div>
                    </div>
                </div>
            </section>
        </article>
    );
}

export default Market;
