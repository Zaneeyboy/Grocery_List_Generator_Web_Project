//using jshint:esversion:6




//listen for auth status changes
auth.onAuthStateChanged(user => {
  if (user) {
    //get data
    db.collection("recipeList").onSnapshot(snapshot => {
      //setUpGuides(snapshot.docs);
      //fetchGroceryLists(snapshot.docs);
      setupUI(user);
      console.log(snapshot);
    }, err => {
      console.log(err.message);
    });
  } else {
    //fetchGroceryLists([]);
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

//logout method
const logout = document.querySelector("#logout-link");
logout.addEventListener("click", (e) => {
  e.preventDefault();
  auth.signOut();
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
