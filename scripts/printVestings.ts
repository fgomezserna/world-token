/* script para desplegar los contratos con hardhat
    USO: importar desde otro archivo
*/

// Importar ethers
import { ethers } from 'hardhat';
import { string } from 'hardhat/internal/core/params/argumentTypes';
    
// Función para formatear la estructura para la consola de bash
function formatForConsole(structure: any) {
        let formattedStructure = {
            beneficiary: structure[0],
            start: structure[1] && structure[1] ? new Date(structure[1] * 1000).toLocaleString() : 'undefined',
            duration: structure[2] && structure[2] ? structure[2].toNumber() : 'undefined',
            durationUnits: structure[3] === 2 ? 'Months' : structure[3] === 1 ? 'Weeks' : 'Days',
            amountTotal: structure[4] && structure[4] ? ethers.utils.formatEther(structure[4]) : 'undefined',
            released: structure[5] && structure[5] ? ethers.utils.formatEther(structure[5]) : 'undefined',
            block: structure[6],
       };
    console.log(JSON.stringify(formattedStructure, null, 2));
}


export async function main(taskArgs: any) {
    const [deployer] = await ethers.getSigners();
    let { contratovesting, wallet } = taskArgs;

    // dado un wallet pasado por parametro, debemos añadirlo en el contrato de vesting
    // el contrato de vesting es otro parametro y con ese debemos cargarlo con at
    // ya esta desplegado
    // Import    ar el contrato VestingContract
    const VestingContract = await ethers.getContractFactory("VestingContract");
    // Cargar el contrato de vesting ya desplegado
    const vestingContract = VestingContract.attach(contratovesting);

    // Transformamos starttime a timestamp
    
    // Comprobamos que se ha añadido correctamente
    const numSchedules = (await vestingContract.getNumberOfSchedules(wallet)).toNumber();
    for(let i = 0; i < numSchedules; i++) {
        const vestingSchedule = await vestingContract.vestingSchedules(wallet,i);
        formatForConsole(vestingSchedule);
    }
    
    console.log(`Wallet ${wallet} ha sido añadido al contrato de vesting ${contratovesting}`);

   
  
}


