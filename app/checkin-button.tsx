"use client";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

const CONTRACT_ADDRESS = "0xbA4779267DFB7E0df120FDDAc89a85a293c05f3C" as `0x${string}`;
const ABI = [{ name: "checkIn", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] }] as const;

export function CheckinButton() {
  const { writeContract, data: hash, isPending, isError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleCheckin = (e: React.MouseEvent) => {
    e.stopPropagation();
    writeContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: "checkIn" });
  };

  const btn: React.CSSProperties = { padding: "12px 32px", background: isSuccess ? "#00aa44" : "#0052ff", color: "#fff", border: "none", borderRadius: 24, fontSize: 16, fontWeight: "bold", cursor: "pointer", margin: 8, opacity: isPending || isConfirming ? 0.7 : 1 };

  if (isSuccess) return (
    <div style={{ textAlign: "center", marginTop: 8 }}>
      <div style={{ color: "#00aa44", fontWeight: "bold" }}>✅ Check-in виконано!</div>
      <a href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: "#aaa", fontSize: 13 }}>Переглянути в BaseScan ↗</a>
    </div>
  );

  return (
    <div style={{ textAlign: "center" }}>
      <button style={btn} onClick={handleCheckin} disabled={isPending || isConfirming}>
        {isPending ? "⏳ Підписуємо..." : isConfirming ? "⛓️ Підтверджуємо..." : "✅ Check-in"}
      </button>
      {isError && <div style={{ color: "#ff4444", fontSize: 12 }}>Помилка. Спробуй ще раз.</div>}
    </div>
  );
}
