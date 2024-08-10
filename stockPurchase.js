import { getLast52WeekClose, getCurrentPrice, formatDollars, getMonths, createChart } from './stocksAPI.js';
//Lottie Animation
// Get the container element where the animation will be displayed
const container = document.querySelector(".lottie-container");

// Load the Lottie animation from the provided URL
lottie.loadAnimation({
  container: container, // Specify the container element
  renderer: "svg", // Choose the renderer (svg, canvas, html)
  loop: true, // Set animation loop
  autoplay: true, //  play automatically
  path: "https://lottie.host/4bcddfb6-7284-4937-a41e-0d930e3faca0/A1AKLEELew.json", // Provide the URL of the animation JSON
});


const container1 = document.querySelector(".lottie-container2");

// Load the Lottie animation from the provided URL
lottie.loadAnimation({
  container: container1, // Specify the container element
  renderer: "svg", // Choose the renderer (svg, canvas, html)
  loop: true, // Set animation loop
  autoplay: true, //  play automatically
  path: "https://lottie.host/4bcddfb6-7284-4937-a41e-0d930e3faca0/A1AKLEELew.json", // Provide the URL of the animation JSON
});





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



//TODO: create function that returns last 52 week prices as an aray
let ticker  = localStorage.getItem('buyBtn');
document.getElementById('stockName').innerText = ticker;
let currentPrice = await getCurrentPrice(ticker);

document.getElementById('stockPrice').innerText = "current price: $" + formatDollars(currentPrice)


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



//ticker
//Stock chart animation
var closing_prices = null;
getLast52WeekClose(ticker).then(prices => {
    // Array to hold months 
    const months = getMonths();




    const labels = Array.from({ length: 50 }, (_, i) => (i % 4 === 0 ? months[Math.floor(i / 4)] : ''));

    // Calculate the starting y-axis value to the nearest 10th
    const minY = Math.floor(Math.min(...prices) / 10) * 10;

    const ctx = document.getElementById('stockChart1').getContext('2d');
   // Simulated data for stock prices
   const stockData = {
    labels: labels, // Use month names
    datasets: [
        {
            label: 'Stock Price',
            data: prices, // Simulated data
            borderColor: 'green', // Initial color
            borderWidth: 3, // Set line width
            borderJoinStyle: 'round', // Soften the edges
            fill: false,
            pointRadius: 0, // Make data points invisible
        },
    ],
    };

    // Modify the line color based on data points
    const data = stockData.datasets[0].data;

    if (data[data.length - 1] < data[0]) {
      stockData.datasets[0].borderColor = 'red';
    } else {
      stockData.datasets[0].borderColor = 'green';
    }
    const stockChart = createChart(stockData, ctx, minY);




    // Set the horizontal grid lines to 10% opacity
    stockChart.options.scales.y.grid.color = 'rgba(255, 255, 255, 0.1)';
    stockChart.update();
});