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
  enum DurationUnitsEnum {
    Days,
    Weeks,
    Months,
  }
  const [deployer] = await ethers.getSigners();
  let {
    contratovesting,
    wallet,
    amount,
    starttime,
    duration,
    percenttostart,
    cliff,
    durationunits,
  } = taskArgs;

  let amountTGE;
  // dado un wallet pasado por parametro, debemos añadirlo en el contrato de vesting
  // el contrato de vesting es otro parametro y con ese debemos cargarlo con at
  // ya esta desplegado
  // Import    ar el contrato VestingContract
  const VestingContract = await ethers.getContractFactory("VestingContract");
  // Cargar el contrato de vesting ya desplegado
  const vestingContract = VestingContract.attach(contratovesting);

  // Convert the durationunits string to the corresponding enum index
  durationunits =
    DurationUnitsEnum[durationunits as keyof typeof DurationUnitsEnum];

  // Transformamos starttime a timestamp
  if (percenttostart > 0) {
    amountTGE = Math.floor((amount * percenttostart) / 100);
    amount = amount - amountTGE;
    const starttimeUnix = Math.floor(new Date(starttime).getTime() / 1000);

    const createVestingScheduleTx = await vestingContract.createVestingSchedule(
      wallet,
      starttimeUnix,
      0,
      durationunits, // Asumiendo que la duración está en días
      ethers.utils.parseEther(amountTGE.toString())
    );
    await createVestingScheduleTx.wait(); // Esperar a que la transacción sea minada
    const numSchedules = (
      await vestingContract.getNumberOfSchedules(wallet)
    ).toNumber();
    const vestingSchedule = await vestingContract.vestingSchedules(
      wallet,
      numSchedules - 1
    );
    formatForConsole(vestingSchedule);
  }
  if (typeof cliff === "string" && cliff !== "null") {
    starttime = cliff;
  }

  const starttimeUnix = Math.floor(new Date(starttime).getTime() / 1000);

  // Añadir el wallet al contrato de vesting
  // Crear el horario de vesting

  const createVestingScheduleTx = await vestingContract.createVestingSchedule(
    wallet,
    starttimeUnix,
    duration,
    durationunits, // Select from the enum based on the durationunits variable
    ethers.utils.parseEther(amount.toString())
  );
  await createVestingScheduleTx.wait(); // Esperar a que la transacción sea minada

  // Comprobamos que se ha añadido correctamente
  const numSchedules = (
    await vestingContract.getNumberOfSchedules(wallet)
  ).toNumber();
  const vestingSchedule = await vestingContract.vestingSchedules(
    wallet,
    numSchedules - 1
  );
  formatForConsole(vestingSchedule);

  console.log(
    `Wallet ${wallet} ha sido añadido al contrato de vesting ${contratovesting}`
  );
}
