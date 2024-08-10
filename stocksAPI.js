//////////////////////////////////////////////////////////HELPER FUNCTIONS///////////////////////////////////////////////////////////////////////
async function getLast52WeekClose(ticker) {
  const API_KEY = 'OBjYxQg3fHK1g96r1wfepOixWNovCA6I';
  const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?apikey=${API_KEY}`;

  try {
    const response = await axios.get(url);
    const historicalData = response.data.historical;

    // Sort the data by date in descending order (most recent first)
    historicalData.sort((a, b) => new Date(b.date) - new Date(a.date));

    const weeklyClosingPrices = [];
    let currentWeek = -1;

    for (const day of historicalData) {
      const date = new Date(day.date);
      const weekNumber = getWeekNumber(date);

      if (weekNumber !== currentWeek) {
        weeklyClosingPrices.unshift(day.adjClose);
        currentWeek = weekNumber;

        if (weeklyClosingPrices.length === 52) {
          break;
        }
      }
    }

    // If we don't have enough data for 52 weeks, pad the beginning with null
    while (weeklyClosingPrices.length < 52) {
      weeklyClosingPrices.unshift(null);
    }

    return weeklyClosingPrices;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Helper function to get the week number of a date for getLast52WeekClose
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}



async function getCurrentPrice(ticker) {
  const API_KEY = 'OBjYxQg3fHK1g96r1wfepOixWNovCA6I'; // Replace with your actual API key
  const url = `https://financialmodelingprep.com/api/v3/quote-short/${ticker}?apikey=${API_KEY}`;

  try {
    const response = await axios.get(url);
    
    // Assuming the API returns an array of objects, get the first one 
    const quoteData = response.data[0]; 
    
    if (quoteData) { // Check if quoteData exists
      return quoteData.price;
    } else {
      throw new Error(`No quote found for ticker: ${ticker}`); 
    }
  } catch (error) {
    console.error(error);
    throw error; // Re-throw the error to handle it elsewhere if needed
  }
}


function createChart(stockData, ctx, minY){
  return new Chart(ctx, {
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
}


function getMonths(){
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
  return months;
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

function getCurrentDateString() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based
  const day = String(currentDate.getDate()).padStart(2, '0');
  
  // Create a string in the format YYYY-MM-DD (e.g., "2023-10-09")
  const dateString = `${year}-${month}-${day}`;
  
  return dateString;
}


function getEmailUsername(email) {
  const index = email.indexOf('@');
  if (index === -1) {
    return email; 
  }
  return email.substring(0, index);
}

function fixNav() {
  const nav = document.querySelector('.nav')
  if(window.scrollY > nav.offsetHeight + 150) {
      nav.classList.add('active')
  } else {
      nav.classList.remove('active')
  }
}

// Export multiple functions using an object
export { getCurrentPrice, getLast52WeekClose, createChart, getMonths, formatDollars, getCurrentDateString, getEmailUsername, fixNav};