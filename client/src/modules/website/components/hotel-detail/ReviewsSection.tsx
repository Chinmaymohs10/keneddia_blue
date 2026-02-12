
import { useState } from "react";
import { Star, ThumbsUp, MessageCircle, MoreHorizontal, User, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  author: string;
  avatar?: string;
  date: string;
  rating: number;
  content: string;
  likes: number;
  replies?: Comment[];
}

const MOCK_REVIEWS: Comment[] = [
  {
    id: "1",
    author: "Arjun Mehta",
    date: "2 days ago",
    rating: 5,
    content: "Absolutely stunning property! The view of the Gateway of India was mesmerizing. The staff went above and beyond to make our anniversary special.",
    likes: 24,
    replies: [
      {
        id: "1-1",
        author: "Kennedia Guest Relations",
        date: "1 day ago",
        rating: 0,
        content: "Thank you for your kind words, Arjun! We are thrilled to hear you had a memorable anniversary celebration. We hope to welcome you back soon.",
        likes: 5
      }
    ]
  },
  {
    id: "2",
    author: "Sarah Jenkins",
    date: "1 week ago",
    rating: 4,
    content: "Great location and wonderful extensive breakfast spread. The room was spacious and clean. Only drawback was the wait time at check-in during peak hours.",
    likes: 12,
  },
  {
    id: "3",
    author: "Rahul Verma",
    date: "2 weeks ago",
    rating: 5,
    content: "One of the best luxury hotels I've stayed at in India. The heritage feel combined with modern amenities is perfect.",
    likes: 8,
  },
  {
    id: "4",
    author: "Emily Clark",
    date: "3 weeks ago",
    rating: 5,
    content: "The spa is a must-visit! Incredibly relaxing. The concierge helped us book a fantastic private tour of the city.",
    likes: 15,
  },
];

export default function ReviewsSection() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);

  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  const currentReviews = reviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddReview = () => {
    if (!newComment.trim()) return;

    const newReview: Comment = {
      id: `new-${Date.now()}`,
      author: "Guest User", // In a real app, from auth context
      date: "Just now",
      rating: newRating,
      content: newComment,
      likes: 0,
      replies: []
    };

    setReviews([newReview, ...reviews]);
    setNewComment("");
    setNewRating(5);
  };

  const handleReplySubmit = (reviewId: string) => {
    if (!replyText.trim()) return;

    // Optimistic update
    const updatedReviews = reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          replies: [
            ...(review.replies || []),
            {
              id: `${review.id}-${Date.now()}`,
              author: "You",
              date: "Just now",
              rating: 0,
              content: replyText,
              likes: 0
            }
          ]
        };
      }
      return review;
    });

    setReviews(updatedReviews);
    setReplyingTo(null);
    setReplyText("");
  };

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold">Guest Reviews</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center text-yellow-500">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
            </div>
            <span className="text-lg font-bold">4.9/5</span>
            <span className="text-muted-foreground text-sm">• Based on 1,240 reviews</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Sort by: <span className="font-semibold">Recent</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Recent</DropdownMenuItem>
              <DropdownMenuItem>Highest Rated</DropdownMenuItem>
              <DropdownMenuItem>Lowest Rated</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Add Review Box - NEW */}
      <div className="bg-secondary/5 rounded-xl p-6 border border-border/50">
        <h3 className="font-bold text-lg mb-4">Write a Review</h3>
        <div className="space-y-4">
          <Textarea
            placeholder="Share your experience about your stay..."
            className="min-h-[100px] bg-background"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium mr-2">Your Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setNewRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                  <Star className={`w-5 h-5 ${star <= newRating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <Button onClick={handleAddReview} disabled={!newComment.trim()}>Submit Review</Button>
          </div>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-6">
        {currentReviews.map((review) => (
          <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {review.author[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-foreground">{review.author}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">
                {review.rating} <Star className="w-3 h-3 fill-current" />
              </div>
            </div>

            {/* Content */}
            <p className="text-sm text-foreground/80 leading-relaxed mb-4">
              {review.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
              <button className="flex items-center gap-1 hover:text-foreground">
                <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({review.likes})
              </button>
              <button
                className="flex items-center gap-1 hover:text-foreground"
                onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
              >
                <MessageCircle className="w-3.5 h-3.5" /> Reply
              </button>
              <button className="ml-auto hover:text-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Reply Input */}
            {replyingTo === review.id && (
              <div className="mb-4 pl-4 border-l-2 border-border animate-in fade-in slide-in-from-top-2">
                <Textarea
                  placeholder="Write a reply..."
                  className="mb-2 text-sm"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
                  <Button size="sm" onClick={() => handleReplySubmit(review.id)}>Submit Reply</Button>
                </div>
              </div>
            )}

            {/* Nested Replies */}
            {review.replies && review.replies.length > 0 && (
              <div className="bg-secondary/20 rounded-lg p-4 ml-4 md:ml-10 space-y-4">
                {review.replies.map(reply => (
                  <div key={reply.id} className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-foreground flex items-center gap-1">
                        {reply.author === "Kennedia Guest Relations" && <div className="w-2 h-2 bg-primary rounded-full" />}
                        {reply.author}
                      </span>
                      <span className="text-muted-foreground text-xs">• {reply.date}</span>
                    </div>
                    <p className="text-muted-foreground">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium mx-2">Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
