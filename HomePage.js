// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, set, ref, get } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Import individual functions directly
import { getLast52WeekClose, getCurrentPrice, formatDollars, getCurrentDateString, getEmailUsername, getMonths, createChart } from './stocksAPI.js';

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



//Sticky nav bar
const nav = document.querySelector('.nav')
window.addEventListener('scroll', fixNav)

function fixNav() {
    if(window.scrollY > nav.offsetHeight + 150) {
        nav.classList.add('active')
    } else {
        nav.classList.remove('active')
    }
}


// Get the container element where the animation will be displayed
const container = document.querySelector(".lottie-container");

// Load the Lottie animation from the provided URL
lottie.loadAnimation({
  container: container, // Specify the container element
  renderer: "svg", // Choose the renderer (svg, canvas, html)
  loop: true, // Set animation loop
  autoplay: true, //  play automatically
  path: "https://lottie.host/2595c90d-3cb9-469e-bb9f-1395780129e4/FCyy7xrA48.json", // Provide the URL of the animation JSON
});



// const toggle = document.getElementById('toggle')
// const nav2 = document.getElementById('.sideBar')

// toggle.addEventListener('click', () => nav2.classList.toggle('active'))



async function sellButtonClickHandler(ticker, shares, currentPrice){
  localStorage.setItem('sellTicker', ticker);
  localStorage.setItem('SharesAvail', shares);
  localStorage.setItem('sellCurrentPrice', currentPrice);

  console.log('selling ' + ticker + 'shares availabe' + shares);
  window.location.href = 'stockSell.html';
}


// //The following code is used to get the current price for a given ticker:

// import axios from 'axios';


async function displayUserInfo(assetData) {
  //table to display user's stocks
  const table = document.getElementById('scrolling-container');
  var totalValue = 0;
  for (let i = 0; i < assetData.length; i++) {
    if (assetData[i].asset === "$") {
      document.getElementById("dollarAmount").innerText = formatDollars(Math.floor(assetData[i].amount));
      localStorage.setItem('buyingPower', assetData[i].amount);
      totalValue += assetData[i].amount;
      console.log("total value: after cash added" + totalValue);
    } else {
      // Here, you can directly await the result of getCurrentPrice
      try {
        let currentPrice = await getCurrentPrice(assetData[i].asset);
        console.log(currentPrice + " this is the current price");

        const row = document.createElement('tr');

        // Create and append the first column (Stocks) with the specified ID
        const stocksColumn = document.createElement('td');
        stocksColumn.id = 'stockTicker' + i;
        stocksColumn.textContent = assetData[i].asset;
        row.appendChild(stocksColumn);

        // Create and append the second column (Current Price) with the specified ID
        const priceColumn = document.createElement('td');
        priceColumn.id = 'currentPrice' + i;
        priceColumn.textContent = formatDollars(currentPrice);
        row.appendChild(priceColumn);

        // Create and append the third column (Shares) with the specified ID
        const sharesColumn = document.createElement('td');
        sharesColumn.id = 'shares' + i;
        sharesColumn.textContent = assetData[i].amount;
        row.appendChild(sharesColumn);

        // Create and append the fourth column (Total Value) with the specified ID
        const totalValueColumn = document.createElement('td');
        totalValueColumn.id = 'totalValue' + i;
        totalValueColumn.textContent = formatDollars(assetData[i].amount*currentPrice);
        console.log(totalValue + " before we add stock price");
        totalValue = totalValue + assetData[i].amount*currentPrice;
        row.appendChild(totalValueColumn);

        const sellButtonRow = document.createElement('td');
        const sellButton = document.createElement('button');
        sellButton.className = 'sellButton';
        sellButton.id = 'sellButton' + i;
        sellButton.textContent = "SELL SHARES";

        sellButton.addEventListener('click', () => {
          sellButtonClickHandler(assetData[i].asset, assetData[i].amount, currentPrice) 
        });
        sellButtonRow.appendChild(sellButton);
        row.appendChild(sellButtonRow);


        // Append the row to the table
        table.appendChild(row);

      } catch (error) {
        console.error(error);
      }
    }
    document.getElementById('totalValue').innerText = formatDollars(Math.floor(totalValue));
  }
  if(assetData.length == 1){
    const heading = document.createElement('h1');
    heading.innerText = "You don't own any stocks";
    table.appendChild(heading);
  }
}


const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
const loggedIn = localStorage.getItem('loggedIn');

if (loggedInUser) {
  // You can access user properties, such as email, UID, etc.
  let userEmail = loggedInUser.email;
  const userUID = loggedInUser.uid;

    //new user set initial properties for database table/node user_assets
    if(loggedIn == "false"){
      localStorage.setItem('loggedIn', true);
      console.log("logged In status is false");
      const assetData = [
        {
          asset: "$",
          amount: 1000000
        }
      ];
      
      set(ref(database, 'user_assets/' + userUID), {
        assets: assetData
      })
      displayUserInfo(assetData);
      localStorage.setItem('buyingPower', 1000000);
    }
    else{
      // Reference to the user's assets
      const assetsRef = ref(database, 'user_assets/' + userUID + '/assets');

      // Fetch the data
      get(assetsRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const assetData = snapshot.val();
            console.log("user's " + userUID + " asset data:   " + assetData);
            // Do something with assetData, which will be an array
            displayUserInfo(assetData);
          } else {
            console.log("No data available for this user");
          }
        })
        .catch((error) => {
          console.error("Error fetching asset data:", error);
        });
    }
  // Use the user information to personalize the dashboard content or perform actions.
  // For example, display the user's email on the dashboard.
  document.getElementById('currentDate').innerText = getCurrentDateString();

} else {
  console.log("logged in user is not found in local storage. Please");
  // Handle the case where no user information is found (user not logged in)
  // You can redirect the user back to the login page or take appropriate action.
}


getLast52WeekClose('SPY').then(prices => {
  console.log(prices); // latest 52 week prices
  // ANIMATION FOR CHART 1 
  const ctx = document.getElementById('stockChart1').getContext('2d');
  // Simulated data for stock prices

  const months = getMonths();

   // Replace numeric labels with month names
   const labels = Array.from({ length: 50 }, (_, i) => (i % 4 === 0 ? months[Math.floor(i / 4)] : ''));
    
   // Calculate the starting y-axis value to the nearest 10th
   const minY = Math.floor(Math.min(...prices) / 10) * 10;
 
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
 
   if (data[data.length - 1] < data[0]) {
     stockData.datasets[0].borderColor = 'red';
   } else {
     stockData.datasets[0].borderColor = 'green';
   }
 

   // Create the chart createChart(stockData, ctx, minY)
   const stockChart = createChart(stockData, ctx, minY);
 
   // Set the horizontal grid lines to 10% opacity
   stockChart.options.scales.y.grid.color = 'rgba(255, 255, 255, 0.1)';
   stockChart.update();
  });





getLast52WeekClose('QQQ').then(prices => {
  console.log(prices); // latest 52 week prices
  //Animation for Chart 2
  const ctx1 = document.getElementById('stockChart2').getContext('2d');
  

  const months = getMonths();
   // Replace numeric labels with month names
   const labels = Array.from({ length: 50 }, (_, i) => (i % 4 === 0 ? months[Math.floor(i / 4)] : ''));
    
   // Calculate the starting y-axis value to the nearest 10th
   const minY = Math.floor(Math.min(...prices) / 10) * 10;
 
   // Simulated data for stock prices
   const stockData = {
     labels: labels, // Use month names
     datasets: [
       {
         label: 'QQQ',
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
   const stockChart = createChart(stockData, ctx1, minY);
 
   // Set the horizontal grid lines to 10% opacity
   stockChart.options.scales.y.grid.color = 'rgba(255, 255, 255, 0.1)';
   stockChart.update();
});

//scroll-animation
// Trigger the CSS animation on initial page load
window.addEventListener('load', () => {
  animateTableRows();
});
const table = document.querySelector('.stockList');

table.addEventListener('scroll', animateTableRows);
// Add a listener for scrolling
window.addEventListener('scroll', () => {
  animateTableRows();
});

const tableTop = table.getBoundingClientRect().top;


// Function to trigger the animation
function animateTableRows() {
  const tableRows = document.querySelectorAll('#scrolling-container tr');
  const triggerBottom = window.innerHeight  / 5 * 4;

  tableRows.forEach(row => {
      const rowTop = row.getBoundingClientRect().top;

      if (rowTop < triggerBottom) {
          row.classList.add('animate');
      } else {
          row.classList.remove('animate');
      }
  });
}