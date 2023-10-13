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


const tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "BRK.B", "LLY", "V", "UNH", "TSM", "XOM", "WMT", "JPM", "NVO", "JNJ", "MA", "AVGO", "PG", "CVX", "ORCL", "HD", "MRK", "ABBV", "COST", "ADBE", "TM", "ASML", "KO"];

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

    // Convert input to string
    let strAmount = amount.toString();
  
    // Split on decimal to get whole and decimal parts
    let [whole, decimal] = strAmount.split(".");
  
    // Add commas to whole part
    whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
    // If there is a decimal part, re-add decimal point and decimal
    if (decimal) {
      strAmount = `${whole}.${decimal}`;
    } else {
      strAmount = whole;
    }
  
    // Add dollar sign and return
    return "$" + strAmount; 
  
}

function handleBuyBtnClick(stockIndex, stockTicker) {
    localStorage.setItem("buyBtn", stockTicker);
    window.location.href = "stockPurchase.html";
}

//The following code is used to get the current price for a given ticker:
async function getCurrentPrice(ticker) {
  const API_KEY = 'EN3735MN44LA7F35';
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`;
  
  try {
    const response = await axios.get(url);
    console.log(response.data);
    const price = response.data['Global Quote']['05. price'];
    return price;
  } catch (error) {
    console.error(error);
    throw error; // Re-throw the error to handle it elsewhere if needed
  }
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

    for (let i = 0; i < tickers.length; i++) {
        const ticker = tickers[i];
        
        const row = document.createElement("tr");
    
        const tickerTd = document.createElement("td");
        tickerTd.id = "ticker" + i;
        tickerTd.textContent = ticker;
    
        const priceTd = document.createElement("td");
        priceTd.id = "currentPrice" + i;
        // add current price dynamically 
        let number = await getCurrentPrice(ticker);
        priceTd.textContent = formatDollars(number);

        const purchaseTd = document.createElement("td");
        purchaseTd.id = "purchase" + i;
        
        const purchaseBtn = document.createElement("button");
        purchaseBtn.id = "buyButton" + i;
        purchaseBtn.textContent = "Buy";
        purchaseTd.appendChild(purchaseBtn);
        purchaseBtn.addEventListener("click", function() {
            handleBuyBtnClick(i, ticker);  
          });
    
        row.appendChild(tickerTd);
        row.appendChild(priceTd); 
        row.appendChild(purchaseTd);
    
        table.appendChild(row);
    }
}

const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
const loggedIn = localStorage.getItem('loggedIn');

if (loggedInUser) {
  // You can access user properties, such as email, UID, etc.
  const userEmail = loggedInUser.email;
  const userUID = loggedInUser.uid;
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
  document.getElementById('displayEmail').innerText = "Hello:  " + userEmail;
  document.getElementById('currentDate').innerText = getCurrentDateString();

} else {
  console.log("logged in user is not found in local storage. Please");
  // Handle the case where no user information is found (user not logged in)
  // You can redirect the user back to the login page or take appropriate action.
}