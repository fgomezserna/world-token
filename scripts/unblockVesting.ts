/* script para desplegar los contratos con hardhat
    USO: importar desde otro archivo
*/

// Importar ethers
import { ethers } from 'hardhat';
import { string } from 'hardhat/internal/core/params/argumentTypes';
    
// Función para formatear la estructura para la consola de bash
export async function main(taskArgs: any) {
    enum DurationUnits {
        Days,
        Weeks,
        Months
    }
    const [deployer] = await ethers.getSigners();
    let { contratovesting, token, wallet, num } = taskArgs;
    const VestingContract = await ethers.getContractFactory("VestingContract");
    // Cargar el contrato de vesting ya desplegado
    const vestingContract = VestingContract.attach(contratovesting);

    const releaseTx = await vestingContract.unblockSchedule(wallet, num);
    await releaseTx.wait(); // Esperar a que la transacción sea minada

    console.log(`Vesting ${num} has been blocked. Tx hash: ${releaseTx.hash}`);
  
}


