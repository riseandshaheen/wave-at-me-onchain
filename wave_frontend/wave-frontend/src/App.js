import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';
import Footer from "./Components/Footer";

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x08A546a73336aCEDE72Be98B2e635e1da47d830e";
  const contractABI = abi.abi;

  const [isWaved, setWaved] = useState(false);  //conditional wave on click rendering
  const [isLoading, setLoading] = useState(false); //conditional loading animation on clicking

  const [allWaves, setAllWaves] = useState([]); //to store all waves

  const [msg, setMsg] = useState(""); //message value

  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      /*
          * Check if we're authorized to access the user's wallet
          */
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves(); //all waves
      } else {
        console.log("No authorized account found")
      }

    } catch (error) {
      console.log(error);
    }
  }

  /**
    * Implement your connectWallet method here
    */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

    } catch (error) {
      console.log(error)
    }
  }



  /*
    * This runs our function when the page loads.
    */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /* Write to blockchain */
        /*get message string from text area */
        const waveTxn = await wavePortalContract.wave(msg);
        console.log("Mining...", waveTxn.hash);
        setLoading(true);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        setLoading(false); /* set loading state false */
        setWaved(true); /*set recognition state true */

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }

  }

  /* function to get all waves */

  const getAllWaves = async () => {

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });
        console.log(waves);
        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
        
        /**
         * Listen in for emitter events!
         */
        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }

  }

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hi! I'm Shaheen.
        </div>

        <div className="bio">
          I code, read and draw! HMU! To make sure your msg is written on the blockchain for eternity, first connect your Ethereum wallet and then send!
        </div>

        {/*message area */}
        
        <textarea value={msg} onChange={e => setMsg(e.target.value)} className="message" placeholder="tell a book you wish to read..." >
        </textarea>
        <button className="waveButton" onClick={wave}>
          Send
        </button>

        {/* render loading animation */}
        {isLoading && <ShowLoading />}


        {/* render  after successful wave */}
        {isWaved && <ShowRecognition />}

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {/* all waves title */}
        {currentAccount && (<h2 style={{marginTop: "40px"}}>Others said...</h2>)}

        {/* all waves data */}
        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "3px", padding: "10px" }}>
              <div style={{fontFamily: "Annie Use Your Telescope", fontSize: "20px", fontWeight: "bold", letterSpacing: "2px", padding: "10px"}}>{wave.message}</div>
              <div style={{fontSize: "12px", color: "gray"}}>From: {wave.address}</div>
              <div style={{fontSize: "12px", color: "gray"}}>Time: {wave.timestamp.toString()}</div>
            </div>)
        })}

      <Footer/>
      </div>

      
      
    </div>
    

  );
}


function ShowRecognition() {
  return (
    <div className="bio">
      <p>Waved! You've now become a part of revolution. Follow @riseandshaheen on twitter for further updates.</p>
    </div>
  )

}

function ShowLoading() {
  return (
    <div className="spinner">
    </div>
  )
}