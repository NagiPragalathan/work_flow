/**
 * Web3 node executors (viem). The on-chain half of "n8n for Web3".
 *
 * Node types:
 *   web3-wallet          - config node: exposes an account/signer to downstream nodes
 *   web3-get-balance     - read native balance of an address
 *   web3-read-contract   - call a view/pure contract function
 *   web3-write-contract  - send a state-changing contract transaction
 *   web3-send-transaction- send native currency
 *   web3-erc20-transfer  - transfer an ERC-20 token
 *   web3-ens             - resolve ENS name <-> address
 *   web3-sign-message    - sign a message with the wallet
 *   web3-event-trigger   - fetch recent logs for a contract event (trigger)
 */
import { formatEther, parseEther, parseUnits, formatUnits, isAddress } from "viem";
import { BaseNodeExecutor, NodeExecutionError } from "../base";
import type { ExecContext, NodeInputs, NodeResult } from "../types";
import {
  getPublicClient,
  getWalletClient,
  getAccount,
  parseAbi,
  jsonSafe,
  ERC20_ABI,
} from "../web3";

function asObject(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

export class Web3NodeExecutor extends BaseNodeExecutor {
  async execute(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    switch (this.nodeType) {
      case "web3-wallet":
        return this.wallet(context);
      case "web3-get-balance":
        return this.getBalance(inputs);
      case "web3-read-contract":
        return this.readContract(inputs);
      case "web3-write-contract":
        return this.writeContract(inputs, context);
      case "web3-send-transaction":
        return this.sendTransaction(inputs, context);
      case "web3-erc20-transfer":
        return this.erc20Transfer(inputs, context);
      case "web3-ens":
        return this.ens(inputs);
      case "web3-sign-message":
        return this.signMessage(inputs, context);
      case "web3-event-trigger":
        return this.eventTrigger(context);
      default:
        throw new NodeExecutionError(`Unknown web3 node type: ${this.nodeType}`);
    }
  }

  /** Resolve a private key from connected wallet input, node prop, or credentials. */
  private resolvePrivateKey(inputs: NodeInputs, context: ExecContext): string {
    const walletInput = asObject(inputs.wallet);
    const key =
      (walletInput.private_key as string) ||
      this.getProperty<string>("privateKey", "") ||
      (context.credentials?.web3_private_key as string) ||
      (process.env.WEB3_PRIVATE_KEY as string);
    if (!key) {
      throw new NodeExecutionError(
        "No private key provided. Connect a Wallet node or set the privateKey property."
      );
    }
    return key;
  }

  private chainAndRpc(inputs: NodeInputs): { chain: string; rpc: string } {
    const walletInput = asObject(inputs.wallet);
    const chain =
      this.getProperty<string>("chain", "") || (walletInput.chain as string) || "ethereum";
    const rpc = this.getProperty<string>("rpcUrl", "") || (walletInput.rpc_url as string) || "";
    return { chain, rpc };
  }

  private parseArgs(): unknown[] {
    const raw = this.getProperty<unknown>("args", []);
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string" && raw.trim()) {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [raw];
      }
    }
    return [];
  }

  private wallet(context: ExecContext): NodeResult {
    const privateKey =
      this.getProperty<string>("privateKey", "") ||
      (context.credentials?.web3_private_key as string) ||
      (process.env.WEB3_PRIVATE_KEY as string);
    const chain = this.getProperty<string>("chain", "ethereum");
    const rpcUrl = this.getProperty<string>("rpcUrl", "");
    let address = "";
    if (privateKey) {
      try {
        address = getAccount(privateKey).address;
      } catch {
        throw new NodeExecutionError("Invalid private key");
      }
    }
    this.logExecution(`Wallet configured for ${chain}${address ? ` (${address})` : ""}`);
    return {
      main: {
        node_type: "web3-wallet",
        address,
        chain,
        rpc_url: rpcUrl,
        private_key: privateKey, // passed to downstream signer nodes only
      },
    };
  }

  private async getBalance(inputs: NodeInputs): Promise<NodeResult> {
    const { chain, rpc } = this.chainAndRpc(inputs);
    const address =
      this.getProperty<string>("address", "") ||
      (asObject(inputs.main).address as string) ||
      (asObject(inputs.wallet).address as string);
    if (!address || !isAddress(address)) {
      throw new NodeExecutionError("A valid address is required");
    }
    const client = getPublicClient(chain, rpc);
    const wei = await client.getBalance({ address: address as `0x${string}` });
    this.logExecution(`Balance of ${address}: ${formatEther(wei)} (${chain})`);
    return {
      main: { address, chain, balance_wei: wei.toString(), balance: formatEther(wei) },
    };
  }

  private async readContract(inputs: NodeInputs): Promise<NodeResult> {
    const { chain, rpc } = this.chainAndRpc(inputs);
    const address = this.getProperty<string>("contractAddress", "");
    const functionName = this.getProperty<string>("functionName", "");
    const abi = parseAbi(this.getProperty("abi", []));
    if (!address || !isAddress(address)) throw new NodeExecutionError("A valid contractAddress is required");
    if (!functionName) throw new NodeExecutionError("functionName is required");
    if (!abi.length) throw new NodeExecutionError("A contract ABI is required");

    const client = getPublicClient(chain, rpc);
    const result = await client.readContract({
      address: address as `0x${string}`,
      abi,
      functionName,
      args: this.parseArgs(),
    });
    this.logExecution(`Read ${functionName} on ${address}`);
    return { main: { result: jsonSafe(result), function: functionName, contract: address, chain } };
  }

  private async writeContract(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    const { chain, rpc } = this.chainAndRpc(inputs);
    const address = this.getProperty<string>("contractAddress", "");
    const functionName = this.getProperty<string>("functionName", "");
    const abi = parseAbi(this.getProperty("abi", []));
    if (!address || !isAddress(address)) throw new NodeExecutionError("A valid contractAddress is required");
    if (!functionName) throw new NodeExecutionError("functionName is required");
    if (!abi.length) throw new NodeExecutionError("A contract ABI is required");

    const pk = this.resolvePrivateKey(inputs, context);
    const { wallet, account } = getWalletClient(pk, chain, rpc);
    const valueEth = this.getProperty<string>("value", "");
    const hash = await wallet.writeContract({
      address: address as `0x${string}`,
      abi,
      functionName,
      args: this.parseArgs(),
      account,
      chain: wallet.chain,
      value: valueEth ? parseEther(String(valueEth)) : undefined,
    });
    this.logExecution(`Sent ${functionName} tx: ${hash}`);
    return {
      main: { tx_hash: hash, function: functionName, contract: address, chain, from: account.address },
    };
  }

  private async sendTransaction(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    const { chain, rpc } = this.chainAndRpc(inputs);
    const to =
      this.getProperty<string>("to", "") || (asObject(inputs.main).to as string);
    const amount = this.getProperty<string>("value", "0");
    if (!to || !isAddress(to)) throw new NodeExecutionError("A valid recipient 'to' address is required");

    const pk = this.resolvePrivateKey(inputs, context);
    const { wallet, account } = getWalletClient(pk, chain, rpc);
    const hash = await wallet.sendTransaction({
      account,
      chain: wallet.chain,
      to: to as `0x${string}`,
      value: parseEther(String(amount)),
    });
    this.logExecution(`Sent ${amount} native to ${to}: ${hash}`);
    return { main: { tx_hash: hash, to, value: amount, chain, from: account.address } };
  }

  private async erc20Transfer(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    const { chain, rpc } = this.chainAndRpc(inputs);
    const token = this.getProperty<string>("token", "");
    const to = this.getProperty<string>("to", "") || (asObject(inputs.main).to as string);
    const amount = this.getProperty<string>("amount", "0");
    if (!token || !isAddress(token)) throw new NodeExecutionError("A valid ERC-20 token address is required");
    if (!to || !isAddress(to)) throw new NodeExecutionError("A valid recipient 'to' address is required");

    const pk = this.resolvePrivateKey(inputs, context);
    const pub = getPublicClient(chain, rpc);
    const decimals = (await pub.readContract({
      address: token as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "decimals",
    })) as number;

    const { wallet, account } = getWalletClient(pk, chain, rpc);
    const hash = await wallet.writeContract({
      address: token as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [to as `0x${string}`, parseUnits(String(amount), decimals)],
      account,
      chain: wallet.chain,
    });
    this.logExecution(`ERC-20 transfer ${amount} to ${to}: ${hash}`);
    return { main: { tx_hash: hash, token, to, amount, chain, from: account.address } };
  }

  private async ens(inputs: NodeInputs): Promise<NodeResult> {
    const client = getPublicClient("ethereum");
    const name = this.getProperty<string>("name", "") || (asObject(inputs.main).name as string);
    const address =
      this.getProperty<string>("address", "") || (asObject(inputs.main).address as string);
    if (name) {
      const resolved = await client.getEnsAddress({ name });
      return { main: { name, address: resolved } };
    }
    if (address && isAddress(address)) {
      const resolved = await client.getEnsName({ address: address as `0x${string}` });
      return { main: { address, name: resolved } };
    }
    throw new NodeExecutionError("Provide an ENS name or an address to resolve");
  }

  private async signMessage(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    const message =
      this.getProperty<string>("message", "") ||
      (asObject(inputs.main).text as string) ||
      (asObject(inputs.main).message as string);
    if (!message) throw new NodeExecutionError("A message to sign is required");
    const pk = this.resolvePrivateKey(inputs, context);
    const account = getAccount(pk);
    const signature = await account.signMessage({ message });
    return { main: { message, signature, address: account.address } };
  }

  private async eventTrigger(context: ExecContext): Promise<NodeResult> {
    const chain = this.getProperty<string>("chain", "ethereum");
    const rpc = this.getProperty<string>("rpcUrl", "");
    const address = this.getProperty<string>("contractAddress", "");
    const eventName = this.getProperty<string>("eventName", "");
    const abi = parseAbi(this.getProperty("abi", []));
    const blockRange = BigInt(this.getProperty<number>("blockRange", 1000));
    if (!address || !isAddress(address)) throw new NodeExecutionError("A valid contractAddress is required");

    const client = getPublicClient(chain, rpc);
    const latest = await client.getBlockNumber();
    const fromBlock = latest > blockRange ? latest - blockRange : 0n;
    const eventAbi = abi.find(
      (i) => i.type === "event" && (!eventName || i.name === eventName)
    );

    const logs = await client.getLogs({
      address: address as `0x${string}`,
      event: eventAbi as never,
      fromBlock,
      toBlock: latest,
    });
    this.logExecution(`Found ${logs.length} ${eventName || "event"} logs on ${address}`);
    return {
      main: {
        event: eventName,
        contract: address,
        chain,
        count: logs.length,
        logs: jsonSafe(logs),
        from_block: fromBlock.toString(),
        to_block: latest.toString(),
      },
    };
  }
}

// Re-export for convenience.
export { formatUnits };
