import 'dotenv/config';
import app from './app';
import { config } from './config/config';

app.listen(config.port, () => {
  console.log(`✅ Property Market API listening on port ${config.port} (${config.nodeEnv})`);
});
