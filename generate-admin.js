const bcrypt = require("bcryptjs");

async function generate() {

    const password = "@Alden2018";

    const hash = await bcrypt.hash(password, 12);

    console.log("\nPassword Hash:\n");

    console.log(hash);

}

generate();