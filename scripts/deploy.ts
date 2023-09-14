/* script para desplegar los contratos con hardhat
    USO: importar desde otro archivo
*/

// Importar ethers
import { ethers } from 'hardhat';
    
export async function main() {

    const [deployer] = await ethers.getSigners();
    // Desplegar WorldToken
    const WorldToken = await ethers.getContractFactory("WorldToken");
    const worldToken = await WorldToken.connect(deployer).deploy("WorldToken", "WORLD");
    await worldToken.deployed();

    // Desplegar VestingContract
    const VestingContract = await ethers.getContractFactory("VestingContract");
    const vestingContract = await VestingContract.connect(deployer).deploy(worldToken.address);
    await vestingContract.deployed();

    // Mostrar las direcciones de los contratos
    // Mostrar la dirección de quien despliega el contrato
    console.log("Dirección del desplegador: ", deployer.address);

    
    console.log("Dirección de WorldToken: ", worldToken.address);
    console.log("Dirección de VestingContract: ", vestingContract.address);
  
    // Añadir VestingContract como minter de WorldToken
    // Mostrar el rol que tiene deployer en WorldToken
    
    
    
    await worldToken.grantRole(worldToken.MINTER_ROLE(), vestingContract.address);
    console.log("VestingContract ha sido otorgado el MINTER_ROLE en el contrato WorldToken.");   

  
}


