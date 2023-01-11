include "./circomlib/circuits/comparators.circom";

template ageVerification() {
    signal input dateOfBirth; // date of birth in ms
    signal input now; // current moment of time

    signal output isOlderThan18;
    signal output momentOfProof;

    momentOfProof <== now;

    signal diff;
    diff <== now - dateOfBirth;

    component lessThan = LessThan(252);
    lessThan.in[0] <== 568025136000; // 18 years in ms
    lessThan.in[1] <== diff;
    isOlderThan18 <== lessThan.out;
}