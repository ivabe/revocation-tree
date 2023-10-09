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

        const appendixCircuit = `\ncomponent main = CheckRevocation(13);`;
        await prepareTestCircomFile(pathToCircomFile, pathToCircomTestFile, appendixCircuit);

        await compileCircuit(pathToCircomTestFile, pathToTestFolder);
        await getSnarkjsInfo(r1csFile);

        await exec(`snarkjs zkey new ${r1csFile} ${powerOfTauFile} ${zkeyInitialFile}`).then(logger);
        await exec(`snarkjs zkey contribute ${zkeyInitialFile} ${zkeyFinalFile} --name="${fileName}" -e="random"`).then(logger);
        await exec(`snarkjs zkey export verificationkey ${zkeyFinalFile} ${verificationKeyFile}`).then(logger);
    });

    // describe('CheckRevocation(3)', () => {
    //     it('Success test', async function () {
    //         const inputJsonFile = {
    //             id: 1234501,
    //             path: [0, 0, 0],
    //             lemma: [
    //                 18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
    //                 18586133768512220936620570745912940619677854269274689475585506675881198879027n.toString(),
    //                 1382129361768633036057174557812678057467005618241232823872788790752066157445n.toString(),
    //                 9681765776481265977901829530084985526310330812859580494580910966204997291130n.toString(),
    //                 5536145057333968474521785518927764270831250569884174013402440409261980981430n.toString(),
    //             ]
    //         };
    //
    //         const outputJsonFile = await attributePresentation(inputJsonFile, "successful-");
    //
    //         const expectedOutputJsonFile = [
    //             "18586133768512220936620570745912940619677854269274689475585506675881198879027",
    //             "0"
    //         ];
    //         expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
    //     });
    //
    // });

    describe('CheckRevocation(13)', () => {
        it('Success test', async function () {
            const inputJsonFile = {
                id: 1234501,
                path: [  0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1],
                lemma: [
                    15166994417731503543822836390427671538511444589633480329223617875361059048402n.toString(),
                    19014214495641488759237505126948346942972912379615652741039992445865937985820n.toString(),
                    10447686833432518214645507207530993719569269870494442919228205482093666444588n.toString(),
                    2186774891605521484511138647132707263205739024356090574223746683689524510919n.toString(),
                    6624528458765032300068640025753348171674863396263322163275160878496476761795n.toString(),
                    17621094343163687115133447910975434564869602694443155644084608475290066932181n.toString(),
                    21545791430054675679721663567345713395464273214026699272957697111075114407152n.toString(),
                    792508374812064496349952600148548816899123600522533230070209098983274365937n.toString(),
                    19099089739310512670052334354801295180468996808740953306205199022348496584760n.toString(),
                    1343295825314773980905176364810862207662071643483131058898955641727916222615n.toString(),
                    16899046943457659513232595988635409932880678645111808262227296196974010078534n.toString(),
                    4978389689432283653287395535267662892150042177938506928108984372770188067714n.toString(),
                    9761894086225021818188968785206790816885919715075386907160173350566467311501n.toString(),
                    17359243402716423847856211256034368828021432180374173712507781441869535986826n.toString(),
                    17251388444894072717477473574274222593987938315536802709728703916958893405064n.toString()

                ]
            };

            const outputJsonFile = await attributePresentation(inputJsonFile, "successful-");

            const expectedOutputJsonFile = [
                "17251388444894072717477473574274222593987938315536802709728703916958893405064",
                "0"
            ];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });

    });
});