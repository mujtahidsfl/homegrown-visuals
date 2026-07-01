import { useMemo, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { askWebsiteAssistant, type ChatAction, type ChatTurn } from "../chatbot/assistant";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  actions?: ChatAction[];
};

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingBookingHref, setPendingBookingHref] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hey there! Welcome to Homegrown Visuals — I’m HGV Assistant. I can help with services, pricing, coverage area, turnaround times, and booking.",
      actions: [
        { label: "Pricing", kind: "ask", prompt: "Show me pricing." },
        { label: "Book with us", kind: "link", href: "/services" },
      ],
    },
  ]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const sendWithText = async (userText: string) => {
    if (!userText.trim() || loading) return;
    const nextMessages = [...messages, { role: "user" as const, text: userText }];
    setMessages(nextMessages);
    setLoading(true);

    const history: ChatTurn[] = nextMessages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.text,
    }));

    const reply = await askWebsiteAssistant(userText, history);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: reply.answer,
        actions: reply.actions,
      },
    ]);
    setLoading(false);
  };

  const send = async () => {
    if (!canSend) return;
    const userText = input.trim();
    setInput("");
    await sendWithText(userText);
  };

  const onActionClick = async (action: ChatAction) => {
    if (action.kind === "consent") {
      if (action.consentChoice === "yes" && pendingBookingHref) {
        window.location.href = pendingBookingHref;
        return;
      }

      setPendingBookingHref(null);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "No problem. I can still answer package details and pricing here whenever you're ready.",
        },
      ]);
      return;
    }

    if (action.kind === "ask" && action.prompt) {
      await sendWithText(action.prompt);
      return;
    }

    if (!action.href) return;

    if (action.href.startsWith("/book/") || /book/i.test(action.label)) {
      setPendingBookingHref(action.href);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Before we proceed, do you consent to receive messages about your booking?",
          actions: [
            { label: "Yes", kind: "consent", consentChoice: "yes" },
            { label: "No", kind: "consent", consentChoice: "no" },
          ],
        },
      ]);
      return;
    }

    window.location.href = action.href;
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[140] w-[92vw] max-w-[390px] h-[560px] max-h-[72vh] rounded-[18px] border border-[#d9e2ef] bg-white shadow-[0_20px_50px_rgba(18,35,64,0.22)] flex flex-col overflow-hidden">
          <div className="h-14 px-4 border-b border-[#e4ebf5] flex items-center justify-between bg-[#f6faff]">
            <p className="text-[#1F3A5F] text-[14px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>
              HGV Assistant
            </p>
            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-[#e9f1fb] flex items-center justify-center">
              <X size={16} className="text-[#1F3A5F]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-[#fbfdff]">
            {messages.map((m, idx) => (
              <div key={idx} className={`max-w-[92%] ${m.role === "user" ? "ml-auto" : ""}`}>
                <div
                  className={`rounded-[14px] px-3 py-2.5 text-[13px] whitespace-pre-line ${
                    m.role === "user" ? "bg-[#1F3A5F] text-white" : "bg-[#eef4fb] text-[#1F3A5F]"
                  }`}
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.45 }}
                >
                  {m.text}
                </div>
                {m.actions && m.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.actions.map((a) => (
                      <button
                        key={a.label}
                        onClick={() => {
                          void onActionClick(a);
                        }}
                        className="h-8 px-3 rounded-full border border-[#c9d6e7] text-[#1F3A5F] text-[12px] hover:bg-[#f1f6fc]"
                        style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="max-w-[92%]">
                <div className="rounded-[14px] px-3 py-2.5 text-[13px] bg-[#eef4fb] text-[#1F3A5F]">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#e4ebf5] p-3 bg-white">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void send();
                }}
                placeholder="Ask anything about our services..."
                className="flex-1 h-10 rounded-full border border-[#d4deec] px-4 text-[13px] outline-none focus:border-[#2FA4A9]"
                style={{ fontFamily: "'Satoshi', sans-serif" }}
              />
              <button
                onClick={() => void send()}
                disabled={!canSend}
                className="w-10 h-10 rounded-full bg-[#1F3A5F] text-white disabled:opacity-40 flex items-center justify-center"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-[#6b7891]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}>
              For SMS notifications, consent is managed only in booking forms. Reply STOP to opt out, HELP for help.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-4 sm:right-6 z-[140] w-14 h-14 rounded-full bg-[#1F3A5F] text-white shadow-[0_10px_25px_rgba(31,58,95,0.35)] hover:bg-[#18314f] flex items-center justify-center"
        aria-label="Open AI chat assistant"
      >
        {open ? <X size={20} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}
