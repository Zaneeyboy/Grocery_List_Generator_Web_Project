
//listen for auth status changes
auth.onAuthStateChanged(user => {
  if (user) {
    //get data
    db.collection("recipeList").onSnapshot(snapshot => {

      //fetchGroceryLists(snapshot.docs);
      setupUI(user);
      console.log(snapshot.docs);
    }, err => {
      console.log(err.message);
    });
  } else {
    //fetchGroceryLists([]);
    console.log("Logged Out");
    setupUI();
  }
});

//signup
const signupForm = document.querySelector("#signup-form");
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //get user info
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;


  //signup user
  auth.createUserWithEmailAndPassword(email, password).then(cred => {
    return db.collection('users').doc(cred.user.uid).set({
      bio: signupForm['bio'].value
    });

  }).then(() => {
    const modal = document.querySelector("#signupModal");
    signupForm.reset();

    //programmatically close modal somehow fml
    //modal('toggle');
  });
});

//login method
const loginForm = document.querySelector("#login-form");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  //log user in
  auth.signInWithEmailAndPassword(email, password).then(cred => {
    const modal = document.querySelector("#loginModal");
    loginForm.reset();

    //programmatically close login modal fml
  });
});



//Setting up user interface
const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");
const userEmail = document.querySelector("#user-email");
const bio = document.querySelector("#user-bio");

const setupUI = (user) => {
  if (user) {
    db.collection('users').doc(user.uid).get().then(doc => {
      //account info
      const email = user.email;

      userEmail.innerHTML = "Logged in as : "+email;
      bio.innerHTML = doc.data().bio;
    });
    //toggle UI elements
    loggedInLinks.forEach(item => item.style.display = "block");
    loggedOutLinks.forEach(item => item.style.display = "none");
  } else {
    userEmail.innerHTML="";
    bio.innerHTML="";

    //toggle UI elements
    loggedInLinks.forEach(item => item.style.display = "none");
    loggedOutLinks.forEach(item => item.style.display = "block");
  }
}

//logout method
const logout = document.querySelector("#logout-link");
logout.addEventListener("click", (e) => {
  e.preventDefault();
  auth.signOut();
});
