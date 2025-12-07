import app from './app.js';
import { config } from './config/env.js';

const PORT = config.PORT;

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
