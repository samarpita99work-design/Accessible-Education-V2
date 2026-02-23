import { useState } from "react";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { messageThreads, messages, formatTimeAgo } from "@/lib/mock-data";
import { Send } from "lucide-react";

export default function MessagesPage() {
  const [selectedThread, setSelectedThread] = useState(messageThreads[0]?.id || "");
  const [newMessage, setNewMessage] = useState("");

  const thread = messageThreads.find((t) => t.id === selectedThread);
  const threadMessages = messages.filter((m) => m.threadId === selectedThread);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Messages" />
      <main id="main-content" className="flex-1 overflow-hidden p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] h-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full" style={{ maxHeight: "calc(100vh - 130px)" }}>
            <div className="md:col-span-1 space-y-2 overflow-auto">
              <h2 className="font-serif text-sm font-semibold mb-2">Conversations</h2>
              {messageThreads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedThread(t.id)}
                  className={`w-full text-left rounded-md border p-3 space-y-1 transition-colors ${
                    selectedThread === t.id ? "border-primary bg-accent" : "border-border"
                  }`}
                  data-testid={`thread-${t.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{t.courseName}</span>
                    {t.unreadCount > 0 && (
                      <Badge className="no-default-active-elevate text-[10px] bg-[#9CD5FF] text-[#355872]">
                        {t.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t.lastMessage}</p>
                  <p className="text-[11px] text-muted-foreground">{formatTimeAgo(t.lastMessageTime)}</p>
                </button>
              ))}
            </div>

            <div className="md:col-span-2 flex flex-col rounded-md border bg-card">
              {thread ? (
                <>
                  <div className="border-b p-3">
                    <h3 className="text-sm font-semibold">{thread.courseName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {thread.participants.map((p) => p.name).join(", ")}
                    </p>
                  </div>
                  <div
                    className="flex-1 overflow-auto p-4 space-y-3"
                    role="log"
                    aria-live="polite"
                    aria-label="Messages"
                  >
                    {threadMessages.map((m) => {
                      const isOwn = m.senderRole === "student";
                      return (
                        <div
                          key={m.id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          data-testid={`message-${m.id}`}
                        >
                          <div className={`max-w-[75%] rounded-md p-3 ${isOwn ? "bg-[#EBF4FB]" : "bg-accent"}`}>
                            <p className="text-xs font-medium mb-1">{m.senderName}</p>
                            <p className="text-sm">{m.content}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">{formatTimeAgo(m.timestamp)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t p-3">
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="min-h-[40px] resize-none"
                        aria-label="Type a message"
                        data-testid="textarea-message"
                      />
                      <Button size="icon" disabled={!newMessage.trim()} data-testid="button-send-message">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  Select a conversation
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
