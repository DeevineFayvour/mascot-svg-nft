import { Dispatch, SetStateAction, useEffect } from "react";
import { useDeployedContractInfo, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const NftCard = ({
  id,
  name,
  description,
  setTxLoading,
}: {
  id: number;
  name: string;
  description: string;
  setTxLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  const { data: svg } = useScaffoldContractRead({
    contractName: "Mascot",
    functionName: "renderTokenById",
    args: [BigInt(id)],
  });

  const { data: upgrageIds } = useScaffoldContractRead({
    contractName: "Mascot",
    functionName: "mascotUpgrades",
    args: [BigInt(id)],
  });

  const { data: hatContractData } = useDeployedContractInfo("Hat");
  const { data: scarfContractData } = useDeployedContractInfo("Scarf");
  const hatAddr = hatContractData?.address as string;
  const scarfAddr = scarfContractData?.address as string;

  const hatId = Number((upgrageIds as { hatId?: bigint })?.hatId);
  const scarfId = Number((upgrageIds as { scarfId?: bigint })?.scarfId);

  const { writeAsync: removeHat, isMining: removeHatMining } = useScaffoldContractWrite({
    contractName: "Mascot",
    functionName: "removeNftFromMascot",
    args: [hatAddr, BigInt(id)],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: removeScarf, isMining: removeScarfMining } = useScaffoldContractWrite({
    contractName: "Mascot",
    functionName: "removeNftFromMascot",
    args: [scarfAddr, BigInt(id)],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const svgImage =
    `<svg width="100%"  viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">` +
    svg?.toString() +
    `</svg>`;

  useEffect(() => {
    setTxLoading(true);
    setTxLoading(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [removeHatMining, removeScarfMining]);

  return (
    <div className="h-full border-2 rounded-xl overflow-hidden border-black w-full text-xs">
      <div
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          width: "auto",
          height: "auto",
          overflow: "hidden",
        }}
        dangerouslySetInnerHTML={{ __html: svgImage }}
      />
      {/* <Image src={svgImage} alt="My Image" width={200} height={200} /> */}
      <div className="mt-4 px-4 mb-2">
        <div> {name} </div>
        <div> {description} </div>
      </div>
      {hatId > 0 && (
        <button onClick={() => removeHat()} className="w-full bg-red-300 px-4 py-2  mt-2 hover:bg-red-500">
          Remove Hat
        </button>
      )}
      {scarfId > 0 && (
        <button onClick={() => removeScarf()} className="w-full bg-red-300 px-4 py-2  mt-1 hover:bg-red-500">
          Remove Scarf
        </button>
      )}
    </div>
  );
};
