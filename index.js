const { encode, correct } = require('./utils/reed-solomon')

async function main() {
// const str = await QRCode.toFile('./test.png', "https://google.com");
// console.log(str);
const text = 'lorem ipsum'
const initialLength = text.length
// const textArray = [
//   0x40,
//   0xd2,
//   0x75,
//   0x47,
//   0x76,
//   0x17,
//   0x32,
//   0x06,
//   0x27,
//   0x26,
//   0x96,
//   0xc6,
//   0xc6,
//   0x96,
//   0x70,
//   0xec,
// ];
const textArray = [...Buffer.from(text).values()]//text.split('').map((_,i) => text.charCodeAt(i))
console.log('textArray', textArray)
const encoded = encode(textArray, 10)
console.log('encoded', encoded)
console.log('encoded with one symbol swap', encoded)
const corrected = correct(encoded, [])
console.log('corrected', corrected)
const textCorrected = corrected.map(charCode => String.fromCharCode(charCode)).join('')
console.error('textCorrected', textCorrected.slice(0, initialLength))
}

main().then(() => console.log('DONE')).catch(err => {
    console.log('ERROR')
    console.error(err)
})
