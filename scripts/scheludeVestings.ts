export async function main(taskArgs: any, hre: any) {
  const fs = require("fs");
  const { exec } = require("child_process");

  const { contratovesting, filepath } = taskArgs;

  const vestings = JSON.parse(fs.readFileSync(filepath, "utf8"));

  for (const vesting of vestings) {
    const {
      wallet,
      amount,
      starttime,
      duration,
      percenttostart,
      cliff,
      durationunits,
    } = vesting;

    const command = `npx hardhat scheludeVesting --network ${hre.network.name} --contratovesting ${contratovesting} --wallet ${wallet} --amount ${amount} --starttime ${starttime} --duration ${duration} --percenttostart ${percenttostart} --cliff ${cliff} --durationunits ${durationunits}`;

    const { error, stdout, stderr } = await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          reject({ error, stdout, stderr });
        } else if (stderr) {
          console.log(`stderr: ${stderr}`);
          reject({ error, stdout, stderr });
        } else {
          console.log(`stdout: ${stdout}`);
          resolve({ error, stdout, stderr });
        }
      });
    });
  }
}
