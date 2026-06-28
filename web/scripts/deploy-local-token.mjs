// Compile + deploy a demo ERC-20 to the local chain (Ganache/Hardhat at :8545),
// then write the addresses to web/local-chain.json for the workflows to use.
import fs from 'node:fs';
import path from 'node:path';
import solc from 'solc';
import { createWalletClient, createPublicClient, http, parseUnits, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';

const RPC = 'http://127.0.0.1:8545';
// Ganache --deterministic account #0 and #1.
const DEPLOYER_PK = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
const ACCT1 = '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0';

const SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract DemoToken {
    string public name = "Demo Token";
    string public symbol = "DEMO";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    constructor(uint256 supply) {
        totalSupply = supply;
        balanceOf[msg.sender] = supply;
        emit Transfer(address(0), msg.sender, supply);
    }
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(balanceOf[from] >= amount, "insufficient");
        require(allowance[from][msg.sender] >= amount, "not allowed");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}`;

function compile() {
  const input = {
    language: 'Solidity',
    sources: { 'DemoToken.sol': { content: SOURCE } },
    settings: {
      // Target an older EVM so the bytecode runs on Ganache 7.x (no PUSH0/MCOPY,
      // which newer solc defaults emit and older local nodes reject as "invalid
      // opcode" — it broke string getters like symbol()/name()).
      evmVersion: 'paris',
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
    },
  };
  const out = JSON.parse(solc.compile(JSON.stringify(input)));
  if (out.errors) {
    const fatal = out.errors.filter((e) => e.severity === 'error');
    if (fatal.length) { console.error(fatal.map((e) => e.formattedMessage).join('\n')); process.exit(1); }
  }
  const c = out.contracts['DemoToken.sol'].DemoToken;
  return { abi: c.abi, bytecode: '0x' + c.evm.bytecode.object };
}

const account = privateKeyToAccount(DEPLOYER_PK);
const wallet = createWalletClient({ account, chain: hardhat, transport: http(RPC) });
const pub = createPublicClient({ chain: hardhat, transport: http(RPC) });

const { abi, bytecode } = compile();
console.log('Compiled DemoToken. Deploying from', account.address);

const supply = parseUnits('1000000', 18); // 1,000,000 DEMO
const hash = await wallet.deployContract({ abi, bytecode, args: [supply] });
const receipt = await pub.waitForTransactionReceipt({ hash });
const token = receipt.contractAddress;
console.log('Token deployed at', token);

// Seed account #1 with 1,000 DEMO so balances are interesting.
const tHash = await wallet.writeContract({
  address: token, abi, functionName: 'transfer', args: [ACCT1, parseUnits('1000', 18)],
});
await pub.waitForTransactionReceipt({ hash: tHash });

const bal0 = await pub.readContract({ address: token, abi, functionName: 'balanceOf', args: [account.address] });
const bal1 = await pub.readContract({ address: token, abi, functionName: 'balanceOf', args: [ACCT1] });
console.log('Deployer DEMO:', formatUnits(bal0, 18), '| Acct#1 DEMO:', formatUnits(bal1, 18));

const config = {
  rpcUrl: RPC,
  chainId: 31337,
  chain: 'local',
  token: { address: token, symbol: 'DEMO', decimals: 18 },
  deployer: { address: account.address, privateKey: DEPLOYER_PK },
  account1: { address: ACCT1, privateKey: '0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1' },
};
const out = path.resolve(import.meta.dirname, '..', 'local-chain.json');
fs.writeFileSync(out, JSON.stringify(config, null, 2));
console.log('Wrote', out);
