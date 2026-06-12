const express = require("express");
const app = express();
const port = process.env.PORT;
const productRouter = require("./routers/productsRouter");
const orderRouter = require("./routers/orderRouter");
const categoryRouter = require("./routers/categoryRouter");
const checkoutRouter = require("./routers/checkoutRouter");
const homeRouter = require("./routers/homeRouter");
const errorHandler = require("./middlewares/errorHandler");
const pageNotFound = require("./middlewares/pageNotFound");
const cors = require("cors");
const { indexHome } = require("./controllers/productController");
const availabilityRoute = require("./routers/availabilityRouter");

//adding cors path localhost 5173 (ognuno cambi il suo nel file .env)
app.use(
  cors({
    origin: [process.env.FE_APP, "http://localhost:5173"],
    credentials: true,
  })
);

// adding public folder on static
app.use(express.static("./public"));

// JSON body parser
app.use(express.json());

// ROUTERS used in 127.0.0.1:3000/products
app.use("/", homeRouter);
app.use("/products", productRouter);
app.use("/orders", orderRouter);
app.use("/categories", categoryRouter);
app.use("/checkout", checkoutRouter);
app.use("/api/availability", availabilityRoute);
// 500 Handler
app.use(errorHandler);

// 404 Handler
app.use(pageNotFound);

app.get("/", (req, res) => {
  return res.status(200).json({ msg: "Benvenuto nella mia Api!!", code: 200 });
});

// Listening server
app.listen(port, () => {
  console.log(`Attivazione del server locale in http://localhost:${port}`);
});
