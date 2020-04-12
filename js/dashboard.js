//using jshint esversion:6;


//listen for auth status changes
let userID;
auth.onAuthStateChanged(user => {
  if (user) { //user should  be able to acces this page if logged in and should be able to see recipeList and their grocery List
    userID=user.uid;
    setupUI(user);//conditionally render UI
    setUpYourRecipeList(userID);//pulls recipes from yourRecipes collection in firestore and renders to the screen
    loadYourIngredients(userID);////pulls ingredients owned by users from firestore for a recipe that the user has in their list and renders them to the screen
    //loadYourGroceryList(userID);
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

//getting elements from dashboard page
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
  liTag.classList.add("hand-icon");
  liTag.innerHTML = name;
  liTag.addEventListener("click", () => {//when item is clicked, the information regarding the rcipe is rendered to the screen
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
  removeAddToRecipesButton();//clears previously rendered button from the dom 

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
     }
     if(!flag){//recipe not yet added to list so it will be written to firebase collection
     db.collection("users").doc(userID).collection("yourRecipes").doc().set({
       name:database[pos].name,
       ingredients:database[pos].ingredients,
       quantity:1,
       steps:database[pos].method,
       description: database[pos].description
     });

       db.collection("users").doc(userID).collection("yourGroceryList").doc(database[pos].name).set({
         name: database[pos].name,
         ingredients: database[pos].ingredients
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
  db.collection("users").doc(userID).collection("yourRecipes").orderBy("name").onSnapshot(snapshot => {//gets a snapshot of the collection
     let changes = snapshot.docChanges();

     changes.forEach(change=>{
       if (change.type == "added") {//gets change type and renders element to the page if type is added
         //create element and render to the screen
         addRecipe(change.doc, userID);
         populateAllIngredients(change.doc,userID);
       }
       // else if (change.type == "removed") {//gets change type and removes element to the page if type is removed
      //    let li = yourRecipes.querySelector("[data-id=" + change.doc.id + "]");
      //    yourRecipes.removeChild(li);

      // }
    });
  });
}

const addRecipe = (doc,userID)=>{//adds a recipe to the your recipes section of the page

  let liTag = document.createElement("li");
  liTag.classList.add("list-group-item");
  liTag.setAttribute("data-id", doc.id);//setting id to id of document in firebase

  let deleteButton = document.createElement("button");//when clicked will remove item from list
  deleteButton.innerHTML = "&times";
  deleteButton.classList.add("close");

  //deleting li from list
  deleteButton.addEventListener("click", (e) => {//onclick event triggers removal of item from dom and firebase collection
    e.stopPropagation();
    let id = e.target.parentElement.getAttribute("data-id");
    db.collection("users").doc(userID).collection("yourRecipes").doc(id).delete();//deleted item from yourRecipes collection
    let li = yourRecipes.querySelector("[data-id=" + id + "]");
    yourRecipes.removeChild(li);

    //need to put code here to remove ingredients from ingredient list when deleted
    let item = allIngredientsList.querySelector("[data-id="+id+"]");
    allIngredientsList.removeChild(item);

     db.collection("users").doc(userID).collection("yourIngredients").where("id","==",id).get().then(snapshot=>{
      snapshot.docs.forEach(doc=>{
        db.collection("users").doc(userID).collection("yourIngredients").doc(doc.id).delete();
      });
    });

    db.collection("users").doc(userID).collection("yourGroceryList").doc(doc.data().name).delete();
  });

  let text = document.createElement("span");
  text.innerHTML = doc.data().name;

  liTag.appendChild(deleteButton);
  liTag.appendChild(text);

  yourRecipes.appendChild(liTag);

}

const yourIngredientsList = document.querySelector("#yourIngredientsList");
const allIngredientsList = document.querySelector("#allIngredientsList");

function populateAllIngredients(doc,userID){
  let liTag = document.createElement("li");
  liTag.classList.add("list-group-item");
  liTag.setAttribute("data-id", doc.id);//setting id to id of document in firebase

  let recipeName = document.createElement("h5");
  recipeName.innerHTML = doc.data().name;
  recipeName.classList.add("card-title");
  recipeName.classList.add("recipe-name");

  liTag.appendChild(recipeName);
  
  let ul = document.createElement("ul");
  ul.classList.add("list-group");
  ul.classList.add("list-group-flush");

  liTag.appendChild(ul);

  doc.data().ingredients.forEach(ing=>{
    //Creates tags for ingredient name and button for adding ingredient to firebase collection
    let p = document.createElement("span");
    p.innerHTML = ing;

    let li=document.createElement("li");
    li.classList.add("list-group-item");

    let i = document.createElement("i");
    i.classList.add("fas");
    i.classList.add("fa-plus-circle");

    i.addEventListener("click", (e) => {//when clicked adds the ingredient to  the yourIngredients collection
      e.preventDefault();    
      // // Creates reference to firestore and creates new doc with id from yourRecipeList
      db.collection("users").doc(userID).collection("yourIngredients").doc().set({
        id:doc.id,
        name:doc.data().name,
        ingredient:ing
      });

      db.collection('users').doc(userID).collection("yourGroceryList").doc(doc.data().name).update({
        ingredients: firebase.firestore.FieldValue.arrayRemove(ing)
      });
    });

    //Appending children tags of Ingredient data to parent element
    li.appendChild(i);
    li.appendChild(p);
    ul.appendChild(li);
  });
  
  //Appending children tag of recipe and it's ingredients to parent element
  allIngredientsList.appendChild(liTag);
}

const loadYourIngredients=(uid)=>{
 db.collection("users").doc(uid).collection("yourIngredients").orderBy("name").onSnapshot(snapshot=>{
   let changes=snapshot.docChanges();

   changes.forEach(change => {
     if (change.type == "added") {//gets change type and renders element to the page if type is added
       //create element and render to the screen
        populateYourIngredients(change.doc,uid); //creates elements to render recipe ingredients to the screen

     }
     if(change.type=="removed"){
       let item = yourIngredientsList.querySelector("[data-id=" + change.doc.id + "]");
       yourIngredientsList.removeChild(item);
     }
   });
 });
}

const populateYourIngredients = (doc,uid)=>{//takes data pulled from firebase youIngredients collection and renders this to the dom

  let liTag = document.createElement("li");
  liTag.classList.add("list-group-item");
  liTag.setAttribute("data-id", doc.id);//setting id to id of document in firebase

  let p = document.createElement("span");
  p.innerHTML =doc.data().ingredient;

  let div = document.createElement("div");
  div.classList.add("list-group-item");

  let i = document.createElement("i");
  i.classList.add("fas");
  i.classList.add("fa-minus-circle");

  i.addEventListener("click",(e)=>{
    e.preventDefault();
    db.collection("users").doc(uid).collection("yourIngredients").doc(doc.id).delete();

    db.collection('users').doc(userID).collection("yourGroceryList").doc(doc.data().name).update({
      ingredients: firebase.firestore.FieldValue.arrayUnion(doc.data().ingredient)
    });
  });

  div.appendChild(i);
  div.appendChild(p);
  liTag.appendChild(div);
  // //Appending children tag of recipe and it's ingredients to parent element
   yourIngredientsList.appendChild(liTag);
}

let generateButton = document.querySelector("#generategroceryList");
let yourGroceryList = document.querySelector("#yourGroceryList");
generateButton.addEventListener("click",()=>{
  db.collection("users").doc(userID).collection("yourGroceryList").get().then((doc)=>{
    if(doc.empty){
    console.log("Document does not exist");
    alert("You need to add recipes to your list before you generate your grocery list");
    }
    else{
      doc.forEach(item=>{
        console.log(item.data());
        populateModal(item);
      });
    }
  }).catch(e=>{
    console.log(e.message);
  });

});

function populateModal(doc){
  doc.data().ingredients.forEach(ing=>{
    let liTag = document.createElement("li");
    liTag.classList.add("list-group-item");
    liTag.innerHTML = ing;

    yourGroceryList.appendChild(liTag);
  });
}

const logoutButton = document.querySelector("#logout-button");
logoutButton.addEventListener("click", () => {
  auth.signOut();
});