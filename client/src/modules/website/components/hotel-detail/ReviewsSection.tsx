import { useState, useEffect } from "react";
import { Star, MessageCircle, ChevronDown, ChevronUp, Send, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createComment, getCommentThread, getCommentsByProperty } from "@/Api/Api";

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

interface ReviewsSectionProps {
  propertyId: number | null;
}

function filterEnabledReplies(replies: ApiComment[] = []): ApiComment[] {
  return replies
    .filter((reply) => reply?.enabled !== false)
    .map((reply) => ({
      ...reply,
      replies: filterEnabledReplies(reply.replies || []),
    }));
}

function filterEnabledComments(comments: ApiComment[] = []): ApiComment[] {
  return comments
    .filter((comment) => comment?.enabled !== false)
    .map((comment) => ({
      ...comment,
      replies: filterEnabledReplies(comment.replies || []),
    }));
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
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

// Extract rating prefix from message e.g. "[5★] Great stay!" → { rating: 5, text: "Great stay!" }
function parseMessage(message: string): { rating: number | null; text: string } {
  const match = message.match(/^\[(\d)★\]\s*/);
  if (match) {
    return { rating: parseInt(match[1]), text: message.slice(match[0].length) };
  }
  return { rating: null, text: message };
}

function buildMessage(rating: number, text: string): string {
  return `[${rating}★] ${text}`;
}

// ─── Star Rating Display ──────────────────────────────────────────────────────

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

// ─── User Info Modal ──────────────────────────────────────────────────────────

interface UserInfoModalProps {
  message: string;
  rating: number;
  onSubmit: (info: UserInfo) => void;
  onClose: () => void;
}

function UserInfoModal({ message, rating, onSubmit, onClose }: UserInfoModalProps) {
  const [info, setInfo] = useState<UserInfo>({ name: "", email: "", phone: "" });
  const [formError, setFormError] = useState("");

  const setField = (field: keyof UserInfo, value: string) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
    setFormError("");
  };

  const validate = (): boolean => {
    const emailValid = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(info.email.trim());
    const phoneValid = /^\d{10}$/.test(info.phone.trim());
    if (!info.name.trim()) { setFormError("Full name is required."); return false; }
    if (!info.email.trim()) { setFormError("Email address is required."); return false; }
    if (!emailValid) { setFormError("Please enter a valid email address (e.g. name@example.com)."); return false; }
    if (!info.phone.trim()) { setFormError("Phone number is required."); return false; }
    if (!phoneValid) { setFormError("Phone number must be exactly 10 digits."); return false; }
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <h3 className="text-lg font-bold text-foreground">Almost there!</h3>
          <p className="text-sm text-muted-foreground mt-1">Please share a few details to post your review.</p>
        </div>

        {/* Preview */}
        <div className="bg-secondary/20 border border-border/50 rounded-lg px-4 py-3 mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`} />
            ))}
          </div>
          <p className="text-sm text-foreground/70 italic line-clamp-2">"{message}"</p>
        </div>

        <div className="space-y-3">
          <Input
            placeholder="Full name *"
            value={info.name}
            onChange={(e) => setField("name", e.target.value)}
          />
          <Input
            placeholder="Email address *"
            type="email"
            value={info.email}
            onChange={(e) => setField("email", e.target.value)}
          />
          <Input
            placeholder="Phone number * (10 digits)"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={info.phone}
            onChange={(e) => setField("phone", e.target.value.replace(/\D/g, ""))}
          />
          {formError && <p className="text-xs text-red-500 font-medium">{formError}</p>}
        </div>

        <Button onClick={() => { if (validate()) onSubmit(info); }} className="w-full mt-5 gap-2">
          <Send className="w-4 h-4" /> Post Review
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
        <p className="font-semibold text-sm">Review submitted!</p>
        <p className="text-xs text-green-100">Your review has been added successfully.</p>
      </div>
      <button onClick={onClose} className="ml-2 text-green-200 hover:text-white">
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

  if (replyCount === 0) return null;

  const loadThread = async () => {
    if (expanded) { setExpanded(false); return; }
    setLoading(true);
    try {
      const res = await getCommentThread(commentId);
      setReplies(filterEnabledReplies(res.data?.replies || []));
      setExpanded(true);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 ml-4 md:ml-10">
      <button
        onClick={loadThread}
        disabled={replyCount === 0}
        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mb-3 disabled:opacity-50 disabled:cursor-default disabled:no-underline"
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {loading ? "Loading..." : expanded ? "Hide replies" : `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
      </button>

      {expanded && replies.length > 0 && (
        <div className="bg-secondary/20 rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {replies.map((reply) => (
            <div key={reply.id} className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  {reply.adminReply && <div className="w-2 h-2 bg-primary rounded-full" />}
                  {reply.name}
                </span>
                <span className="text-muted-foreground text-xs">• {formatDate(reply.createdAt)}</span>
              </div>
              <p className="text-muted-foreground">{reply.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Single Review Card ───────────────────────────────────────────────────────

interface ReviewCardProps {
  comment: ApiComment;
}

function ReviewCard({ comment }: ReviewCardProps) {
  const { rating, text } = parseMessage(comment.message);

  return (
    <div className="border-b border-border pb-6 last:border-0 last:pb-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {getInitials(comment.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-bold text-foreground">{comment.name}</p>
            <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
          </div>
        </div>
        {rating !== null && (
          <div className="flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">
            {rating} <Star className="w-3 h-3 fill-current" />
          </div>
        )}
      </div>

      {rating !== null && (
        <div className="mb-2">
          <StarDisplay rating={rating} />
        </div>
      )}

      <p className="text-sm text-foreground/80 leading-relaxed mb-2">{text}</p>

      <ReplyThread
        commentId={comment.id}
        replyCount={(comment.replies || []).filter((reply) => reply?.enabled !== false).length}
      />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ReviewsSection({ propertyId }: ReviewsSectionProps) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Write review flow
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getCommentsByProperty(propertyId);
        setComments(filterEnabledComments(res.data || []));
      } catch {
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [propertyId]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(comments.length / itemsPerPage));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [comments.length, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(comments.length / itemsPerPage);
  const currentComments = comments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmitClick = () => {
    if (!newComment.trim()) return;
    setShowModal(true);
  };

  const handleUserInfoSubmit = async (userInfo: UserInfo) => {
    if (!propertyId) return;
    setSubmitting(true);
    try {
      const payload = {
        propertyId,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        tags: "PropertyReview",
        message: buildMessage(newRating, newComment),
      };
      const res = await createComment(payload);
      const newEntry: ApiComment = {
        id: res.data?.id ?? Date.now(),
        name: userInfo.name,
        message: buildMessage(newRating, newComment),
        adminReply: false,
        enabled: true,
        createdAt: new Date().toISOString(),
        replies: [],
      };
      setComments([newEntry, ...comments]);
      setNewComment("");
      setNewRating(5);
      setShowModal(false);
      setShowSuccess(true);
      setCurrentPage(1);
    } catch {
      // handle silently
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold">Guest Reviews</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {comments.length} {comments.length === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {/* Write Review Box */}
      <div className="bg-secondary/5 rounded-xl p-6 border border-border/50">
        <h3 className="font-bold text-lg mb-4">Write a Review</h3>
        <div className="space-y-4">
          <Textarea
            placeholder="Share your experience about your stay..."
            className="min-h-[100px] bg-background resize-none"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium mr-2">Your Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star className={`w-5 h-5 ${star <= newRating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <Button onClick={handleSubmitClick} disabled={!newComment.trim() || submitting} className="gap-2">
              <Send className="w-3.5 h-3.5" /> Submit Review
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
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
          <p className="text-sm">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {currentComments.map((comment) => (
            <ReviewCard key={comment.id} comment={comment} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            Previous
          </Button>
          <span className="text-sm font-medium mx-2">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      )}

      {/* User Info Modal */}
      {showModal && (
        <UserInfoModal
          message={newComment}
          rating={newRating}
          onSubmit={handleUserInfoSubmit}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Success Toast */}
      {showSuccess && <SuccessToast onClose={() => setShowSuccess(false)} />}
    </div>
  );
}
