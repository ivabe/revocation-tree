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
const expect = require('chai').expect;

const config = getConfig('merkleproof');
console.debug('config >>', JSON.stringify(config, null, 2));

const merkleProof = async (testCaseMarker) => {
    const inputJsonFile = {
        path: [ 0, 0, 0 ],
        lemma: [
            18586133768512220936620570745912940619677854269274689475585506675881198879027,
            18586133768512220936620570745912940619677854269274689475585506675881198879027,
            1382129361768633036057174557812678057467005618241232823872788790752066157445,
            9681765776481265977901829530084985526310330812859580494580910966204997291130,
            5536145057333968474521785518927764270831250569884174013402440409261980981430
        ],
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

    await exec(`node ${generateWitnessFile} ${wasmFile} ${pathToInputJsonFile} ${wtnsFile}`).then(logger).catch(logger);
    await exec(`snarkjs groth16 prove ${zkeyFinalFile} ${wtnsFile} ${proofFile} ${pathToOutputJsonFile}`).then(logger);

    return await readOutputJsonFile(pathToOutputJsonFile);
};


describe('merkleproof.circom template', async function () {
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

        const appendixCircuit = `\ncomponent main = MerkleProof(13);`;
        await prepareTestCircomFile(pathToCircomFile, pathToCircomTestFile, appendixCircuit);

        await compileCircuit(pathToCircomTestFile, pathToTestFolder);
        await getSnarkjsInfo(r1csFile);

        await exec(`snarkjs zkey new ${r1csFile} ${powerOfTauFile} ${zkeyInitialFile}`).then(logger);
        await exec(`snarkjs zkey contribute ${zkeyInitialFile} ${zkeyFinalFile} --name="${fileName}" -e="random"`).then(logger);
        await exec(`snarkjs zkey export verificationkey ${zkeyFinalFile} ${verificationKeyFile}`).then(logger);
    });

    describe('merkleProof(13)', () => {
        it('First test', async function () {
            const outputJsonFile = await merkleProof( "first-test-");
            const expectedOutputJsonFile = [
                "1",
                12312
            ];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });
    });
});
