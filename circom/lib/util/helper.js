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

const workingDirectory = './lib/';

const getConfig = fileName => ({
    fileName: fileName,
    testFileName: 'test.' + fileName,
    circomFileName: fileName + '.circom',
    circomTestFileName: 'test.' + fileName + '.circom',
    pathToCircomFile: workingDirectory + fileName + '.circom',
    pathToCircomTestFile: workingDirectory + 'test.' + fileName + '.circom',
    testFolderName: 'test.' + fileName,
    pathToTestFolder: workingDirectory + 'test.' + fileName,
    powerOfTauFile: workingDirectory + 'powersOfTau28_hez_final_16.ptau',
    r1csFile: workingDirectory + 'test.' + fileName + '/test.' + fileName + '.r1cs',
    zkeyInitialFile: workingDirectory + 'test.' + fileName + '/test.' + fileName + '.initial.zkey',
    zkeyFinalFile: workingDirectory + 'test.' + fileName + '/test.' + fileName + '.final.zkey',
    verificationKeyFile: workingDirectory + 'test.' + fileName + '/test.' + fileName + '.verification.key.json',
    wasmFile: workingDirectory + 'test.' + fileName + '/test.' + fileName + '_js/test.' + fileName + '.wasm',
    generateWitnessFile: workingDirectory + 'test.' + fileName + '/test.' + fileName + '_js/generate_witness.js',
    wtnsFile: workingDirectory + 'test.' + fileName + '/test.' + fileName + '.witness.wasm',
    proofFile: workingDirectory + 'test.' + fileName + '/test.' + fileName + '.proof.json',
});

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
    getConfig,
};