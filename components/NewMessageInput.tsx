"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewMessageInput({
  onSend,
  onTyping,
  disabled
}: {
  onSend: (text: string) => Promise<void>;
  onTyping: () => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text || sending || disabled) return;

    setSending(true);
    setValue("");
    try {
      await onSend(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="flex gap-2 border-t bg-card p-3" onSubmit={submit}>
      <Input
        aria-label="Message"
        disabled={disabled || sending}
        onChange={(e) => {
          setValue(e.target.value);
          onTyping();
        }}
        placeholder="Type a message"
        value={value}
      />
      <Button disabled={disabled || sending || !value.trim()} type="submit">
        Send
      </Button>
    </form>
  );
}
