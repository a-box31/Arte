//Express Server

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//process, environment keys
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
const PORT = 5000;

// console.log(stripeSecretKey, stripePublicKey)

//requiring express into a express variable
const express = require("express");
//express function creates a sever
const app = express();
//json reading library
const fs = require("fs");
// stripe middleware for payment processing
const stripe = require("stripe")(stripeSecretKey);

//view engine allows to embed server side code in the front end html pages
app.set("view engine", "ejs");
// we are now able to parse body element as a JSON object to access properties
app.use(express.json());
//app front end needs to be located as a static folder: now server shows the website
app.use(express.static("public"));

app.get("/store", function (req, res) {
  //read the items json file, with an error function just in case
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
        items: JSON.parse(data),
      });
    }
  });
});



app.post("/purchase", function (req, res) {
  //read the items json file, with an error function just in case
  fs.readFile("items.json", function (error, data) {
    if (error) {
      //internet server error then ends the response
      res.status(500).end();
    } else {
      // get the all the items on the server
      const itemsJson = JSON.parse(data);
      // Connect the two arrays joining all items in the server
      const itemsArray = itemsJson.music.concat(itemsJson.merch);

      // from the request body's list of purchase items:
      // loop through purchases and cross reference
      // with a loop through the server list, by checking against the id
      // if the item matches, then the total is updated
      let total = 0;
      req.body.items.forEach( (item) => {
        // return the itemJson when the item id is the same as the purchase id
        const itemJson = itemsArray.find((i) => {
          return i.id == item.id;
        });
        // new total is added by the found item's price and quantity
        total += itemJson.price * item.quantity;
      });

      // create a new charge on the bill from the total above
      stripe.charges
        .create({
          amount: total,
          source: req.body.stripeTokenId,
          currency: "usd"
        })
        .then(() => {   //Promise returned to log success, return a json file back
          console.log("Charge Successful");
          res.json({ message: "Successful Purchased Items" });
        }).catch(()=>{
            console.log("Charge Failure");
            res.status(500).end();
        })
    }
  });
});

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
