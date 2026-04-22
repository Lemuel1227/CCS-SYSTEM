const bcrypt = require('bcryptjs'); bcrypt.compare('password123', '$2b$10$S4WZ09Cuu8ZsRY1FImyyNOgoxbZK2NGuWVP0sJOv6aMA9MfofCqTm').then(console.log);
