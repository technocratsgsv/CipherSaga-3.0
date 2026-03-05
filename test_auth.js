const { execSync } = require('child_process');

async function test() {
  console.log("Simulating admin login redirect test...");
  try {
     const res = execSync('curl -I -s http://localhost:5173/admin/login').toString();
     console.log(res);
  } catch(e) { console.error(e) }
}
test();
