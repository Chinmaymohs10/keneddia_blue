import { useState, useEffect } from "react";
import {
  MessageCircle,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Send,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createComment, getCommentThread, getCommentsByNews } from "@/Api/Api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiComment {
  id: number;
  name: string;
  message: string;
  adminReply: boolean;
  enabled: boolean;
  createdAt: string;
  replies: ApiComment[];
}

interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

interface NewsCommentProps {
  newsId: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─── User Info Modal ──────────────────────────────────────────────────────────

interface UserInfoModalProps {
  message: string;
  onSubmit: (info: UserInfo) => void;
  onClose: () => void;
}

function UserInfoModal({ message, onSubmit, onClose }: UserInfoModalProps) {
  const [info, setInfo] = useState<UserInfo>({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Partial<UserInfo>>({});

  const validate = () => {
    const e: Partial<UserInfo> = {};
    if (!info.name.trim()) e.name = "Name is required";
    if (!info.email.trim() || !/\S+@\S+\.\S+/.test(info.email))
      e.email = "Valid email required";
    if (!info.phone.trim() || !/^\d{10}$/.test(info.phone))
      e.phone = "10-digit phone required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit(info);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <h3 className="text-lg font-bold text-foreground">Almost there!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please share a few details to post your comment.
          </p>
        </div>

        {/* Preview of message */}
        <div className="bg-secondary/20 border border-border/50 rounded-lg px-4 py-3 mb-5 text-sm text-foreground/70 italic line-clamp-2">
          "{message}"
        </div>

        <div className="space-y-3">
          <div>
            <Input
              placeholder="Your name *"
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
              className={errors.name ? "border-red-400" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Email address *"
              type="email"
              value={info.email}
              onChange={(e) => setInfo({ ...info, email: e.target.value })}
              className={errors.email ? "border-red-400" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Phone number *"
              type="tel"
              value={info.phone}
              onChange={(e) => setInfo({ ...info, phone: e.target.value })}
              className={errors.phone ? "border-red-400" : ""}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        <Button onClick={handleSubmit} className="w-full mt-5 gap-2">
          <Send className="w-4 h-4" /> Post Comment
        </Button>
      </div>
    </div>
  );
}

// ─── Success Toast ─────────────────────────────────────────────────────────────

function SuccessToast({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-3.5 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-300">
      <CheckCircle2 className="w-5 h-5 shrink-0" />
      <div>
        <p className="font-semibold text-sm">Comment submitted!</p>
        <p className="text-xs text-green-100">
          Your comment has been added successfully.
        </p>
      </div>
      <button
        onClick={onClose}
        className="ml-2 text-green-200 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Reply Thread ─────────────────────────────────────────────────────────────

interface ReplyThreadProps {
  commentId: number;
  replyCount: number;
}

function ReplyThread({ commentId, replyCount }: ReplyThreadProps) {
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState<ApiComment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadThread = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getCommentThread(commentId);
      setReplies(res.data?.replies || []);
      setExpanded(true);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (replyCount === 0) return null;

  return (
    <div className="mt-3 ml-4 md:ml-10">
      <button
        onClick={loadThread}
        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mb-3"
      >
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
        {loading
          ? "Loading..."
          : expanded
            ? "Hide replies"
            : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
      </button>

      {expanded && replies.filter((r) => r.enabled).length > 0 && (
        <div className="bg-secondary/20 rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {replies
            .filter((reply) => reply.enabled) // ✅ only show enabled replies
            .map((reply) => (
              <div key={reply.id} className="text-sm flex gap-3">
                <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                  <AvatarFallback
                    className={`text-xs font-bold ${
                      reply.adminReply
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {getInitials(reply.name)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground text-xs">
                      {reply.name}
                      {reply.adminReply && (
                        <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                          Staff
                        </span>
                      )}
                    </span>

                    <span className="text-muted-foreground text-[11px]">
                      {formatDate(reply.createdAt)}
                    </span>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {reply.message}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ─── Single Comment Card ───────────────────────────────────────────────────────

interface CommentCardProps {
  comment: ApiComment;
}

function CommentCard({ comment }: CommentCardProps) {
  return (
    <div className="border-b border-border pb-6 last:border-0 last:pb-0">
      <div className="flex items-start gap-3">
        <Avatar className="w-9 h-9 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
            {getInitials(comment.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {comment.name}
              </span>
              {comment.adminReply && (
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                  Staff
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {comment.message}
          </p>

          <ReplyThread
            commentId={comment.id}
            replyCount={comment.replies?.filter((r) => r.enabled).length ?? 0}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function NewsComment({ newsId }: NewsCommentProps) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Write comment flow
  const [messageText, setMessageText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments on mount
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getCommentsByNews(newsId);
        setComments(res.data || []);
      } catch {
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [newsId]);

  const totalPages = Math.ceil(comments.length / itemsPerPage);
  const currentComments = comments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSendClick = () => {
    if (!messageText.trim()) return;
    setShowModal(true);
  };

  const handleUserInfoSubmit = async (userInfo: UserInfo) => {
    setSubmitting(true);
    try {
      const payload = {
        newsId,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        tags: "NewsSection",
        message: messageText,
      };
      const res = await createComment(payload);
      const newComment: ApiComment = {
        id: res.data?.id ?? Date.now(),
        name: userInfo.name,
        message: messageText,
        adminReply: false,
        enabled: true,
        createdAt: new Date().toISOString(),
        replies: [],
      };
      setComments([newComment, ...comments]);
      setMessageText("");
      setShowModal(false);
      setShowSuccess(true);
      setCurrentPage(1);
    } catch {
      // handle error silently or show inline error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Comments</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </p>
        </div>
      </div>

      {/* Write Comment Box */}
      <div className="bg-secondary/5 rounded-xl p-5 border border-border/50">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
          Leave a Comment
        </h3>
        <Textarea
          placeholder="Share your thoughts on this article..."
          className="min-h-[90px] bg-background resize-none"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <div className="flex justify-end mt-3">
          <Button
            onClick={handleSendClick}
            disabled={!messageText.trim() || submitting}
            className="gap-2"
            size="sm"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </Button>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-secondary shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-secondary rounded w-32" />
                <div className="h-3 bg-secondary rounded w-full" />
                <div className="h-3 bg-secondary rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {currentComments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium mx-2">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* User Info Modal */}
      {showModal && (
        <UserInfoModal
          message={messageText}
          onSubmit={handleUserInfoSubmit}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Success Toast */}
      {showSuccess && <SuccessToast onClose={() => setShowSuccess(false)} />}
    </div>
  );
}
