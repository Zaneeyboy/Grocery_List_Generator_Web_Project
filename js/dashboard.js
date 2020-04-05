//using jshint esversion:6;


//listen for auth status changes
auth.onAuthStateChanged(user => {
  if (user) { //user should  be able to acces this page if logged in and should be able to see recipeList and their grocery List
    db.collection("recipeList").onSnapshot(snapshot=>{ //get recipeList
      
      makeRecipeList(snapshot.docs);//render list

      //set up the user's recipe collection
      //set up the user's grocery list collection

      setupUI(user);//conditionally render UI
    },err=>{
      console.log(err.message);
    });
  } else {
      setupUI();
      console.log("Logged Out");
  }
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

let database = [];
const makeRecipeList = (data) => {

  if (data.length) {
    data.forEach(doc => {
      let item = doc.data();
      if (item.name.includes("&")) {
        while (item.name.includes("&")) {
          item.name = item.name.replace("&", "and");
        }
      }
      database.push(item);
      addToRecipeList(item.name); //Adding item to recipeList dropdown
    });
  } else {
    console.log("Error occurred while pulling from recipeList collection");
  }

  setRecipe(database[0]);
}


function setRecipe(data) { //Adds a recipe's data by creating html elements and rendering them to the page
  mealImg.src = data.url;
  mealTitle.innerHTML = data.name;
  mealDescription.innerHTML = data.description;
  removeIngredientsAndSteps();
  data.ingredients.forEach(ing => {
    let p = document.createElement("p");
    p.classList.add("card-text");
    p.innerHTML = ing;
    ingredients.appendChild(p);
  });
  data.method.forEach(meth => {
    let s = document.createElement("p");
    s.classList.add("card-text");
    s.innerHTML = meth;
    steps.appendChild(s);
  });
}

function removeIngredientsAndSteps() { //clears ingredient and step elements from the page to make way for another recipe's data

  var child = ingredients.lastElementChild;//get last child
  while (child) {
    ingredients.removeChild(child);
    child = ingredients.lastElementChild;
  }
  child = steps.lastElementChild;
  while (child) {
    steps.removeChild(child);
    child = steps.lastElementChild;
  }
}

const addToRecipeList = (name) => {
  let liTag = document.createElement("li");
  liTag.classList.add("list-group-item");
  liTag.innerHTML = name;
  liTag.addEventListener("click", () => {
    var itemName = liTag.innerHTML;
    let pos = binarySearch(itemName, database);
    setRecipe(database[pos]);
  });
  recipeList.appendChild(liTag);
}


//This function finds the name of the recipe in the database and returns the index
function binarySearch(value, database) {
  let first = 0;    //left endpoint
  let last = database.length - 1;   //right endpoint
  let position = -1;
  let found = false;
  let middle;

  while (found === false && first <= last) {
    middle = Math.floor((first + last) / 2);
    if (value.localeCompare(database[middle].name) === 0) {
      found = true;
      position = middle;
    } else if (value.localeCompare(database[middle].name) === -1) {  //if in lower half
      last = middle - 1;
    } else {  //in in upper half
      first = middle + 1;
    }
  }
  return position;
}