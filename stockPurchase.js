function formatDollars(amount) {

  // Convert to string
  let strAmount = amount.toString();

  // Split on decimal
  let [whole, decimal] = strAmount.split(".");

  // Add commas to whole 
  whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");  

  // Limit decimal to 2 places
  if (decimal) {
    decimal = decimal.slice(0, 2);
  }

  // Add decimal back if needed
  if (decimal) {
    strAmount = `${whole}.${decimal}`; 
  } else {
    strAmount = whole;
  }

  // Add $ and return
  return "$" + strAmount;

}


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



//TODO: create function that returns last 52 week prices as an aray
async function getLast52WeekClose(ticker) {

    // Use a valid API key 
    const API_KEY = 'EN3735MN44LA7F35';
    
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=${ticker}&apikey=${API_KEY}`;
  
    try {
  
      const response = await axios.get(url);
  
      const weeklyClosePrices = Object.values(response.data['Weekly Adjusted Time Series'])
        .map(day => Number(day['5. adjusted close']))
        .reverse();
  
      // Slice last 52 weeks
      return weeklyClosePrices.slice(-52);
  
    } catch (error) {
      console.error(error);
    }
  
  }
let ticker  = localStorage.getItem('buyBtn');
document.getElementById('stockName').innerText = ticker;
let currentPrice = await getCurrentPrice(ticker);
currentPrice  = formatDollars(currentPrice);
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

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

//ticker
//Stock chart animation
var closing_prices = null;
getLast52WeekClose(ticker).then(prices => {
    closing_prices = prices;
    console.log(closing_prices);

    // Get current date
    const now = new Date();

    // Array to hold months 
    const months = [];

    // Loop 12 times  
    for (let i = 0; i < 12; i++) {

      // Subtract i months from current month
      const monthIndex = now.getMonth() - i;
      
      // Handle wrap around
      const index = (12 + monthIndex) % 12;

      // Get the month name 
      const month = monthNames[index];

      // Add to months array
      months.unshift(month); 
    }

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
            data: closing_prices, // Simulated data
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
              beginAtZero: false,
              suggestedMin: minY, // Set the suggested minimum to the nearest 10th
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
});




