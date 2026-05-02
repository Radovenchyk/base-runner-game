"use client";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useConnect } from "wagmi";
import { useEffect, useState } from "react";

const CONTRACT_ADDRESS = "0xbA4779267DFB7E0df120FDDAc89a85a293c05f3C" as `0x${string}`;
const ABI = [{ name: "checkIn", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] }] as const;

export function CheckinButton() {
  const { isConnected } = useAccount();
  const { connect, connectors, isError: connectError } = useConnect();
  const { writeContract, data: hash, isPending, isError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const [connectAttempted, setConnectAttempted] = useState(false);

  useEffect(() => {
    if (!isConnected && connectors.length > 0 && !connectAttempted) {
      setConnectAttempted(true);
      connect({ connector: connectors[0] });
    }
  }, [connectors]);

  const btn: React.CSSProperties = {
    padding: "12px 32px", background: "#0052ff", color: "#fff", border: "none",
    borderRadius: 24, fontSize: 16, fontWeight: "bold", cursor: "pointer", margin: 8,
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  if (isSuccess) return (
    <div style={{ textAlign: "center", marginTop: 8 }} onClick={stop}>
      <div style={{ color: "#00aa44", fontWeight: "bold" }}>✅ Check-in виконано!</div>
      <a href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#aaa", fontSize: 13 }}>Переглянути в BaseScan ↗</a>
    </div>
  );

  // В браузері — не підтримується
  if (connectError || (connectAttempted && !isConnected)) return (
    <div style={{ textAlign: "center", color: "#888", fontSize: 13, marginTop: 8 }} onClick={stop}>
      Відкрий у <strong style={{ color: "#0052ff" }}>Base App</strong> для Check-in
    </div>
  );

  if (!isConnected) return (
    <div style={{ textAlign: "center" }} onClick={stop}>
      <button style={{ ...btn, background: "#444" }} disabled>⏳ Підключення...</button>
    </div>
  );

  return (
    <div style={{ textAlign: "center" }} onClick={stop}>
      <button style={{ ...btn, background: isPending || isConfirming ? "#555" : "#0052ff" }}
        onClick={e => { stop(e); reset(); writeContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: "checkIn" }); }}
        disabled={isPending || isConfirming}>
        {isPending ? "⏳ Підписуємо..." : isConfirming ? "⛓️ Підтверджуємо..." : "✅ Check-in"}
      </button>
      {isError && <div style={{ color: "#ff4444", fontSize: 12 }}>Помилка. Спробуй ще раз.</div>}
    </div>
  );
}
