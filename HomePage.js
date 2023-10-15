
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

function getEmailUsername(email) {
  const index = email.indexOf('@');
  if (index === -1) {
    return email; 
  }

  return email.substring(0, index);
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


function getLastTwelveMonths() {

  const monthNames = ["January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"];
  
  const d = new Date();
  const thisMonth = d.getMonth();

  const months = [];

  for (let i = 0; i < 12; i++) {
    const index = (thisMonth - i + 12) % 12;
    months.unshift(monthNames[index]);
  }

  return months;

}


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

function getCurrentDateString() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based
  const day = String(currentDate.getDate()).padStart(2, '0');
  
  // Create a string in the format YYYY-MM-DD (e.g., "2023-10-09")
  const dateString = `${year}-${month}-${day}`;
  
  return dateString;
}

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

async function sellButtonClickHandler(ticker, shares, currentPrice){
  localStorage.setItem('sellTicker', ticker);
  localStorage.setItem('SharesAvail', shares);
  localStorage.setItem('sellCurrentPrice', currentPrice);

  console.log('selling ' + ticker + 'shares availabk' + shares);
  window.location.href = 'stockSell.html';
}


// //The following code is used to get the current price for a given ticker:

// import axios from 'axios';


async function getCurrentPrice(ticker) {
  const API_KEY = 'EN3735MN44LA7F35';
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`;
  
  try {
    const response = await axios.get(url);
    console.log(response.data);
    const price = response.data['Global Quote']['05. price'];
    console.log(price);
    return price;
  } catch (error) {
    console.error(error);
    throw error; // Re-throw the error to handle it elsewhere if needed
  }
}

async function displayUserInfo(assetData) {
  //table to display user's stocks
  const table = document.getElementById('stockList');
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
  userEmail = getEmailUsername(userEmail);
  const element = document.getElementById('displayEmail');

  // Change the color 
  element.style.color = "#0dff00";
  document.getElementById('displayEmail').innerHTML = "<a>Hello,  " + userEmail + "</a>";
  document.getElementById('currentDate').innerText = getCurrentDateString();

} else {
  console.log("logged in user is not found in local storage. Please");
  // Handle the case where no user information is found (user not logged in)
  // You can redirect the user back to the login page or take appropriate action.
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


getLast52WeekClose('SPY').then(prices => {
  console.log(prices); // latest 52 week prices
  // ANIMATION FOR CHART 1 
  const ctx = document.getElementById('stockChart1').getContext('2d');
  // Simulated data for stock prices
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
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
 
   if (data[data.length - 1] < data[data.length - 2]) {
     stockData.datasets[0].borderColor = 'red';
   } else {
     stockData.datasets[0].borderColor = 'green';
   }
 
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





getLast52WeekClose('QQQ').then(prices => {
  console.log(prices); // latest 52 week prices
  //Animation for Chart 2
  const ctx1 = document.getElementById('stockChart2').getContext('2d');
  
  // Simulated data for stock prices
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
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
 
   if (data[data.length - 1] < data[data.length - 2]) {
     stockData.datasets[0].borderColor = 'red';
   } else {
     stockData.datasets[0].borderColor = 'green';
   }
 
   // Create the chart
   const stockChart = new Chart(ctx1, {
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