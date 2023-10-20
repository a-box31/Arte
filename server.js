//Express Server

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//process, environment keys
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
const PORT = 5000;


//requiring express into a express variable
const express = require("express");
//express function creates a sever
const app = express();
//json reading library
const fs = require("fs");
// stripe middleware for payment processing
const stripe = require("stripe")(stripeSecretKey);
// cross platform
const cors = require("cors");






// function declarations
async function createProduct( name , images, price ){
  try{
    const product = await stripe.products.create({
      name: name,
      images,
      default_price_data: {
        currency: 'usd',
        unit_amount: price
      }
    })
    return product;
  }catch( err ){
    console.log(err);
  }
}

async function getProducts(){
  try{  
    const products = await stripe.products.list({
      limit: 100
    });
    // console.log(products)
    return products
  }catch (err) {
    console.log(err);
  }
}

async function createCheckout( line_items ){
  try{
    return await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: 'http://localhost:5000/SUCCESS',
      cancel_url: 'http://localhost:5000/STORE'
    })
  }catch (err) {
    console.error(err);
  }
}





//view engine allows to embed server side code in the front end html pages
app.set("view engine", "ejs");
// we are now able to parse body element as a JSON object to access properties
app.use(express.json());
//app front end needs to be located as a static folder: now server shows the website
app.use(express.static("public"));

app.use( cors({origin: '*'}) )




// route the home page
app.get("/", function (req, res) {
  res.render("index.ejs")
});
// route the about page
app.get("/ABOUT", function (req, res) {
  //read the items json file, with an error function just in case
  res.render("about.ejs");
});
// route the FAQS page
app.get("/FAQS", function (req, res) {
  //read the items json file, with an error function just in case
  res.render("faqs.ejs");
});
// route the contacts page
app.get("/CONTACT", function (req, res) {
  //read the items json file, with an error function just in case
  res.render("contact.ejs");
});




app.get("/STORE", function (req, res) {

  // read the items json file, with an error function just in case
  fs.readFile("items.json", function (error, data) {
    if (error) {
      //internet server error then ends the response
      res.status(500).end();
    } else {

      //if no error render
      //ejs store so we can use the numbers from the server in the html
      //must save as an ejs to template
      res.render("store.ejs", {
        stripePublicKey: stripePublicKey,
        //get the jason info and send it to the page
        products: JSON.parse(data),
      });
    }
  });


});





app.get('/SUCCESS', function (req, res){
  res.render("success.ejs");
})


app.post("/purchase", function (req, res) {


  // get the official list of products with products ids and product price id
  // to validate the id and the price

  // read the items json file, with an error function just in case
  fs.readFile("items.json", function (error, data) {

    if (error) {
      //internet server error then ends the response
      res.status(500).end();
    } else {

      // create cart items for stripe checkout
      const line_items = [];

      const productsJson = JSON.parse(data);

      if( !productsJson || !productsJson.length ){
        return
      }

      // validate checkout items with the id
      req.body.items.forEach((checkoutItem) => {
        // look for checkout id in the products
        productsJson.forEach((product) => {
          if (product.id == checkoutItem.id) {
            // get the official price and quantity, and add to checkout list
            line_items.push({
              price_data: {
                product: product.id,
                unit_amount: product.price,
                currency: "usd",
              },
              quantity: checkoutItem.quantity,
            });  
          }

        });
      });

      createCheckout(line_items)
      .then( (session) => {
        // console.log(session)
        res.status(303)
        res.json( {url: session.url, message: "Proceed to Checkout"} ) 
        console.log("sent!")
      });

    }
  });
});


app.post("/subscribe", (req, res) => {
    const email = req.body.email;
    // Handle the email subscription logic here (e.g., store it in a database)
    // Send a confirmation message, etc.
    console.log(email);
    res.redirect('')
});



// app.get("/STORE-INIT", function (req, res) {
//   //read the items json file, with an error function just in case
//   fs.readFile("items.json", function (error, data) {
//     if (error) {
//       //internet server error then ends the response
//       res.status(500).end();
//     } else {

//       getProducts()
//       .then((res) => {
//         let itemsArray = JSON.parse(data);
//         itemsArray.forEach((item) => {
//           createProduct(item.name, item.images, item.price)
//         })
//       })
//       .catch((err) => {
//         console.error(err);
//       });

//       res.redirect("https://dashboard.stripe.com/test/products?active=true");
//     }
//   });
// });



app.use((req, res) => {
  res.render("error.ejs");
});

//listen in on a port
app.listen(process.env.PORT || PORT, (err) => {
  if (err) console.error(err);

  console.log(
    "listening on port http://localhost:" +
      process.env.PORT +
      "\nor http://localhost:" +
      PORT
  );
});
