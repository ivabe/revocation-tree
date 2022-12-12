include "./circomlib/circuits/comparators.circom";
template extractKthBit(n) {
    /*
    n-bit-array from which the output gives the bit value in the k-th position (starting the counting from 1 at the least significant bit!)
        e.g. [0 1 1 0 0 0 1 1 1], where k = 3 -> output = 1, for k = 4 -> output = 0
    */
    signal input in;
    signal input k;
    signal output outBit; // bit value, must be either 0/1
    signal binaryRepresentation[n]; // binary representation of in, used as intermediate signal
    signal powersOfTwo[n+1]; // used to collect get all the powers of 2
    powersOfTwo[0] <== 1;
    signal runningBinarySum[n+1]; // used to recover in from its binary representation (necessary as the decomposition to binary is not constrained)
    runningBinarySum[0] <== 0; 
    signal runningOutputBitSum[n+1];  // used to iteratively compute ∑_0_to_n binaryRepresentation[i]*IsEqual(i,k), where IsEqual() gives 1 if True, 0 if False
    runningOutputBitSum[0] <== 0;
    component equality_check[n]; // used for IsEqual() components in the loop
    for (var i = 0; i<n; i++) {
        binaryRepresentation[i] <-- (in >> i) & 1; // extract the bit value
        binaryRepresentation[i] * (binaryRepresentation[i]-1) === 0; // ensure value is boolean 0/1
        // if i = k then assing k_ith
        equality_check[i] = IsEqual();
        equality_check[i].in[0] <== k-1;
        equality_check[i].in[1] <== i;
        // ∑_0_to_251 n[i]*IsEqual(i,k)
        runningOutputBitSum[i+1] <== runningOutputBitSum[i] + binaryRepresentation[i] * equality_check[i].out;
        runningBinarySum[i+1] <== runningBinarySum[i] + binaryRepresentation[i] * powersOfTwo[i];
        powersOfTwo[i+1] <== 2 * powersOfTwo[i];
    }
    runningBinarySum[n] === in;
    outBit <== runningOutputBitSum[n];
}