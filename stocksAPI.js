// Function 1
function calculateAverage(numbers) {
  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / numbers.length;
}

// Function 2
function isEven(number) {
  return number % 2 === 0;
}

// Function 3
async function getLast52WeekClose(ticker) {
  const API_KEY = 'OBjYxQg3fHK1g96r1wfepOixWNovCA6I';
  const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?apikey=${API_KEY}`;

  try {
    const response = await axios.get(url);
    const historicalData = response.data.historical;

    // Sort the data by date in ascending order
    historicalData.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Extract the closing prices for the last 52 weeks
    const last52WeekClose = historicalData
      .slice(-52)
      .map(day => day.adjClose);

    return last52WeekClose;
  } catch (error) {
    console.error(error);
  }
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


// Export multiple functions using an object
export { calculateAverage, getCurrentPrice, getLast52WeekClose };