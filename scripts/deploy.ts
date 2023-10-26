/* script para desplegar los contratos con hardhat
    USO: importar desde otro archivo
*/

// Importar ethers
import { ethers } from "hardhat";

export async function main() {
  const [deployer] = await ethers.getSigners();
  // Desplegar WorldToken
  /* const WorldToken = await ethers.getContractFactory("WorldToken");
  const worldToken = await WorldToken.connect(deployer).deploy(
    "WorldToken",
    "WORLD"
  );
  await worldToken.deployed();
*/
  // Desplegar VestingContract
  const worldTokenAddress = "0xB1482E2c3C96ae0BaaD5dF5D2f544fA98a5C6508";
  const WorldToken = await ethers.getContractFactory("WorldToken");
  const worldToken = await WorldToken.attach(worldTokenAddress);
  const VestingContract = await ethers.getContractFactory("VestingContract");
  const vestingContract = await VestingContract.connect(deployer).deploy(
    worldTokenAddress
  );
  await vestingContract.deployed();

  // Mostrar las direcciones de los contratos
  // Mostrar la dirección de quien despliega el contrato
  console.log("Dirección del desplegador: ", deployer.address);

  console.log("Dirección de WorldToken: ", worldTokenAddress);
  console.log("Dirección de VestingContract: ", vestingContract.address);

  // Añadir VestingContract como minter de WorldToken
  // Mostrar el rol que tiene deployer en WorldToken

  await worldToken.grantRole(worldToken.MINTER_ROLE(), vestingContract.address);
  console.log(
    "VestingContract ha sido otorgado el MINTER_ROLE en el contrato WorldToken."
  );
}
