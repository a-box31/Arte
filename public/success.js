//First Javascript implementation
import Cart from "/cart.js";

//Adds an event listener for when the webpage is finished loading
if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", ready);
    //if it is not loading then proceed to run the script
} else {
    ready();
}

function ready() {
    let cart = new Cart();
    cart.checkout();
}
