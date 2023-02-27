const exec = require('util').promisify(require('child_process').exec);
const fs = require("fs").promises;

const logger = ({stdout, stderr}) => {
    if (stdout)
        console.log(stdout);
    if (stderr)
        console.error(stderr);
};

const doesDirectoryExist = async directory => {
    try {
        await fs.access(directory);
        return true;
    } catch (e) {
        // console.warn(e);
        return false;
    }
};
const createTestDirectory = async directory => await exec(`mkdir ${directory}`).then(logger);
const removeDirectory = async directory => await exec(`rm -r ${directory}`).then(logger);
const prepareTestFolder = async directory => {
    if (await doesDirectoryExist(directory))
        await removeDirectory(directory);
    await createTestDirectory(directory);
};

const prepareTestCircomFile = async (originalFilePath, testFilePath, appendixCircuit) => {
    await exec(`cp ${originalFilePath} ${testFilePath}`).then(logger);
    await exec(`echo "${appendixCircuit}" >> ${testFilePath}`).then(logger);
};

const getSnarkjsInfo = async r1csFilePath => await exec(`snarkjs info -c ${r1csFilePath}`).then(logger);

const compileCircuit = async (circomFilePath, outputFolderPath) => await exec(`circom ${circomFilePath} --r1cs --wasm --sym --output  ${outputFolderPath}`).then(logger);

const writeInputJsonFile = async (path, json) => await fs.writeFile(path, JSON.stringify(json));
const readOutputJsonFile = async path => JSON.parse((await fs.readFile(path)).toString());

module.exports = {
    exec,
    logger,
    doesDirectoryExist,
    createTestDirectory,
    removeDirectory,
    prepareTestFolder,
    prepareTestCircomFile,
    getSnarkjsInfo,
    compileCircuit,
    writeInputJsonFile,
    readOutputJsonFile,
};