//using jshint:esversion:9

//get data
db.collection("groceryList").get().then(snapshot=>{
    console.log(snapshot.docs);
    //setUpGuides(snapshot.docs);
});


//listen for auth status changes
auth.onAuthStateChanged(user=>{
    if(user){
        console.log("user logged in:",user);
    }
    else{
        console.log("user logged out");
    }
});

//signup
const signupForm = document.querySelector("#signup-form");
signupForm.addEventListener("submit",(e)=>{
    e.preventDefault();

    //get user info
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;
    
    
    //signup user
    auth.createUserWithEmailAndPassword(email,password).then(cred=>{
        //console.log(cred.user);
        const modal=document.querySelector("#signupModal");
        signupForm.reset();

        //programmatically close modal somehow fml
        //modal('toggle');
    });
});

//logout method
const logout = document.querySelector("#logout-link");
logout.addEventListener("click",(e)=>{
    e.preventDefault();
    auth.signOut();
});

//login method
const loginForm = document.querySelector("#login-form");
loginForm.addEventListener("submit",(e)=>{
    e.preventDefault();

    //get user info
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    //log user in
    auth.signInWithEmailAndPassword(email,password).then(cred=>{
        const modal = document.querySelector("#loginModal");
        loginForm.reset();

        //programmatically close login modal fml
    });
});