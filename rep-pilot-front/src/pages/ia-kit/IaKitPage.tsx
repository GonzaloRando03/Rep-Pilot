import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Loader2,
  Sparkles,
  User,
  Download,
  CheckCircle2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  postProjectSetup,
  postGenerateKit,
} from "../../shared/lib/ia-kit/projectSetupApi";
import type { ProjectSetupResponse } from "../../shared/lib/ia-kit/projectSetupApi";
import { useTranslation } from "../../shared/hooks/useTranslation";
import "./IaKitPage.css";

type ChatPhase = "idle" | "questions" | "generating" | "done";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function IaKitPage() {
  const t = useTranslation();
  const tc = t.iaKit;

  const [specs, setSpecs] = useState("");
  const [userSpecs, setUserSpecs] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<ChatPhase>("idle");
  const [response, setResponse] = useState<ProjectSetupResponse | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [kitBlobUrl, setKitBlobUrl] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  async function handleSubmitSpecs() {
    if (!specs.trim()) return;
    const submittedSpecs = specs.trim();
    setSpecs("");
    setUserSpecs(submittedSpecs);
    setError(null);
    setMessages([{ role: "user", content: submittedSpecs }]);
    setIsLoading(true);
    scrollToBottom();
    try {
      const result = await postProjectSetup({ specs: submittedSpecs });
      setResponse(result);
      setPhase("questions");
      setCurrentQuestionIdx(0);
      setAnswer("");
      setAnswers([]);
      setMessages([
        { role: "user", content: submittedSpecs },
        { role: "assistant", content: result.mdToRender },
      ]);
      scrollToBottom();
    } catch (err) {
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : tc.error,
      );
    } finally {
      setIsLoading(false);
    }
  }

  function generateSummary(allAnswers: string[]): string {
    if (!response) return "";
    const lines = response.questions.map(
      (q, i) =>
        `**${tc.questionLabel} ${i + 1}:** ${q}\n\n**${tc.answerLabel}:** ${allAnswers[i] || ""}`,
    );
    return `## ${tc.summaryTitle}\n\n${lines.join("\n\n---\n\n")}`;
  }

  function handleAnswerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || !response) return;
    const newAnswers = [...answers, answer.trim()];
    setAnswers(newAnswers);
    setAnswer("");

    if (currentQuestionIdx < response.questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
    scrollToBottom();
  }

  // Trigger kit generation when all questions are answered
  const allAnswered =
    response && currentQuestionIdx >= response.questions.length;

  const handleGenerateKit = useCallback(async () => {
    if (!response || !userSpecs) return;
    setPhase("generating");
    setError(null);
    scrollToBottom();
    try {
      const questionsAndAnswers = response.questions.map((q, i) => ({
        question: q,
        answer: answers[i] || "",
      }));
      const blob = await postGenerateKit({
        specs: userSpecs,
        questionsAndAnswers,
      });
      // Revoke previous URL if any
      if (kitBlobUrl) URL.revokeObjectURL(kitBlobUrl);
      const url = URL.createObjectURL(blob);
      setKitBlobUrl(url);
      setPhase("done");
      scrollToBottom();
    } catch (err) {
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : tc.generationError,
      );
      setPhase("questions");
    }
  }, [response, userSpecs, answers, kitBlobUrl, tc.generationError]);

  useEffect(() => {
    if (allAnswered && phase === "questions") {
      handleGenerateKit();
    }
  }, [allAnswered, phase, handleGenerateKit]);

  function handleDownload() {
    if (!kitBlobUrl) return;
    const a = document.createElement("a");
    a.href = kitBlobUrl;
    a.download = "ia-kit.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="ia-kit-page">
      <div className="ia-kit-chat" role="log" aria-label={tc.chatLabel}>
        {/* System message with prompt */}
        <div className="chat-message chat-message--system">
          <div className="chat-message__avatar" aria-hidden="true">
            <Sparkles size={20} />
          </div>
          <div className="chat-message__content">
            <p>{tc.initialPrompt}</p>
          </div>
        </div>

        {/* Chat messages (user + assistant) */}
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message chat-message--${msg.role}`}>
            <div className="chat-message__avatar" aria-hidden="true">
              {msg.role === "user" ? (
                <User size={20} />
              ) : (
                <Sparkles size={20} />
              )}
            </div>
            <div className="chat-message__content chat-message__content--md">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {/* Current question */}
        {response && !allAnswered && (
          <div className="chat-message chat-message--ai">
            <div className="chat-message__avatar" aria-hidden="true">
              <Sparkles size={20} />
            </div>
            <div className="chat-message__content chat-message__content--md">
              <p className="question-counter">
                {tc.questionLabel} {currentQuestionIdx + 1} /{" "}
                {response.questions.length}
              </p>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {response.questions[currentQuestionIdx]}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Loading state — analyzing specs */}
        {isLoading && (
          <div className="chat-message chat-message--system">
            <div className="chat-message__avatar" aria-hidden="true">
              <Loader2 size={20} className="spin" />
            </div>
            <div className="chat-message__content">
              <p>{tc.analyzing}</p>
            </div>
          </div>
        )}

        {/* Summary when all questions answered */}
        {allAnswered && (
          <div className="chat-message chat-message--ai">
            <div className="chat-message__avatar" aria-hidden="true">
              <Sparkles size={20} />
            </div>
            <div className="chat-message__content chat-message__content--md">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {generateSummary(answers)}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Generating kit loading state */}
        {phase === "generating" && (
          <div className="chat-message chat-message--system">
            <div className="chat-message__avatar" aria-hidden="true">
              <Loader2 size={20} className="spin" />
            </div>
            <div className="chat-message__content">
              <p>{tc.generatingKit}</p>
            </div>
          </div>
        )}

        {/* Kit created success message */}
        {phase === "done" && (
          <div className="chat-message chat-message--success">
            <div className="chat-message__avatar" aria-hidden="true">
              <CheckCircle2 size={20} />
            </div>
            <div className="chat-message__content">
              <p>{tc.kitCreated}</p>
              <button
                type="button"
                className="download-button"
                onClick={handleDownload}
              >
                <Download size={18} />
                <span>{tc.downloadKit}</span>
              </button>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="chat-message chat-message--error" role="alert">
            <div className="chat-message__content">
              <p>{error}</p>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Fixed input area at bottom */}
      <div className="ia-kit-input-area">
        {phase === "idle" && (
          <div className="specs-input-area">
            <textarea
              className="specs-textarea"
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              placeholder={tc.specsPlaceholder}
              rows={5}
              aria-label={tc.specsLabel}
              disabled={isLoading}
            />
            <button
              type="button"
              className="send-button"
              onClick={handleSubmitSpecs}
              disabled={!specs.trim() || isLoading}
              aria-label={tc.sendLabel}
            >
              <Send size={18} />
            </button>
          </div>
        )}

        {response && !allAnswered && (
          <form className="answer-form" onSubmit={handleAnswerSubmit}>
            <div className="specs-input-area">
              <input
                className="answer-input"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={tc.answerPlaceholder}
                aria-label={tc.answerLabel}
                autoFocus
              />
              <button
                type="submit"
                className="send-button send-button--small"
                disabled={!answer.trim()}
                aria-label={tc.sendAnswerLabel}
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
