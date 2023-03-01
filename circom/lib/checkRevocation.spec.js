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
expect = chai.expect;

const config = getConfig('checkRevocation');
console.debug('config >>', JSON.stringify(config, null, 2));

const attributePresentation = async (inputJsonFile, testCaseMarker) => {
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


describe('attributePresentation.circom template', async function () {
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

        const appendixCircuit = `\ncomponent main = CheckRevocation(3);`;
        await prepareTestCircomFile(pathToCircomFile, pathToCircomTestFile, appendixCircuit);

        await compileCircuit(pathToCircomTestFile, pathToTestFolder);
        await getSnarkjsInfo(r1csFile);

        await exec(`snarkjs zkey new ${r1csFile} ${powerOfTauFile} ${zkeyInitialFile}`).then(logger);
        await exec(`snarkjs zkey contribute ${zkeyInitialFile} ${zkeyFinalFile} --name="${fileName}" -e="random"`).then(logger);
        await exec(`snarkjs zkey export verificationkey ${zkeyFinalFile} ${verificationKeyFile}`).then(logger);
    });

    describe('CheckRevocation(3)', () => {
        it('Success test', async function () {
            const inputJsonFile = {
                id: 1234501,
                path: [0, 0, 0],
                lemma: [
                    18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
                    1382129361768633036057174557812678057467005618241232823872788790752066157445n.toString(),
                    9681765776481265977901829530084985526310330812859580494580910966204997291130n.toString(),
                    5536145057333968474521785518927764270831250569884174013402440409261980981430n.toString(),
                ]
            };

            const outputJsonFile = await attributePresentation(inputJsonFile, "successful-");

            const expectedOutputJsonFile = [
                "18586133768512220936620570745912940619677854269274689475585506675881198879027",
                "0"
            ];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });

    });
});