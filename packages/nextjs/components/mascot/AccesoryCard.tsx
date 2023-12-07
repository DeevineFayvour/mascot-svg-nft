import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const AccessoryCard = ({
  id,
  name,
  description,
  accountAddr,
  mascotAddr,
  accessoryName,
  setTxLoading,
}: {
  id: number;
  name: string;
  description: string;
  accountAddr: string;
  mascotAddr: string;
  accessoryName: string;
  setTxLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mascotId, setMascotId] = useState("");
  const [mascotIdBytes, setMascotIdBytes] = useState("");

  const { writeAsync: Upgrade, isMining: UpgradeMining } = useScaffoldContractWrite({
    contractName: accessoryName === "Hat" ? "Hat" : "Scarf",
    functionName: "safeTransferFrom",
    args: [accountAddr, mascotAddr, BigInt(id), mascotIdBytes],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { data: svg } = useScaffoldContractRead({
    contractName: accessoryName === "Hat" ? "Hat" : "Scarf",
    functionName: "renderTokenById",
    args: [BigInt(id)],
  });

  const svgImage =
    `<svg width="100%"  viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">` +
    svg?.toString() +
    `</svg>`;

  useEffect(() => {
    const IdBytes =
      "0x" +
      parseInt(mascotId as string)
        .toString(16)
        .padStart(64, "0");
    setMascotIdBytes(IdBytes);
  }, [mascotId]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopup();
      }
    };

    const handleOverlayClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isOverlayClicked = target.classList?.contains("bg-gray-900");

      if (isOverlayClicked) {
        closePopup();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      document.addEventListener("mousedown", handleOverlayClick);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("mousedown", handleOverlayClick);
    };
  }, [isOpen]);

  const openPopup = () => {
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    setTxLoading(UpgradeMining);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [UpgradeMining]);

  return (
    <div className="border-2 rounded-xl overflow-hidden border-black w-fit text-xs bg-base-200 h-full">
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
      <div className="mt-4 px-4 mb-2">
        <div> {name} </div>
        <div> {description} </div>
      </div>
      <button className=" w-full bg-orange-300 p-4 hover:bg-orange-500 mt-2" onClick={openPopup}>
        Add to mascot
      </button>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className=" absolute bg-base-200 p-8 rounded shadow">
            <button className="absolute right-0 top-0 m-4 text-gray-500 hover:text-gray-700" onClick={closePopup}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-md mb-4">Enter Your Mascot Id</h2>
            <input
              className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400  border-black"
              placeholder={"Token Id"}
              // name={name}
              // value={value?.toString()}
              onChange={event => {
                setMascotId(event.target.value);
              }}
              // disabled={disabled}
              // autoComplete="off"
            />
            <button onClick={() => Upgrade()} className="w-full bg-base-300 mt-2 rounded-full py-3 text-md">
              Upgrade
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
