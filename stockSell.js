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

var ticker = localStorage.getItem('sellTicker');
var shares = localStorage.getItem('SharesAvail');
var currentPrice = localStorage.getItem('sellCurrentPrice');

document.getElementById('stockName').innerText = ticker;

document.getElementById('stockPrice').innerText = "current price: $" + currentPrice;
document.getElementById('sharesAvailable').innerText = "Shares available: " + shares;



const submitButton = document.getElementById('btnSubmit');


//TODO: ADD FUNCTIONALITY TO SELL BUTTON 
submitButton.addEventListener("click", function(event) {
    event.preventDefault(); // Prevent the form from submitting (if it's inside a form element)

    // Retrieve the number of shares entered by the user
    let amountOfSharesToSell = document.getElementById("shares").value;
    //check if the user has enough available shares to sell
    shares = Number(shares);
    amountOfSharesToSell = Number(amountOfSharesToSell);

    console.log("selling " + ticker + ' shares available: ' + shares + "trying to sell " + amountOfSharesToSell);
    if(shares < amountOfSharesToSell){
        alert('not enough available shares. You only have ' + shares + ' shares available. trying to sell ' + amountOfSharesToSell);
    }
    else if(amountOfSharesToSell <= 0){
        alert('Enter positive amount of shares to sell');
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
                for(let i = 0; i < assetData.length; i++){
                    if(assetData[i].asset == ticker){
                        //update the the amount of shares in database

                        if(assetData[i].amount == amountOfSharesToSell) {
                            console.log('Updating assetg array because you sold all shares of ' + ticker);
                            assetData.splice(i, 1);
                        }
                        else{
                            assetData[i].amount -= amountOfSharesToSell;
                        }
                    }
                    else if(assetData[i].asset == "$"){
                        assetData[i].amount += currentPrice*amountOfSharesToSell;

                    }
                }
                set(ref(database, 'user_assets/' + userUID), {
                    assets: assetData  
                  });
                  window.location.href = "HomePage.html";
            } else {
                console.log("No data available for this user");
            }
        })
        .catch((error) => {
            console.error("Error fetching asset data:", error);
        });
    }

  });




