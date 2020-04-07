//using jshint esversion:6;


//listen for auth status changes
let userID;
auth.onAuthStateChanged(user => {
  if (user) { //user should  be able to acces this page if logged in and should be able to see recipeList and their grocery List
    userID=user.uid;
    setupUI(user);//conditionally render UI
    setUpYourRecipeList(userID);
    loadYourIngredients(userID);
    loadYourGroceryList(userID);
    db.collection("recipeList").onSnapshot(snapshot=>{ //get recipeList
      makeRecipeList(snapshot.docs);//render list
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
logout.addEventListener("click", () => {
  auth.signOut();
});


const recipeList = document.querySelector("#recipe-list");
const mealImg = document.querySelector("#meal-img");
const mealTitle = document.querySelector("#meal-title");
const mealDescription = document.querySelector("#meal-description");
const ingredients = document.querySelector("#ingredients");
const steps = document.querySelector("#steps");
const button = document.querySelector("#add-button");

let database = [];

const makeRecipeList = (data) => { //creates recipe list
  if (data.length) { //makes sure the database has at least 1 element
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
  } 
  else { //means firebase database was empty
    console.log("Error occurred while pulling from recipeList collection");
  }
  setRecipe(database[0]); //default recipe rendered when page is first loaded
}

//adds all recipes to list of recipes
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

function setRecipe(data) { //Renders a recipe's data by creating html elements and rendering them to the page
  mealImg.src = data.url; //image for cover
  mealTitle.innerHTML = data.name;
  mealDescription.innerHTML = data.description;
  let pos = binarySearch(data.name,database);

  removeIngredientsAndSteps(); //clears ingredients and steps so another recipe can be rendered to the page
  removeAddToRecipesButton();

  let btn = document.createElement("button");
  btn.classList.add("btn");
  btn.classList.add("btn-outline-primary");
  btn.innerText = "Add to your recipe list";
  button.appendChild(btn);

    btn.addEventListener("click",()=>{//adds item to user's recipe collection from button click
     //put flag here to ensure only one of each recipe was added to the list
     let flag=false;
     if(yourRecipes.firstElementChild){
       for (x = 0; x < yourRecipes.children.length; x++) {
         if (yourRecipes.children[x].innerText.includes(data.name)){ flag=true};
       }
       debugger
     }
     if(!flag){
     db.collection("users").doc(userID).collection("yourRecipes").doc().set({
       name:database[pos].name,
       ingredients:database[pos].ingredients,
       quantity:1,
       steps:database[pos].method,
       description: database[pos].description
     });
    }
    else{
      alert("Recipe has already been added to your list");
    }
   });

  data.ingredients.forEach(ing => { //renders each ingredient to the UI
    let p = document.createElement("p");
    p.classList.add("card-text");
    p.innerHTML = ing;
    ingredients.appendChild(p);
  });

  data.method.forEach(meth => { //renders each step to the UI
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

function removeAddToRecipesButton(){ //removes add to recipes button from the screen to make way for another recipe's button
  if(button.firstElementChild){
    button.removeChild(button.firstElementChild);
  }
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


const yourRecipes = document.querySelector("#your-recipe-list");
const yourRecipeFooter = document.querySelector("#your-recipe-footer");

//Gets Recipes from yourRecipes collection and renders them to the UI
const setUpYourRecipeList = (userID)=>{
  db.collection("users").doc(userID).collection("yourRecipes").orderBy("name").onSnapshot(snapshot => {
     let changes = snapshot.docChanges();

     changes.forEach(change=>{
       if (change.type == "added") {//gets change type and renders element to the page if type is added
         //create element and render to the screen
         addRecipe(change.doc, userID);
       }
       else if (change.type == "removed") {//gets change type and removes element to the page if type is removed
        //remove element from dom 
        let li = yourRecipes.querySelector("[data-id=" + change.doc.id + "]");
        yourRecipes.removeChild(li);
      }
    })
  });
}

const addRecipe = (doc,userID)=>{//adds a recipe to the your recipes section of the page
  

  //deleting li from list
  deleteButton.addEventListener("click", (e) => {
    e.stopPropagation();
    let id = e.target.parentElement.getAttribute("data-id");
    db.collection("users").doc(userID).collection("yourRecipes").doc(id).delete();
      let li = yourRecipes.querySelector("[data-id=" + id + "]");
      yourRecipes.removeChild(li);
  });

  let text = document.createElement("span");
  text.innerHTML = doc.data().name;

  liTag.appendChild(deleteButton);
  liTag.appendChild(text);

  yourRecipes.appendChild(liTag);
}

// const logoutButton = document.querySelector("#logout-btn");
// logoutButton.addEventListener("click",()=>{
//   auth.signOut();
// })

const yourIngredientsList = document.querySelector("#yourIngredientsList");
const yourGroceryList = document.querySelector("#yourGroceryList");

const loadYourIngredients=(uid)=>{
 db.collection("users").doc(uid).collection("yourIngredients").onSnapshot(snapshot=>{
   snapshot.forEach(doc=>{
     console.log(doc.data());

    

   });
 });
}

const loadYourGroceryList=(uid)=>{
  db.collection("users").doc(uid).collection("yourGroceryList").onSnapshot(snapshot=>{
    snapshot.forEach(doc=>{
      console.log(doc.data());
    })
  })
}