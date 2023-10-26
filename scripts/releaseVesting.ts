/* script para desplegar los contratos con hardhat
    USO: importar desde otro archivo
*/

// Importar ethers
import { ethers } from "hardhat";
import { string } from "hardhat/internal/core/params/argumentTypes";

// Función para formatear la estructura para la consola de bash
function formatForConsole(structure: any) {
  let formattedStructure = {
    beneficiary: structure[0],
    start:
      structure[1] && structure[1]
        ? new Date(structure[1] * 1000).toLocaleString()
        : "undefined",
    duration:
      structure[2] && structure[2] ? structure[2].toNumber() : "undefined",
    durationUnits:
      structure[3] === 2 ? "Months" : structure[3] === 1 ? "Weeks" : "Days",
    amountTotal:
      structure[4] && structure[4]
        ? ethers.utils.formatEther(structure[4])
        : "undefined",
    released:
      structure[5] && structure[5]
        ? ethers.utils.formatEther(structure[5])
        : "undefined",
    block: structure[6],
  };
  console.log(JSON.stringify(formattedStructure, null, 2));
}

export async function main(taskArgs: any) {
  enum DurationUnits {
    Days,
    Weeks,
    Months,
  }
  const [deployer] = await ethers.getSigners();
  let { contratovesting, token, wallet } = taskArgs;
  const VestingContract = await ethers.getContractFactory("VestingContract");
  // Cargar el contrato de vesting ya desplegado
  const vestingContract = VestingContract.attach(contratovesting);

  const WorldToken = await ethers.getContractFactory("WorldToken");
  // Cargar el contrato de vesting ya desplegado
  const worldToken = WorldToken.attach(token);

  // balanceof del wallet
  const balanceInitial = await worldToken.balanceOf(wallet);

  console.log("Balance inicial: ", balanceInitial);
  // llamamaos a release
  const release = await vestingContract.getReleaseableAmount(wallet);

  console.log("Esperado para liberar: ", release);

  const releaseTx = await vestingContract.release(wallet);
  console.log("Tx hash: ", releaseTx.hash);
  await releaseTx.wait(); // Esperar a que la transacción sea minada

  const balanceFinal = await worldToken.balanceOf(wallet);
  console.log("Balance final: ", ethers.utils.formatEther(balanceFinal));
  // Calculate the difference between the final and initial balance
  const balanceDifference = balanceFinal.sub(balanceInitial);
  console.log(
    "Balance difference: ",
    ethers.utils.formatEther(balanceDifference)
  );

  // Get the total supply of the token
  const totalSupply = await worldToken.totalSupply();
  console.log(
    "Total supply of tokens: ",
    ethers.utils.formatEther(totalSupply)
  );
}
