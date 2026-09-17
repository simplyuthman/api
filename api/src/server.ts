import { app } from "./app";
import { config } from "./config/config";

app.listen(config.port, () => {
  console.log(`Property Market API server is running on port ${config.port}`);
});
