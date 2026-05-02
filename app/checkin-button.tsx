"use client";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useConnect, useReconnect } from "wagmi";
import { useEffect } from "react";

const CONTRACT_ADDRESS = "0xbA4779267DFB7E0df120FDDAc89a85a293c05f3C" as `0x${string}`;
const ABI = [{ name: "checkIn", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] }] as const;

export function CheckinButton() {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { reconnect } = useReconnect();
  const { writeContract, data: hash, isPending, isError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Авто-підключення при відкритті в Base App
  useEffect(() => {
    reconnect();
  }, []);

  const btn: React.CSSProperties = {
    padding: "12px 32px", background: "#0052ff", color: "#fff", border: "none",
    borderRadius: 24, fontSize: 16, fontWeight: "bold", cursor: "pointer", margin: 8,
    opacity: isPending || isConfirming ? 0.7 : 1
  };

  const handleCheckin = (e: React.MouseEvent) => {
    e.stopPropagation();
    reset();
    writeContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: "checkIn" });
  };

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    connect({ connector: connectors[0] });
  };

  if (isSuccess) return (
    <div style={{ textAlign: "center", marginTop: 8 }} onClick={e => e.stopPropagation()}>
      <div style={{ color: "#00aa44", fontWeight: "bold" }}>✅ Check-in виконано!</div>
      <a href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#aaa", fontSize: 13 }}>Переглянути в BaseScan ↗</a>
    </div>
  );

  if (!isConnected) return (
    <div style={{ textAlign: "center" }} onClick={e => e.stopPropagation()}>
      <button style={btn} onClick={handleConnect}>🔗 Connect Wallet</button>
    </div>
  );

  return (
    <div style={{ textAlign: "center" }} onClick={e => e.stopPropagation()}>
      <button style={{ ...btn, background: isPending || isConfirming ? "#555" : "#0052ff" }}
        onClick={handleCheckin} disabled={isPending || isConfirming}>
        {isPending ? "⏳ Підписуємо..." : isConfirming ? "⛓️ Підтверджуємо..." : "✅ Check-in"}
      </button>
      {isError && <div style={{ color: "#ff4444", fontSize: 12 }}>Помилка. Спробуй ще раз.</div>}
    </div>
  );
}
