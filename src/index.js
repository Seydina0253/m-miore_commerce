const express = require("express");
const mysql = require("mysql2/promise");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const invoiceRoutes = require("./routes/invoices");
const voucherRoutes = require("./routes/vouchers");

const app = express();
const PORT = process.env.PORT || 5000;

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mem1',
});

app.use(express.json());

app.use("/api/users", userRoutes(db));
app.use("/api/products", productRoutes(db));
app.use("/api/orders", orderRoutes(db));
app.use("/api/invoices", invoiceRoutes(db));
app.use("/api/vouchers", voucherRoutes(db));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});