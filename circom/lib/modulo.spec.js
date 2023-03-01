const {
    prepareTestFolder,
    prepareTestCircomFile,
    compileCircuit,
    getSnarkjsInfo,
    writeInputJsonFile,
    exec,
    readOutputJsonFile,
    logger,
    getConfig,
} = require("./util/helper");
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
expect = chai.expect;
chai.use(chaiAsPromised);

const config = getConfig('modulo');
console.debug('config >>', JSON.stringify(config, null, 2));

const modulo = async (dividend, modulus, testCaseMarker) => {
    const inputJsonFile = {
        "dividend": dividend,
        "modulus": modulus,
    };

    const {
        pathToTestFolder,
        testFileName,
        generateWitnessFile,
        wasmFile,
        wtnsFile,
        zkeyFinalFile,
        proofFile
    } = config;

    const pathToInputJsonFile = `${pathToTestFolder}/${testCaseMarker + testFileName}.input.json`;
    const pathToOutputJsonFile = `${pathToTestFolder}/${testCaseMarker + testFileName}.output.json`;
    console.debug('pathToInputJsonFile >> ', pathToInputJsonFile);
    console.debug('pathToOutputJsonFile >> ', pathToOutputJsonFile);

    await writeInputJsonFile(pathToInputJsonFile, inputJsonFile);

    await exec(`node ${generateWitnessFile} ${wasmFile} ${pathToInputJsonFile} ${wtnsFile}`).then(logger);
    await exec(`snarkjs groth16 prove ${zkeyFinalFile} ${wtnsFile} ${proofFile} ${pathToOutputJsonFile}`).then(logger);

    return await readOutputJsonFile(pathToOutputJsonFile);
};

describe('modulo.circom template', async function () {
    const {
        pathToTestFolder,
        pathToCircomFile,
        zkeyFinalFile,
        pathToCircomTestFile,
        r1csFile,
        powerOfTauFile,
        zkeyInitialFile,
        fileName,
        verificationKeyFile
    } = config;

    before(async function () {
        await prepareTestFolder(pathToTestFolder);

        const appendixCircuit = `\ncomponent main = Modulo();`;
        await prepareTestCircomFile(pathToCircomFile, pathToCircomTestFile, appendixCircuit);

        await compileCircuit(pathToCircomTestFile, pathToTestFolder);
        await getSnarkjsInfo(r1csFile);

        await exec(`snarkjs zkey new ${r1csFile} ${powerOfTauFile} ${zkeyInitialFile}`).then(logger);
        await exec(`snarkjs zkey contribute ${zkeyInitialFile} ${zkeyFinalFile} --name="${fileName}" -e="random"`).then(logger);
        await exec(`snarkjs zkey export verificationkey ${zkeyFinalFile} ${verificationKeyFile}`).then(logger);
    });

    describe('Modulo()', () => {
        it('23 % 14', async function () {
            const outputJsonFile = await modulo(23, 14, "23-mod-14-");
            const expectedOutputJsonFile = ["9","1"];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });
        it('23 % 23', async function () {
            const outputJsonFile = await modulo(23, 23, "23-mod-23-");
            const expectedOutputJsonFile = ["0","1"];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });
        it('23 % 1', async function () {
            const outputJsonFile = await modulo(23, 1, "23-mod-1-");
            const expectedOutputJsonFile = ["0","23"];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });
        it('1 % 23', async function () {
            const outputJsonFile = await modulo(1, 23, "1-mod-23-");
            const expectedOutputJsonFile = ["1","0"];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });
        it('-1 % 23', async function () {
            const outputJsonFile = await modulo(-1, 23, "-1-mod-23-");
            const expectedOutputJsonFile = ["-1","0"];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });
        it('-2 % 23', async function () {
            const outputJsonFile = await modulo(-2, 23, "-2-mod-23-");
            const expectedOutputJsonFile = ["-2","0"];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });
        it('-3 % 23', async function () {
            const outputJsonFile = await modulo(-3, 23, "-3-mod-23-");
            const expectedOutputJsonFile = ["-3","0"];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });
        it('-23 % 1', async function () {
            const outputJsonFile = await modulo(-23, 1, "-23-mod-1-");
            const expectedOutputJsonFile = ["0","23"];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });
        it('23 % 0', async function () {
            await expect(modulo(23, 0, "23-mod-0-")).to.be.rejected;
        });
    });
});