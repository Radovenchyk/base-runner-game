"use client";
import { useConnect, useAccount } from "wagmi";
import { useSendCalls, useCallsStatus } from "wagmi/experimental";
import { coinbaseWallet } from "wagmi/connectors";
import { encodeFunctionData } from "viem";
import { base } from "wagmi/chains";

const CONTRACT_ADDRESS = "0xbA4779267DFB7E0df120FDDAc89a85a293c05f3C" as `0x${string}`;
const PAYMASTER_URL = "https://api.developer.coinbase.com/rpc/v1/base/85OEROoKX4zOsDGeJV36cBDFceojcCND";
const BUILDER_CODE = "0x62635f367439326262707a0b0080218021802180218021802180218021" as `0x${string}`;
const ABI = [{ name: "checkIn", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] }] as const;

const baseConnector = coinbaseWallet({ appName: "Base Runner", preference: "smartWalletOnly" });

export function CheckinButton() {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { sendCalls, data: callsId, isPending } = useSendCalls();
  const callsIdStr = callsId?.id as string | undefined;
  const { data: callsStatus } = useCallsStatus({
    id: callsIdStr!,
    query: {
      enabled: !!callsIdStr,
      refetchInterval: (d: any) => d.state.data?.status === "success" ? false : 1000,
    },
  });

  const isConfirming = callsStatus?.status === "pending";
  const isSuccess = callsStatus?.status === "success";
  const txHash = (callsStatus as any)?.receipts?.[0]?.transactionHash;

  const btn: React.CSSProperties = {
    padding: "12px 32px", background: "#0052ff", color: "#fff", border: "none",
    borderRadius: 24, fontSize: 16, fontWeight: "bold", cursor: "pointer", margin: 8,
    opacity: isPending || isConfirming ? 0.7 : 1,
  };
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const handleConnect = (e: React.MouseEvent) => {
    stop(e);
    const farcaster = connectors.find(c => c.id === "farcasterMiniApp");
    connect({ connector: farcaster || baseConnector });
  };

  const handleCheckin = (e: React.MouseEvent) => {
    stop(e);
    sendCalls({
      calls: [
        {
          to: CONTRACT_ADDRESS,
          data: encodeFunctionData({ abi: ABI, functionName: "checkIn" }),
        },
        // ✅ Builder Code — тегує транзакцію для атрибуції та лідерборду
        {
          to: "0x0000000000000000000000000000000000000000",
          data: BUILDER_CODE,
          value: BigInt(0),
        },
      ],
      capabilities: {
        [base.id]: {
          paymasterService: { url: PAYMASTER_URL },
        },
      },
    });
  };

  if (isSuccess) return (
    <div style={{ textAlign: "center", marginTop: 8 }} onClick={stop}>
      <div style={{ color: "#00aa44", fontWeight: "bold" }}>✅ Check-in виконано!</div>
      {txHash && <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#aaa", fontSize: 13 }}>Переглянути в BaseScan ↗</a>}
    </div>
  );

  if (!isConnected) return (
    <div onClick={stop}>
      <button style={btn} onClick={handleConnect}>🔗 Sign in with Base</button>
    </div>
  );

  return (
    <div style={{ textAlign: "center" }} onClick={stop}>
      <button style={{ ...btn, background: isPending || isConfirming ? "#555" : "#0052ff" }}
        onClick={handleCheckin} disabled={isPending || isConfirming}>
        {isPending ? "⏳ Підписуємо..." : isConfirming ? "⛓️ Підтверджуємо..." : "✅ Check-in"}
      </button>
    </div>
  );
}
