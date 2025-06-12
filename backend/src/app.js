const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const certificateRoutes = require("./routes/certificate");
const nftRoutes = require("./routes/nft");

const app = express();
