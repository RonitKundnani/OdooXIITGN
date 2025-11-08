const cors = require("cors");
const { corsOrigin } = require("../config/app");

const corsMiddleware = cors({
  origin: corsOrigin,
  credentials: true
});

module.exports = corsMiddleware;
