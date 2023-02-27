const {
    prepareTestFolder, prepareTestCircomFile, compileCircuit, getSnarkjsInfo, writeInputJsonFile, exec,
    readOutputJsonFile, logger
} = require("./util/helper");
const expect = require('chai').expect;

const pathToTestDirectory = './lib/';
console.debug('pathToTestDirectory >> ', pathToTestDirectory);

const fileName = 'older';
const testFileName = 'test.' + fileName;
const circomFileName = fileName + '.circom';
const circomTestFileName = 'test.' + circomFileName;
console.debug('fileName >> ', fileName);
console.debug('testFileName >> ', testFileName);
console.debug('circomFileName >> ', circomFileName);
console.debug('circomTestFileName >> ', circomTestFileName);

const pathToCircomFile = pathToTestDirectory + circomFileName;
const pathToCircomTestFile = pathToTestDirectory + circomTestFileName;
console.debug('pathToCircomFile >> ', pathToCircomFile);
console.debug('pathToCircomTestFile >> ', pathToCircomTestFile);

const testFolderName = 'test-' + fileName;
const pathToTestFolder = pathToTestDirectory + testFolderName;
console.debug('pathToTestFolder >> ', pathToTestFolder);

const powerOfTauFile = './lib/powersOfTau28_hez_final_16.ptau';
console.debug('powerOfTauFile >> ', powerOfTauFile);

const r1csFile = `${pathToTestFolder}/${testFileName}.r1cs`;
const zkeyInitialFile = `${pathToTestFolder}/${testFileName}.initial.zkey`;
const zkeyFinalFile = `${pathToTestFolder}/${testFileName}.final.zkey`;
const verificationKeyFile = `${pathToTestFolder}/${testFileName}.verification.key.json`;
console.debug('r1csFile >> ', r1csFile);
console.debug('zkeyInitialFile >> ', zkeyInitialFile);
console.debug('zkeyFinalFile >> ', zkeyFinalFile);
console.debug('verificationKeyFile >> ', verificationKeyFile);

const wasmFile = `${pathToTestFolder}/${testFileName}_js/${testFileName}.wasm`;
const generateWitnessFile = `${pathToTestFolder}/${testFileName}_js/generate_witness.js`;
const wtnsFile = `${pathToTestFolder}/${testFileName}.witness.wasm`;
console.debug('wasmFile >> ', wasmFile);
console.debug('wtnsFile >> ', wtnsFile);

const proofFile = `${pathToTestFolder}/${testFileName}.proof.json`;
console.debug('proofFile >> ', proofFile);

const isOlderThan18 = async (now, birthday, testCaseMarker) => {
    const inputJsonFile = {
        "dateOfBirth": birthday,
        "now": now,
    };

    const pathToInputJsonFile = `${pathToTestFolder}/${testCaseMarker + testFileName}.input.json`;
    const pathToOutputJsonFile = `${pathToTestFolder}/${testCaseMarker + testFileName}.output.json`;
    console.debug('pathToInputJsonFile >> ', pathToInputJsonFile);
    console.debug('pathToOutputJsonFile >> ', pathToOutputJsonFile);

    await writeInputJsonFile(pathToInputJsonFile, inputJsonFile);

    await exec(`node ${generateWitnessFile} ${wasmFile} ${pathToInputJsonFile} ${wtnsFile}`).then(logger).catch(logger);
    await exec(`snarkjs groth16 prove ${zkeyFinalFile} ${wtnsFile} ${proofFile} ${pathToOutputJsonFile}`).then(logger);

    return await readOutputJsonFile(pathToOutputJsonFile);
};

describe('util.circom template', async function () {
    before(async function () {
        await prepareTestFolder(pathToTestFolder);

        const appendixCircuit = `\ncomponent main = ageVerification();`;
        await prepareTestCircomFile(pathToCircomFile, pathToCircomTestFile, appendixCircuit);

        await compileCircuit(pathToCircomTestFile, pathToTestFolder);
        await getSnarkjsInfo(r1csFile);

        await exec(`snarkjs zkey new ${r1csFile} ${powerOfTauFile} ${zkeyInitialFile}`).then(logger);
        await exec(`snarkjs zkey contribute ${zkeyInitialFile} ${zkeyFinalFile} --name="${fileName}" -e="random"`).then(logger);
        await exec(`snarkjs zkey export verificationkey ${zkeyFinalFile} ${verificationKeyFile}`).then(logger);
    });

    describe('ageVerification()', () => {
        it('Now && 01.11.1995', async function () {
            const myDateOfBirthInMsString = "815217900000";//01.11.1995 in ms
            const nowInMsString = Date.now().toString();
            const outputJsonFile = await isOlderThan18(nowInMsString, myDateOfBirthInMsString, "01-11-1995-");
            const expectedOutputJsonFile = [
                "1",
                nowInMsString
            ];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });

        it('Now && Now', async function () {
            const nowInMsString = Date.now().toString();
            const outputJsonFile = await isOlderThan18(nowInMsString, nowInMsString, "just-now-");
            const expectedOutputJsonFile = [
                "0",
                nowInMsString
            ];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });
        it('Now && Now-18years', async function () {
            const eighteenYears = 568025136000; // exactly 18
            const now = Date.now();
            const eighteenYearsAgoInMsString = (now - eighteenYears).toString();
            const nowInMsString = now.toString();
            const outputJsonFile = await isOlderThan18(nowInMsString, eighteenYearsAgoInMsString, "eighteen-years-ago-");
            const expectedOutputJsonFile = [
                "0",
                nowInMsString
            ];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });
        it('Now && Now-18years+1ms', async function () {
            const eighteenYearsPlusOneMsInMs = 568025136000 + 1; //older than 18 by 1 ms
            const now = Date.now();
            const eighteenYearsPlusOneMsAgoInMsString = (now - eighteenYearsPlusOneMsInMs).toString();
            const nowInMsString = now.toString();
            const outputJsonFile = await isOlderThan18(nowInMsString, eighteenYearsPlusOneMsAgoInMsString, "eighteen-years-plus-one-ms-ago-");
            const expectedOutputJsonFile = [
                "1",
                nowInMsString
            ];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });
        it('Now && Now-18years-1ms', async function () {
            const eighteenYearsMinusOneMsInMs = 568025136000 - 1; //younger than 18 by 1 ms
            const now = Date.now();
            const eighteenYearsMinusOneMsAgoInMsString = (now - eighteenYearsMinusOneMsInMs).toString();
            const nowInMsString = now.toString();
            const outputJsonFile = await isOlderThan18(nowInMsString, eighteenYearsMinusOneMsAgoInMsString, "eighteen-years-minus-one-ms-ago-");
            const expectedOutputJsonFile = [
                "0",
                nowInMsString
            ];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });
    });
});