//using jshint esversion:6;


//listen for auth status changes
auth.onAuthStateChanged(user => {
  if (user) { //user should not be able to acces this page if logged in but should be able to see the recipeList
      setupUI(user);
      console.log(snapshot.docs);
  } else {

    //get data from recipeList collection
    db.collection("recipeList").onSnapshot(snapshot=>{
      makeRecipeList(snapshot.docs);
      setupUI();
      console.log("Logged Out");
    },err=>{
      console.log(err.message);
    });
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

      userEmail.innerHTML = "Logged in as : " + email;
      bio.innerHTML = doc.data().bio;
    });
    //toggle UI elements
    loggedInLinks.forEach(item => item.style.display = "block");
    loggedOutLinks.forEach(item => item.style.display = "none");
  } else {
    userEmail.innerHTML = "";
    bio.innerHTML = "";

    //toggle UI elements
    loggedInLinks.forEach(item => item.style.display = "none");
    loggedOutLinks.forEach(item => item.style.display = "block");
  }
};

//logout method
const logout = document.querySelector("#logout-link");
logout.addEventListener("click", (e) => {
  e.preventDefault();
  auth.signOut();
});


const recipeList = document.querySelector("#recipe-list");  
const mealImg = document.querySelector("#meal-img");
const mealTitle = document.querySelector("#meal-title");
const mealDescription = document.querySelector("#meal-description");
const ingredients = document.querySelector("#ingredients");
const steps = document.querySelector("#steps");

let database=[];
const makeRecipeList = (data) => {
  
  if (data.length) {
    data.forEach(doc => {
      database.push(doc.data());
      const dat = doc.data();
      addToRecipeList(dat.name); //Adding item to recipeList dropdown
    });
  } else {
    console.log("Error occurred while pulling from recipeList collection");
  }
  setRecipe(database[0]);
}


function setRecipe(data){
  mealImg.src=data.url;
  mealTitle.innerHTML=data.name;
  mealDescription.innerHTML=data.description;
  removeIngredientsAndSteps();
  data.ingredients.forEach(ing=>{
    let p = document.createElement("p");
    p.classList.add("card-text");
    p.innerHTML=ing;
    ingredients.appendChild(p);
  });
  data.method.forEach(meth=>{
    let s = document.createElement("p");
    s.classList.add("card-text");
    s.innerHTML=meth;
    steps.appendChild(s);
  });
  removeIngredientsAndSteps();
}

function removeIngredientsAndSteps(){

  var child = ingredients.lastElementChild;//get last child
  while (child) {
    ingredients.removeChild(child);
    child = ingredients.lastElementChild; 
  }
  child=steps.lastElementChild;
  while(child){
    steps.removeChild(child);
    child=steps.lastElementChild;
  }
}

const addToRecipeList=(name)=>{
  let liTag = document.createElement("li");
  liTag.classList.add("list-group-item");
  liTag.innerHTML=name;
  liTag.addEventListener("click",()=>{
    const itemName=liTag.innerHTML;
    console.log(itemName);
    //set it so that you pull data from the variable database and set the content to the screen on click
  });
  recipeList.appendChild(liTag);
}
