const polinomal = require('./polynomal')
const galiosField = require('./galios-field')
const cloneDeep = require('lodash/cloneDeep')

function generateIrreducibleVector(errorCorrectionSymbsCount) {
    let vector = [1]
    for (let i = 0; i < errorCorrectionSymbsCount; i++) {
        const y = [1, galiosField.powerByLog(2, i)]
        vector = polinomal.multiply(vector, y)
    } 
    return vector
}

function calculateSyndromes(msg, errorCorrectionSymbsCount) {
    const syndrome = new Array(errorCorrectionSymbsCount).fill(0)
    for (let i = 0; i < errorCorrectionSymbsCount; i++) {
        syndrome[i] = polinomal.eval(msg, galiosField.powerByLog(2, i))
    }
    return [0].concat(syndrome)
}

function checkSyndromes(msg, errorCorrectionSymbsCount) {
    return Math.max(...calculateSyndromes(msg, errorCorrectionSymbsCount)) === 0
}

function getErrorLocations (errorPositions) {
    let errorLocation = [1]
    for (let i = 0; i < errorPositions.length; i++) {
        errorLocation = polinomal.multiply(errorLocation, polinomal.add([1], [galiosField.powerByLog(2, errorPositions[i]), 0]))
    } 
    return errorLocation
}

function getErrorEvaluator (syndrome, errorLocation, errorCorrectionSymbsCount) {
    const [_, remainder] = polinomal.div(polinomal.multiply(syndrome, errorLocation), ([1].concat(new Array(errorCorrectionSymbsCount+1).fill(0))))
    return remainder
}

function correctValues (message, syndrome, errorPositions) {
    debugger
    const coeficientPositions = errorPositions.map(position => message.length - 1 - position)
    const errorLocations = getErrorLocations(coeficientPositions)
    const syndromeBackwards = cloneDeep(syndrome).reverse()
    const errorEvaluations = getErrorEvaluator(syndromeBackwards, errorLocations, errorLocations.length - 1).reverse()

    const X = []
    for (let i = 0; i < coeficientPositions.length; i++) {
        const l = 255 - coeficientPositions[i]
        X.push(galiosField.powerByLog(2, -l))
    }
    debugger

    const E = new Array(message.length).fill(0)
    const xLen = X.length
    for (let i = 0; i < xLen; i++) {
        const xInversed = galiosField.inverseByLog(X[i])
        const errorLocationPrimeTemporary = []
        for (let j = 0; j < xLen; j++) {
            if (j !== i) {
                errorLocationPrimeTemporary.push(galiosField.add(1, galiosField.multiplyByLog(xInversed, X[j])))
            }
        }
        const errorLocationPrime = errorLocationPrimeTemporary.reduce((errorLocPrime, coef) => galiosField.multiplyByLog(errorLocPrime, coef), 1)
        let y = polinomal.eval(cloneDeep(errorEvaluations).reverse(), xInversed) 
        y = galiosField.multiplyByLog(galiosField.powerByLog(X[i], 1), y)
        debugger
        if (errorLocationPrime === 0) {
            throw new Error(`Prime is ${errorLocationPrime}`)
        }
        const magnitude = galiosField.divByLog(y, errorLocationPrime) // tut nuli what nigga
        E[errorPositions[i]] = magnitude
    }
    debugger
    message = polinomal.add(message, E)
    return message
}

function encode(text) {
    debugger
  const init = generateIrreducibleVector(10);
  const okayLengthArray = text.concat(new Array(init.length - 1).fill(0))
  const res = polinomal.div(okayLengthArray, init);
  const [_, remainder] = res
  return text.concat(remainder)
}

function correct (message, errorPositions) {
    const syndrome = calculateSyndromes(message, 10);
    return correctValues(message, syndrome, errorPositions);
}

module.exports = {
    encode,
    correct,
}