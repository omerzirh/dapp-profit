"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
const avaxChainId = "0xa86a";
export default function Home() {
  const [accountNumber, setAccountNumber] = useState("");
  const [history, setHistory] = useState([]);
  const [currentAmountUsd, setCurrentAmountUsd] = useState(0);
  const [currentAmountLIZARD, setCurrentAmountLIZARD] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const pricesArray = [];
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      console.log("MetaMask is installed!");
    }
  }, []);
  useEffect(() => {
    //get total amount of lizard by adding values in pricesArray's every object's second element
    const setCurrentAmountLIZARD = () => {
      let total = 0;
      pricesArray.forEach((element) => {
        console.log(element);
      });
      setCurrentAmountLIZARD(total);
    };
    console.log(currentAmountLIZARD);
  }, [pricesArray]);

  const detectNetwork = async () => {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    console.log(chainId);
    window.ethereum.on("chainChanged", handleChainChanged);

    function handleChainChanged(chainId) {
      // We recommend reloading the page, unless you must do otherwise.
      window.location.reload();
    }
  };
  const switchAddNetWork = async () => {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: avaxChainId,
        },
      ],
    });
  };

  async function getAccount() {
    const accounts = await window.ethereum
      .request({ method: "eth_requestAccounts" })
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log("Please connect to MetaMask.");
        } else {
          console.error(err);
        }
      });
    const account = accounts[0];
    setAccountNumber(account);
  }
  const connectWallet = () => {
    // You should only attempt to request the user's account in response to user
    // interaction, such as selecting a button.
    // Otherwise, you popup-spam the user like it's 1999.
    // If you fail to retrieve the user's account, you should encourage the user
    // to initiate the attempt.

    ethereumButton.addEventListener("click", () => {
      getAccount();
    });

    // While awaiting the call to eth_requestAccounts, you should disable
    // any buttons the user can select to initiate the request.
    // MetaMask rejects any additional requests while the first is still
    // pending.
  };
  console.log(history);

  const fetchAccountHistory = async () => {
    await fetch(
      `https://api-beta.avascan.info/v2/network/mainnet/evm/43114/address/${accountNumber}/erc20-transfers?ecosystem=avalanche&includedChainIds=43114%2C73772&limit=25`
    )
      .then((res) => res.json())
      .then((data) => setHistory(data.items));
  };
  //there is an array of prices with unix timestamps. get array in parameter and convert date to readable format
  const getPriceofToken = async (data) => {
    const prices = data.prices;
    const arrayTempPrices = [];
    for (let i = 0; i < prices.length; i++) {
      //convert unix timestamp to readable format dd/mm/yyyy-hh:mm

      // Create a new JavaScript Date object based on the timestamp
      // multiplied by 1000 so that the argument is in milliseconds, not seconds
      var a = new Date(prices[i][0]);
      var months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var sec = a.getSeconds();
      var time =
        date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;

      console.log(prices[i]);
      console.log(time);

      console.log(prices[i][1]);
    }
  };
  const getPriceofTokeninSpesificTimestamp = async () => {
    for (let i = 0; i < history.length; i++) {
      const timestamp = history[i].timestamp;
      //convert "2024-01-18T17:31:02.000Z" to unix timestamp
      const unixTimestamp = Math.floor(new Date(timestamp).getTime() / 1000);
      //convert today's date to unix timestamp
      const today = Math.floor(Date.now() / 1000);
      await fetch(
        `https://api.coingecko.com/api/v3/coins/avalanche/contract/0xed0d09ee0f32f7b5afae6f2d728189c5e355b52a/market_chart/range?vs_currency=usd&from=${unixTimestamp}&to=${today}`
      )
        .then((res) => res.json())
        .then((data) => {
          const price = data.prices[0][1];
          const amount = history[i].amount;
          pricesArray.push({ price, amount });
        });
    }
    console.log(pricesArray);
  };
  return (
    <main className={styles.main}>
      <div>
        <h1>Profit Calculator</h1>
        <button onClick={getAccount}>Connect Wallet</button>
        <button onClick={detectNetwork}>detectNetwork</button>
        <button onClick={switchAddNetWork}>switch work </button>
        <button onClick={fetchAccountHistory}>get history </button>
        <button onClick={getPriceofTokeninSpesificTimestamp}>get price </button>

        <h1 style={{ color: "red" }}>{accountNumber}</h1>
        <h1>{currentAmountUsd}</h1>
        <h1>{currentAmountLIZARD}</h1>
        <h1>{totalProfit}</h1>
      </div>
    </main>
  );
}
