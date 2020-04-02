

/*
const setUpGuides = (data)=>{
    let html='';
    data.forEach(doc=>{
        const guide = doc.data();
        console.log(guide);
        const li = `
        <li>
            <div class="collapsible-header">${guide.title}</div>
            <div class="collapsible-body">${guide.content}</div>
        </li>
        `;
        html+=li;
    })
    guideList.innerHTML = html;
}
*/


//Render groceryLists to screen somewhere fml
const fetchGroceryLists=(data)=>{

    if(data.length){
    data.forEach(doc=>{
        console.log(doc.data());
    });
    }
    else{
        console.log("Login to view grocery lists");
    }
}


const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");

const setupUI = (user)=>{
    if(user){
        //toggle UI elements
        loggedInLinks.forEach(item=>item.style.display="block");
        loggedOutLinks.forEach(item => item.style.display = "none");
    }
    else{
        //toggle UI elements
        loggedInLinks.forEach(item => item.style.display = "none");
        loggedOutLinks.forEach(item => item.style.display = "block");
    }
}