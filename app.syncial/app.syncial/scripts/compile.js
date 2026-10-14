const fs = require('fs');
const path = require('path');
const solc = require('solc');

function findImports(importPath) {
  if (importPath.startsWith('@openzeppelin/')) {
    const fullPath = path.resolve(__dirname, '../node_modules', importPath);
    if (fs.existsSync(fullPath)) {
      return { contents: fs.readFileSync(fullPath, 'utf8') };
    }
  }
  return { error: 'File not found: ' + importPath };
}

const contractSource = fs.readFileSync(path.resolve(__dirname, '../contracts/Prediction.sol'), 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'Prediction.sol': {
      content: contractSource,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode'],
      },
    },
  },
};

console.log('Compiling Prediction.sol...');
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
  let hasError = false;
  output.errors.forEach((err) => {
    console.log(err.formattedMessage);
    if (err.severity === 'error') hasError = true;
  });
  if (hasError) {
    process.exit(1);
  }
}

const contract = output.contracts['Prediction.sol']['ArcPredictionMarketplace'];
console.log('Compilation successful!');
console.log('Bytecode length:', contract.evm.bytecode.object.length);
console.log('ABI functions:', contract.abi.filter(x => x.type === 'function').map(x => x.name));

fs.writeFileSync(
  path.resolve(__dirname, '../abi/PredictionMarketplace.json'),
  JSON.stringify(contract.abi, null, 2)
);
console.log('Updated abi/PredictionMarketplace.json');
