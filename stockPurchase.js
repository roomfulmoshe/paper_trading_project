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

async function getLast52WeekClose(ticker){

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



//ticker
//Stock chart animation

const ctx = document.getElementById('stockChart1').getContext('2d');
   // Simulated data for stock prices
   const stockData = {
    labels: Array.from({ length: 52 }, (_, i) => (i % 4 === 0 ? 'Month ' + (i / 4) : '')),
    datasets: [
        {
            label: 'Stock Price',
            data: [1351, 482, 393, 436, 324, 392, 494, 458, 391, 366, 452, 476, 462, 
                  401, 344, 389, 496, 361, 344, 483, 368, 437, 465, 496, 309, 319, 
                  488, 371, 368, 431, 373, 320, 313, 483, 480, 406, 378, 318, 348, 
                  365, 323, 456, 316, 354, 342, 340, 406, 497, 431, 311], // Simulated data
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

if (data[data.length - 1] < data[data.length - 2]) {
    stockData.datasets[0].borderColor = 'red';
   
} else stockData.datasets[0].borderColor = 'green';

// Create the chart


const stockChart = new Chart(ctx, {
    type: 'line',
    data: stockData,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    display: false, // Remove vertical grid lines
                },
                ticks: {
                    color: 'white', // Set x-axis label color to white
                },
            },
            y: {
                beginAtZero: true,
                stepSize: 10,
                grid: {
                    color: 'white', // Set y-axis grid line color to white
                },
                ticks: {
                    color: 'white', // Set y-axis label color to white
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                position: 'nearest',
            },
        },
    },
});




// Set the horizontal grid lines to 10% opacity
stockChart.options.scales.y.grid.color = 'rgba(255, 255, 255, 0.1)';
stockChart.update();




