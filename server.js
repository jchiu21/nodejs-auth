require("dotenv").config({ quiet: true });
const express = require("express");
const connectToDB = require("./db/db");
const authRoutes = require("./routes/auth-routes");
const adminRoutes = require("./routes/admin-routes");
const homeRoutes = require("./routes/home-routes");
const uploadImageRoutes = require("./routes/image-routes")

connectToDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/images", uploadImageRoutes)

app.listen(PORT, () => {
  console.log(`Server is now listening on port ${PORT}`);
});
