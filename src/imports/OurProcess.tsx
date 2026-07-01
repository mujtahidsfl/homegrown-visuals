function ProcessCards() {
  return (
    <div className="absolute contents left-[12px] top-[436px]" data-name="PROCESS CARDS">
      <div className="absolute bg-white h-[499px] left-[12px] rounded-[30px] top-[436px] w-[440px]" />
      <div className="absolute bg-white h-[499px] left-[475px] rounded-[30px] top-[436px] w-[440px]" />
      <div className="absolute bg-white h-[499px] left-[938px] rounded-[30px] top-[436px] w-[440px]" />
    </div>
  );
}

function HeadingBodyForProcess() {
  return (
    <div className="absolute contents leading-[normal] left-[194px] not-italic top-[72.68px]" data-name="HEADING + BODY FOR PROCESS">
      <p className="absolute font-['PP_Neue_Montreal:Medium',sans-serif] left-[calc(50%-93.5px)] text-[#d2a679] text-[32px] top-[72.68px] whitespace-nowrap">How It Works</p>
      <p className="absolute font-['PP_Neue_Montreal:Book',sans-serif] left-[calc(50%-500.5px)] text-[55px] text-black top-[124px] whitespace-nowrap">From Booking to Delivery in 3 Simple Steps.</p>
      <p className="-translate-x-1/2 absolute font-['PP_Neue_Montreal:Book',sans-serif] left-[689.5px] text-[32px] text-black text-center top-[203px] w-[837px]">{`We built our process around one thing — respecting your time. No back-and-forth headaches, no confusing invoices, no wondering where your photos are. Here's how it works.`}</p>
    </div>
  );
}

export default function OurProcess() {
  return (
    <div className="bg-[#ececec] overflow-clip relative rounded-[20px] size-full" data-name="OUR PROCESS">
      <ProcessCards />
      <HeadingBodyForProcess />
    </div>
  );
}