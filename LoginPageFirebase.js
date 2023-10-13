// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, set, ref } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
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

console.log('Running LoginPageFirebase.js');

let signUp = document.getElementById("signUp");
// signUp.addEventListener('click', (e) =>{
//     var email = document.getElementById('email').value;
//     var password = document.getElementById('password').value;
//     createUserWithEmailAndPassword(auth, email, password)
//     .then((userCredential) => {
//         // Signed up 
//          console.log('creates user');
//         const user = userCredential.user;

//         set(ref(database, 'users/' + user.uid), {
//             email: email,
//             password:password
//         })
//         console.log('Should\'ve set user in database')
//         localStorage.setItem('loggedInUser', JSON.stringify(user));
//         localStorage.setItem('loggedIn', false);
//         //User has been created successfully
//         window.location.href = "HomePage.html";
//         // ...
//     })
//     .catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//         alert('Error mesage' + errorMessage + errorCode);
//         // ..
//     });
    
// })
signUp.addEventListener('click', async (e) => {
    e.preventDefault();

    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    try {
        // Create the user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Set user data in the database
        await set(ref(database, 'users/' + user.uid), {
            email: email,
            password: password
        });

        // Both user authentication and database write were successful
        console.log('User created and data set in the database');

        localStorage.setItem('loggedInUser', JSON.stringify(user));
        localStorage.setItem('loggedIn', false);

        // User has been created successfully and database is updated,
        // now navigate to the new homepage
        window.location.href = "HomePage.html";
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert('Error message: ' + errorMessage + ' (' + errorCode + ')');
    }
});



let login = document.getElementById('login');
login.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log(user);
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        localStorage.setItem('loggedIn', true);

        window.location.href = "HomePage.html";

    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert('Error message: ' + errorMessage + ' (' + errorCode + ')');
    });
});


// const user = auth.currentUser;
// onAuthStateChanged(auth, (user) => {
//     if (user) {
//     // User is signed in, see docs for a list of available properties
//     // https://firebase.google.com/docs/reference/js/auth.user
//     const uid = user.uid;
//     // ...
//     } else {
//     // User is signed out
//     // ...
//     }
// });

// logout = document.getElementById('logout');
// logout.addEventListener('click', () =>{

//     signOut(auth).then(() => {
//         // Sign-out successful.
//         alert('user logged out');
//       }).catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//         alert('Error mesage' + errorMessage + errorCode);
//         // An error happened.
//       });
// })