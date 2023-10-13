// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, set, ref, get } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCRXoWAyHb9v9x8P75Cp9BdEfCHjvHJJn8",
    authDomain: "paper-trading-simulator-f71ce.firebaseapp.com",
    databaseURL: "https://paper-trading-simulator-f71ce-default-rtdb.firebaseio.com",
    projectId: "paper-trading-simulator-f71ce",
    storageBucket: "paper-trading-simulator-f71ce.appspot.com",
    messagingSenderId: "631191317349",
    appId: "1:631191317349:web:4c2bb236136ccf58f7cf8c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth();

async function getCurrentPrice(ticker) {
    const API_KEY = 'EN3735MN44LA7F35';
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`;
    
    try {
      const response = await axios.get(url);
      const price = response.data['Global Quote']['05. price'];
      return price;
    } catch (error) {
      console.error(error);
      throw error; // Re-throw the error to handle it elsewhere if needed
    }
  }

let ticker  = localStorage.getItem('buyBtn');
document.getElementById('stockName').innerText = ticker;
let currentPrice = await getCurrentPrice(ticker);

document.getElementById('stockPrice').innerText = "current price: $" + currentPrice


const submitButton = document.getElementById('btnSubmit');

submitButton.addEventListener("click", function(event) {
    event.preventDefault(); // Prevent the form from submitting (if it's inside a form element)

    // Retrieve the number of shares entered by the user
    const amountOfShares = document.getElementById("shares").value;
    //check if the use has enough money to complete the request
    const buyingPower = localStorage.getItem('buyingPower')
    console.log('buyingPower', buyingPower)
    if(amountOfShares <= 0){
        alert('Please enter positive amount of shares');
    }
    else if(buyingPower < currentPrice*amountOfShares){
        alert('not enough available balance to complete the transaction')
    }
    else {
        // TO-DO: Check if the user already has  a share with this ticker and update the amount of shares in database
        // Fetch the asset data
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const userUID = loggedInUser.uid;
        const assetsRef = ref(database, 'user_assets/' + userUID + '/assets');
        get(assetsRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const assetData = snapshot.val();
                // Do something with assetData, which will be an array
                var foundTicker = false;
                for(let i = 0; i < assetData.length; i++){
                    if(assetData[i].asset == ticker){
                        let numberOfShares = Number(amountOfShares); 
                        let numberOfExistingShares = Number(assetData[i].amount);
                        numberOfExistingShares += numberOfShares;
                        assetData[i].amount = numberOfExistingShares
                        console.log(typeof assetData[i].amount);
                        console.log(typeof numberOfShares);
                        foundTicker = true;
                    }
                    else if(assetData[i].asset == "$"){
                        assetData[i].amount -= currentPrice*amountOfShares;
                    }
                }
                if(foundTicker == false){
                    assetData.push({amount: amountOfShares,  asset: ticker })
                }

                set(ref(database, 'user_assets/' + userUID), {
                assets: assetData
                })
                window.location.href = "buy.html";
            } else {
                console.log("No data available for this user");
            }
        })
        .catch((error) => {
            console.error("Error fetching asset data:", error);
        });
    }

  });




