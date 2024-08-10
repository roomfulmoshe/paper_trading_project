//TODO: Work on chart showing green for up and red for down. Then be able to search for any ticker in the world
import { getLast52WeekClose, getCurrentPrice, createChart, getMonths, formatDollars, getCurrentDateString, getEmailUsername, fixNav } from './stocksAPI.js';
// Get the container element where the animation will be displayed
const container = document.querySelector(".lottie-container");

// Load the Lottie animation from the provided URL
lottie.loadAnimation({
  container: container, // Specify the container element
  renderer: "svg", // Choose the renderer (svg, canvas, html)
  loop: true, // Set animation loop
  autoplay: true, //  play automatically
  path: "https://lottie.host/830e37be-df5c-4a5d-b6ec-58d9f2528494/3JzJN2MVyj.json", // Provide the URL of the animation JSON
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


const tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "LLY", "V", "UNH", "TSM", "XOM", "WMT", "JPM", "NVO", "JNJ", "MA", "AVGO", "PG", "CVX", "ORCL", "HD", "MRK", "ABBV", "COST", "ADBE", "TM", "ASML", "KO"];


function handleBuyBtnClick(stockIndex, stockTicker) {
    localStorage.setItem("buyBtn", stockTicker);
    window.location.href = "stockPurchase.html";
}

async function displayUserInfo(assetData) {
  //table to display user's stocks
  const table = document.getElementById('stockListTable');
  var totalValue = 0;
  for (let i = 0; i < assetData.length; i++) {
    if (assetData[i].asset === "$") {
      document.getElementById("dollarAmount").innerText = formatDollars(Math.floor(assetData[i].amount));
      localStorage.setItem('buyingPower', assetData[i].amount);
      console.log('set local storage buying power ', localStorage.getItem('buyingPower'),'something else');
      totalValue += assetData[i].amount;
    } else {
      // Here, you can directly await the result of getCurrentPrice
      try {
        let currentPrice = await getCurrentPrice(assetData[i].asset);
        totalValue = totalValue + assetData[i].amount*currentPrice;
      } catch (error) {
        console.error(error);
      }
    }
  }
    document.getElementById('totalValue').innerText =  formatDollars(Math.floor(totalValue));

}

const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
const loggedIn = localStorage.getItem('loggedIn');

if (loggedInUser) {
  // You can access user properties, such as email, UID, etc.
  let userEmail = loggedInUser.email;
  const userUID = loggedInUser.uid;

  userEmail = getEmailUsername(userEmail);

    // Reference to the user's assets
    const assetsRef = ref(database, 'user_assets/' + userUID + '/assets');
    // Fetch the data
    get(assetsRef)
    .then((snapshot) => {
        if (snapshot.exists()) {
        const assetData = snapshot.val();
        // Do something with assetData, which will be an array
        displayUserInfo(assetData);
        } else {
        console.log("No data available for this user");
        }
    })
    .catch((error) => {
        console.error("Error fetching asset data:", error);
    });
  // Use the user information to personalize the dashboard content or perform actions.
  // For example, display the user's email on the dashboard.
  document.getElementById('currentDate').innerText = getCurrentDateString();

} else {
  console.log("logged in user is not found in local storage. Please");
  // Handle the case where no user information is found (user not logged in)
  // You can redirect the user back to the login page or take appropriate action.
}


const searchBar = document.getElementById('searchBar');
const stockListTable = document.getElementById('stockListTable');
const stockList = tickers.slice(); // Create a copy of the original tickers array

// Function to update the stock list based on the search input
async function updateStockList() {
  const searchText = searchBar.value.trim().toUpperCase();
  const filteredStocks = stockList.filter(ticker => ticker.includes(searchText));

  // Clear the table
  stockListTable.innerHTML = '<tr><th>Stocks</th><th>Current Value</th><th>Purchase</th></tr>'
//   // Populate the table with filtered stocks

if (filteredStocks.length == 0)
{
  stockListTable.innerHTML = "<tr><th colspan=\"3\">No results found!</th></tr>";
}
else
{
  for (let i = 0; i < filteredStocks.length; i++) {
      const ticker = filteredStocks[i];
      
      const row = document.createElement("tr");
      const tickerTd = document.createElement("td");
      tickerTd.id = "ticker" + i;
      tickerTd.textContent = ticker;

      const priceTd = document.createElement("td");
      priceTd.id = "currentPrice" + i;
      // add current price dynamically 
      let number = getCurrentPrice(ticker);
      number.then(price => {
        priceTd.textContent = formatDollars(price);
      });

      const purchaseTd = document.createElement("td");
      purchaseTd.id = "purchase" + i;
      
      const purchaseBtn = document.createElement("button");
      purchaseBtn.id = "buyButton" + i;
      purchaseBtn.className = "buyButton";
      purchaseBtn.textContent = "BUY";
      purchaseTd.appendChild(purchaseBtn);
      purchaseBtn.addEventListener("click", function() {
          handleBuyBtnClick(i, ticker);  
        });

      row.appendChild(tickerTd);
      row.appendChild(priceTd); 
      row.appendChild(purchaseTd);
      stockListTable.appendChild(row);
    }
  }
}


// Add an event listener to the search bar for real-time search
searchBar.addEventListener('keyup', function (event) {
  if (event.key === 'Enter') {
    updateStockList();
  }
});

document.querySelector('.search').addEventListener('click', function (event) {
    updateStockList();
});

// Initial population of the stock list table
updateStockList();






////////////////////////////////////////////////START OF CHARTS///////////////////////////////////////////////////////////////////////////
//get input for chart1
// Get the input element by its ID
var searchBar1 = document.getElementById("searchBar1");

// Add an event listener for the "keyup" event
searchBar1.addEventListener("keyup", async function(event) {
  // Check if the key pressed is Enter (keyCode 13)
  if (event.key === "Enter") {
    
    // Get the value of the input field
    var searchValue1 = searchBar1.value;

    let number = await getCurrentPrice(searchValue1);
    number = formatDollars(number);
    document.getElementById('displayStockName').innerHTML = `${searchValue1.toUpperCase()} <p>Latest Price ${number}</p>`;

    var chartCanvas = document.getElementById('stockChart1');

    // Check if a chart exists and destroy it
    if (chartCanvas) {
      var chartInstance = Chart.getChart(chartCanvas);
      if (chartInstance) {
        chartInstance.destroy();
      }
    }

    // Do something with the searchValue

    getLast52WeekClose(searchValue1).then(prices => {
      console.log(searchValue1 + "CURRENT PRICES: "+ prices); // latest 52-week prices
      // Array to hold months 
      const months = getMonths();
      // Replace numeric labels with month names
      const labels = Array.from({ length: 50 }, (_, i) => (i % 4 === 0 ? months[Math.floor(i / 4)] : ''));
    
      // Calculate the starting y-axis value to the nearest 10th
      const minY = Math.floor(Math.min(...prices) / 10) * 10;
    
      // ANIMATION FOR CHART 1
      const ctx = document.getElementById('stockChart1').getContext('2d');
    
      // Simulated data for stock prices
      const stockData = {
        labels: labels, // Use month names
        datasets: [
          {
            label: searchValue1,
            data: prices, // Actual data
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
    
      // Create the chart
      const stockChart = createChart(stockData, ctx, minY);
    
      // Set the horizontal grid lines to 10% opacity
      stockChart.options.scales.y.grid.color = 'rgba(255, 255, 255, 0.1)';
      stockChart.update();
    });
    
    
    
   
  }
});


var searchBar2 = document.getElementById("searchBar2");

searchBar2.addEventListener("keyup", async function(event) {
  // Check if the key pressed is Enter (keyCode 13)
  if (event.key === "Enter") {
    
    // Get the value of the input field
    var searchValue2 = searchBar2.value;

    var chartCanvas = document.getElementById('stockChart2');
    let number = await getCurrentPrice(searchValue2);
    number = formatDollars(number);
    document.getElementById('displayStockName2').innerHTML = `${searchValue2.toUpperCase()} <p>Latest Price ${number}</p>`;

    // Check if a chart exists and destroy it
    if (chartCanvas) {
      var chartInstance = Chart.getChart(chartCanvas);
      if (chartInstance) {
        chartInstance.destroy();
      }
    }


    getLast52WeekClose(searchValue2).then(prices => {
      console.log(prices); // latest 52-week prices

      // Array to hold months 
      const months = getMonths();

    
      // Replace numeric labels with month names
      const labels = Array.from({ length: 50 }, (_, i) => (i % 4 === 0 ? months[Math.floor(i / 4)] : ''));
    
      // Calculate the starting y-axis value to the nearest 10th
      const minY = Math.floor(Math.min(...prices) / 10) * 10;
    
      // Animation for Chart 2
      const ctx = document.getElementById('stockChart2').getContext('2d');
    
      // Simulated data for stock prices
      const stockData = {
        labels: labels, // Use month names
        datasets: [
          {
            label: 'Stock Price2',
            data: prices, // Actual data
            borderColor: 'green', // Initial color
            borderWidth: 3, // Set line width
            borderJoinStyle: 'round', // Soften the edges
            fill: false,
            pointRadius: 0, // Make data points invisible
          },
        ],
      };
    
      // Modify the line color based on data points
      const data1 = stockData.datasets[0].data;
      // ///////////////////////////////////////////////////////////////////////////////////////////////////  ///////////////////////////////////////////////////////////////////////////////////////////////////
      if (data1[data1.length - 1] < data1[0]) {
          stockData.datasets[0].borderColor = 'red';
      } else {
          stockData.datasets[0].borderColor = 'green';
      }
    
      const stockChart2 = createChart(stockData, ctx, minY);
    
      // Set the horizontal grid lines to 10% opacity
      stockChart2.options.scales.y.grid.color = 'rgba(255, 255, 255, 0.1)';
      stockChart2.update();
    });
    
  }
});



let number1 = await getCurrentPrice('QQQ');
let number2 = await getCurrentPrice('SPY');


////////////////////////////////////////////////////////////////CRACK AT THIS. MAKE IT WORK FOR PORTFOLIO PAGE TOO. IDK WHAT TO DO ABOUT THIS CSS MESS. Oh dear lord, I don't want to look at that garbage CSS my friend wrote
number1 = formatDollars(number1);
number2 = formatDollars(number2);
document.getElementById('displayStockName2').innerHTML = `S&P 500 <p>Latest Price ${number2}</p>`;
document.getElementById('displayStockName').innerHTML = `QQQ <p>Latest Price ${number1}</p>`;

getLast52WeekClose('QQQ').then(prices => {
console.log(prices); // latest 52-week prices

// Array to hold months 
const months = getMonths();

// Replace numeric labels with month names
const labels = Array.from({ length: 50 }, (_, i) => (i % 4 === 0 ? months[Math.floor(i / 4)] : ''));

// Calculate the starting y-axis value to the nearest 10th
const minY = Math.floor(Math.min(...prices) / 10) * 10;

// Animation for Chart 1
const ctx1 = document.getElementById('stockChart1').getContext('2d');

// Simulated data for stock prices
const stockData1 = {
  labels: labels, // Use month names
  datasets: [
    {
      label: 'Stock Price2',
      data: prices, // Actual data
      borderColor: 'green', // Initial color
      borderWidth: 3, // Set line width
      borderJoinStyle: 'round', // Soften the edges
      fill: false,
      pointRadius: 0, // Make data points invisible
    },
  ],
};

// Modify the line color based on data points
const data1 = stockData1.datasets[0].data;

if (data1[0] > data1[data1.length - 1]) {
  stockData1.datasets[0].borderColor = 'red';
}

const stockChart1 = createChart(stockData1, ctx1, minY);

// Set the horizontal grid lines to 10% opacity
stockChart1.options.scales.y.grid.color = 'rgba(255, 255, 255, 0.1)';
stockChart1.update();
});


// ###############################################################################################################
// //deafault chart 
getLast52WeekClose('SPY').then(prices => {
  console.log(prices); // latest 52-week prices

  // Array to hold months 
  const months = getMonths();


  // Replace numeric labels with month names
  const labels = Array.from({ length: 50 }, (_, i) => (i % 4 === 0 ? months[Math.floor(i / 4)] : ''));

  // Calculate the starting y-axis value to the nearest 10th
  const minY = Math.floor(Math.min(...prices) / 10) * 10;

  // ANIMATION FOR CHART 1
  const ctx = document.getElementById('stockChart2').getContext('2d');

  // Simulated data for stock prices
  const stockData = {
    labels: labels, // Use month names
    datasets: [
      {
        label: 'SPY',
        data: prices, // Actual data
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

  if( data[0] > data[data.length - 1] ) {
    stockData.datasets[0].borderColor = 'red';
    console.log("Dataset: beginning" + data[0] + " end of dataset")
    console.log("All data:  " + data)
  }


  // Create the chart
  const stockChart = createChart(stockData, ctx, minY);

  // Set the horizontal grid lines to 10% opacity
  stockChart.options.scales.y.grid.color = 'rgba(255, 255, 255, 0.1)';
  stockChart.update();
});

// ###############################################################################################################


//Sticky nav bar
window.addEventListener('scroll', fixNav)